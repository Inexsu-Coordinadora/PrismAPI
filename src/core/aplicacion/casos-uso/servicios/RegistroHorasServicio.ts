// la forma que tiene un registro de horas
import { IRegistroHoras } from "../../../dominio/servicios/IRegistroHoras";

// repositorios que se requieren (interfaces de dominio)
import { IRegistroHorasRepositorio } from "../../../dominio/repositorio/servicios/IRegistroHorasRepositorio";
import { IConsultorRepositorio } from "../../../dominio/repositorio/entidades/IConsultorRepositorio";
import { IProyectoRepositorio } from "../../../dominio/repositorio/entidades/IProyectoRepositorio";
import { IAsignacionConsultorProyectoRepositorio } from "../../../dominio/repositorio/servicios/IAsignacionConsultorProyectoRepositorio";

// interfaz de este servicio (la que expone los métodos)
import { IRegistroHorasServicio } from "../../interfaces/servicios/IRegistroHorasServicio";

//---------------------------------  VALIDACIONES DEL SERVICIO  ---------------------------------//
export class RegistroHorasServicio implements IRegistroHorasServicio {
  // Inyectamos todos los repos que necesitamos
  constructor(
    private readonly registroHorasRepo: IRegistroHorasRepositorio,
    private readonly consultorRepo: IConsultorRepositorio,
    private readonly proyectoRepo: IProyectoRepositorio,
    private readonly asignacionRepo: IAsignacionConsultorProyectoRepositorio
  ) {}

  // --------------------------- helpers privados --------------------------- //

  /** Compara solo la parte de fecha (ignora horas/minutos) */
  private mismasFechas(a: Date, b: Date): boolean {
    const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
    return aa === bb;
  }

  /** Normaliza descripción para comparar duplicados (trim + lower) */
  private normDesc(s: string): string {
    return (s ?? "").trim().toLowerCase();
  }

  /** Convierte 'YYYY-MM-DD' o Date a Date “solo fecha” (sin tz/UTC) */
  private toDateOnly(input: string | Date): Date {
    if (input instanceof Date) {
      return new Date(input.getFullYear(), input.getMonth(), input.getDate());
    }

    // Esperamos formato 'YYYY-MM-DD'
    const [y, m, d] = input.split("-").map(Number);
    const year = y ?? 1970;
    const month = (m ?? 1) - 1;
    const day = d ?? 1;
    return new Date(year, month, day);
  }

  /**
   * Duplicidad -> mismo consultor + proyecto + misma fecha (día) + misma descripción.
   * OJO: el repo devuelve snake_case desde la BD. Normalizamos aquí para comparar.
   */
  private async existeDuplicado(datos: IRegistroHoras): Promise<boolean> {
    const lista = await this.registroHorasRepo.listarPartesHoras(
      datos.idConsultor,
      datos.idProyecto
    );

    const fechaObj = this.toDateOnly(datos.fechaRegistro);
    const descNorm = this.normDesc(datos.descripcionActividad);

    return lista.some((r: any) => {
      const idConsultorRow: string = r.id_consultor ?? r.idConsultor;
      const idProyectoRow: string = r.id_proyecto ?? r.idProyecto;
      const fechaRow: Date = this.toDateOnly(
        r.fecha_registro ?? r.fechaRegistro
      );
      const descRow: string = this.normDesc(
        r.descripcion_actividad ?? r.descripcionActividad
      );

      return (
        idConsultorRow === datos.idConsultor &&
        idProyectoRow === datos.idProyecto &&
        this.mismasFechas(fechaRow, fechaObj) &&
        descRow === descNorm
      );
    });
  }

  // Método principal -> registrar un parte de horas
  async crearRegistroHoras(datos: IRegistroHoras): Promise<IRegistroHoras> {
    //****** 1. Validar que el consultor exista ******/
    const consultor = await this.consultorRepo.obtenerConsultorPorId(
      datos.idConsultor
    );
    if (!consultor) {
      throw new Error("El consultor indicado no existe");
    }

    //****** 2. Validar que el proyecto exista ******/
    const proyecto = await this.proyectoRepo.obtenerProyectoPorId(
      datos.idProyecto
    );
    if (!proyecto) {
      throw new Error("El proyecto indicado no existe");
    }

    //****** 3. Validar que las horas sean > 0 y razonables (≤ 24) ******/
    if (datos.horasTrabajadas <= 0) {
      throw new Error("La cantidad de horas debe ser mayor que 0");
    }
    if (datos.horasTrabajadas > 24) {
      throw new Error("La cantidad de horas no puede superar 24 en un día");
    }

    //****** 4. Validar que el consultor esté asignado al proyecto -> S1 ******/
    const asignacion = await this.asignacionRepo.obtenerAsignacionExistente(
      datos.idConsultor,
      datos.idProyecto,
      null
    );

    if (!asignacion) {
      throw new Error("El consultor no está asignado a este proyecto");
    }

    // Tomamos las fechas de la asignación aceptando snake_case o camelCase
    const fechaInicioRaw =
      (asignacion as any).fechaInicioAsignacion ??
      (asignacion as any).fecha_inicio_asignacion;
    const fechaFinRaw =
      (asignacion as any).fechaFinAsignacion ??
      (asignacion as any).fecha_fin_asignacion ??
      null;

    if (!fechaInicioRaw) {
      throw new Error(
        "La asignación del consultor no tiene fecha de inicio configurada"
      );
    }

    const fechaInicioAsig = this.toDateOnly(fechaInicioRaw);
    const fechaFinAsig = fechaFinRaw ? this.toDateOnly(fechaFinRaw) : null;

    //****** 5. Validar que la fecha del registro esté dentro del rango de la asignación ******/
    const fechaRegistroSoloDia = this.toDateOnly(datos.fechaRegistro);

    if (
      fechaRegistroSoloDia < fechaInicioAsig ||
      (fechaFinAsig && fechaRegistroSoloDia > fechaFinAsig)
    ) {
      throw new Error(
        "La fecha del registro está fuera del rango de la asignación del consultor"
      );
    }

    //****** 6. Validar no duplicidad exacta: mismo consultor, mismo proyecto, misma fecha y misma descripción ******/
    const yaExiste = await this.existeDuplicado(datos);
    if (yaExiste) {
      throw new Error(
        "Ya existe un registro idéntico para este consultor, proyecto, fecha y descripción"
      );
    }

    //****** 7. Si todo pasa → registramos el parte de horas ******/
    const registroCreado = await this.registroHorasRepo.crearParteHora(datos);
    return registroCreado;
  }

  //---------------------------- Listar partes de horas ----------------------------//
  async listarRegistrosHoras(
    idConsultor?: string,
    idProyecto?: string
  ): Promise<IRegistroHoras[]> {
    return this.registroHorasRepo.listarPartesHoras(idConsultor!, idProyecto!);
  }

  //---------------------------- Obtener un parte de hora por ID ----------------------------//
  async obtenerRegistroHorasPorId(
    idRegistro: string
  ): Promise<IRegistroHoras | null> {
    return this.registroHorasRepo.obtenerParteHoraPorId(idRegistro);
  }

  //---------------------------- Eliminar un parte de hora ----------------------------//
  async eliminarRegistroHoras(idRegistro: string): Promise<void> {
    await this.registroHorasRepo.eliminarParteHora(idRegistro);
  }
}
