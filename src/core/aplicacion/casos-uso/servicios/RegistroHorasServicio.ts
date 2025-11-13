// la forma que tiene un registro de horas
import { IRegistroHoras } from "../../../dominio/servicios/IRegistroHoras";

// repositorios que se requieren (interfaces de dominio)
import { IRegistroHorasRepositorio } from "../../../dominio/repositorio/servicios/IRegistroHorasRepositorio";
import { IConsultorRepositorio } from "../../../dominio/repositorio/entidades/IConsultorRepositorio";
import { IProyectoRepositorio } from "../../../dominio/repositorio/entidades/IProyectoRepositorio";

// ESTA IMPORTACIÓN SE ACTIVARÁ CUANDO INTEGRE LA RAMA DEL S1
// import { IAsignacionConsultorProyectoRepositorio } from "../../../dominio/repositorio/servicios/IAsignacionConsultorProyectoRepositorio";
/********* SE UTILIZARA PARA LAS VALIDACIONES DE:
 * 4. Validar que el consultor esté asignado al proyecto -> S1
 * 5. Validar que la fecha del registro esté dentro del rango de la asignación
 **********/

// interfaz de este servicio (la que expone los métodos)
import { IRegistroHorasServicio } from "../../interfaces/servicios/IRegistroHorasServicio";

//---------------------------------  VALIDACIONES DEL SERVICIO  ---------------------------------//
export class RegistroHorasServicio implements IRegistroHorasServicio {
  // Inyectamos todos los repos que necesitamos
  constructor(
    private readonly registroHorasRepo: IRegistroHorasRepositorio,
    private readonly consultorRepo: IConsultorRepositorio,
    private readonly proyectoRepo: IProyectoRepositorio,

    // Cuando se integre con el S1, descomentar la línea siguiente y eliminar la simulación de más abajo.
    // private readonly asignacionRepo: IAsignacionConsultorProyectoRepositorio
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
    const [y, m, d] = input.split("-").map(Number);
    return new Date((y ?? 1970), ((m ?? 1) - 1), (d ?? 1));
    /*
    Si y es undefined, usa 1970 (un valor base neutro)
    Si m es undefined, usa 1
    Si d es undefined, usa 1
    */
  }

  /**
   * Duplicidad -> mismo consultor + proyecto + misma fecha (día) + misma descripción.
    *OJO: el repo devuelve snake_case desde la BD. Normalizamos aquí para comparar.   */
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
      const fechaRow: Date = this.toDateOnly(r.fecha_registro ?? r.fechaRegistro);
      const descRow: string = this.normDesc(r.descripcion_actividad ?? r.descripcionActividad);

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
      // aquí lanzamos error, el controlador lo convierte en 404/400
      throw new Error("El consultor indicado no existe"); // el controlador lo convierte en 404/400
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
    // Como aun no está inyectado el repositorio de asignaciones (S1),
    // simulamos una validación mínima con las FECHAS DEL PROYECTO.
    // Cuando integren, reemplazar este bloque por la validación real con asignaciones.
    const tieneAsignacionReal = false; // <-- cambiar a true cuando integren y descomenten el repo

    if (tieneAsignacionReal) {
      // SIMULACION TEMPORAL de código real (cuando exista el repo):
      // const asignacion = await this.asignacionRepo.obtenerAsignacionPorConsultorYProyecto(
      //   datos.idConsultor,
      //   datos.idProyecto
      // );
      // if (!asignacion) {
      //   throw new Error("El consultor no está asignado a este proyecto");
      // }

      // ****** 5. Validar que la fecha del registro esté dentro del rango de la asignación ******/
      // const fechaInicio = new Date(asignacion.fecha_inicio);
      // const fechaFin = new Date(asignacion.fecha_fin);
      // if (datos.fechaRegistro < fechaInicio || datos.fechaRegistro > fechaFin) {
      //   throw new Error(
      //     "La fecha del registro está fuera del rango de la asignación del consultor"
      //   );
      // }
    } else {
      // SIMULACIÓN TEMPORAL ***
      //  - Si el proyecto tiene fechaInicio definida: no permitir registrar antes.
      //  - Si el proyecto tiene fechaFin definida: no permitir registrar después.
      const { fechaInicio, fechaFin, nombreProyecto } = proyecto;

      if (fechaInicio && datos.fechaRegistro < fechaInicio) {
        throw new Error(
          `La fecha del registro no puede ser anterior al inicio del proyecto ${nombreProyecto}`
        );
      }
      if (fechaFin && datos.fechaRegistro > fechaFin) {
        throw new Error(
          `La fecha del registro no puede ser posterior al fin del proyecto ${nombreProyecto}`
        );
      }
      // Nota: esto NO verifica la asignación del consultor; sólo mantiene una restricción coherente
      // hasta que integren el servicio de asignaciones.
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
