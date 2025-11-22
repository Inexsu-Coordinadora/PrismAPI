import { IRegistroHoras } from "../../../dominio/servicios/IRegistroHoras";
import { IRegistroHorasRepositorio } from "../../../dominio/repositorio/servicios/IRegistroHorasRepositorio";
import { IConsultorRepositorio } from "../../../dominio/repositorio/entidades/IConsultorRepositorio";
import { IProyectoRepositorio } from "../../../dominio/repositorio/entidades/IProyectoRepositorio";
import { IAsignacionConsultorProyectoRepositorio } from "../../../dominio/repositorio/servicios/IAsignacionConsultorProyectoRepositorio";
import { IRegistroHorasServicio } from "../../interfaces/servicios/IRegistroHorasServicio";
import { NotFoundError, ValidationError, ConflictError } from "../../../../common/errores/AppError";


/** Servicio de aplicación para gestionar registros de horas 
 * Orquesta reglas de negocio que combinan consultores, proyectos y asignaciones
*/
export class RegistroHorasServicio implements IRegistroHorasServicio {
  constructor(
    private readonly registroHorasRepo: IRegistroHorasRepositorio,
    private readonly consultorRepo: IConsultorRepositorio,
    private readonly proyectoRepo: IProyectoRepositorio,
    private readonly asignacionRepo: IAsignacionConsultorProyectoRepositorio
  ) {}

  /** Normaliza descripción para comparar duplicados de forma consistente */
  private normDesc(s: string): string {
    return (s ?? "").trim().toLowerCase();
  }
  /** Deja fecha sin hora 
   * Evita que horas y zonas horarias afecten las validaciones de rango o duplicidad.
  */
  private toDateOnly(date: Date): Date {
    return new Date (date.getFullYear(), date.getMonth(), date.getDate());
  }
  /** Compara dos fechas usando solo el día */
  private mismasFechas(a: Date, b: Date): boolean {
    return this.toDateOnly(a).getTime() === this.toDateOnly(b).getTime();
  }
  /** Determina si ya existe un parte de horas idéntico para el mismo consultor,
   * proyecto, fecha y descripción. Evita registros duplicados.*/
  private async existeDuplicado(datos: IRegistroHoras): Promise<boolean> {
    const lista: IRegistroHoras[] = await this.registroHorasRepo.listarPartesHoras(
      datos.idConsultor,
      datos.idProyecto
    );

    const fechaNueva = datos.fechaRegistro;                 
    const descNorm = this.normDesc(datos.descripcionActividad);

    return lista.some((r) =>
      r.idConsultor === datos.idConsultor &&
      r.idProyecto === datos.idProyecto &&
      this.mismasFechas(r.fechaRegistro, fechaNueva) &&             
      this.normDesc(r.descripcionActividad) === descNorm      
      );
  }

  
  /** Registra un nuevo parte de horas aplicando las reglas de negocio */
  async crearRegistroHoras(datos: IRegistroHoras): Promise<IRegistroHoras> {

    const consultor = await this.consultorRepo.obtenerConsultorPorId(datos.idConsultor);    /**Consultro debe existir */
    if (!consultor) throw new NotFoundError("El consultor indicado no existe");

    const proyecto = await this.proyectoRepo.obtenerProyectoPorId(datos.idProyecto);        /**Proyecto debe existir */
    if (!proyecto) {throw new NotFoundError("El proyecto indicado no existe");
    }
  
    if (datos.horasTrabajadas <= 0) {                                                       /**Las horas válidas son > 0 y <= 24 */
      throw new ValidationError("La cantidad de horas debe ser mayor que 0");
    }
    if (datos.horasTrabajadas > 24) {
      throw new ValidationError("La cantidad de horas no puede superar 24 en un día");
    }
                                                                                              
    const asignacion = await this.asignacionRepo.obtenerAsignacionExistente(                /**Consultor asignado al proyecto -> S1 */
      datos.idConsultor,
      datos.idProyecto,
      null
    );

    if (!asignacion) {
      throw new ValidationError("El consultor no está asignado a este proyecto");
    }

    const fechaInicioAsig = this.toDateOnly(asignacion.fechaInicioAsignacion);
    const fechaFinAsig = asignacion.fechaFinAsignacion
      ? this.toDateOnly(asignacion.fechaFinAsignacion)
      : null;

    const fechaRegistroSoloDia = this.toDateOnly(datos.fechaRegistro);                    /**Fecha de registro dentro del rango de la asignación */

    if (
      fechaRegistroSoloDia < fechaInicioAsig ||
      (fechaFinAsig && fechaRegistroSoloDia > fechaFinAsig)
    ) {
      throw new ValidationError("La fecha del registro está fuera del rango de la asignación del consultor");
    }

    const yaExiste = await this.existeDuplicado(datos);                                    /** No se permite un parte idéntico en el mismo día.*/
    if (yaExiste) {
      throw new ConflictError(
        "Ya existe un registro idéntico para este consultor, proyecto, fecha y descripción"
      );
    }

    const registroCreado = await this.registroHorasRepo.crearParteHora(datos);
    return registroCreado;
  }


  async listarRegistrosHoras(
    idConsultor?: string,
    idProyecto?: string
  ): Promise<IRegistroHoras[]> {
    return this.registroHorasRepo.listarPartesHoras(idConsultor!, idProyecto!);
  }

  
  async obtenerRegistroHorasPorId(
    idRegistro: string
  ): Promise<IRegistroHoras | null> {
    return this.registroHorasRepo.obtenerParteHoraPorId(idRegistro);
  }

  
  async eliminarRegistroHoras(idRegistro: string): Promise<void> {
    await this.registroHorasRepo.eliminarParteHora(idRegistro);
  }
}
