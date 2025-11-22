import { IRegistroHoras } from "../../../dominio/servicios/IRegistroHoras";

/** Servicio encargado de aplicar reglas de negocio relacionadas con la creación, consulta y eliminación de registros de horas
 * La capa de aplicación usa esta interfaz para asegurar que las reglas se cumplan antes de llegar al repositorio.
 */
export interface IRegistroHorasServicio {

  crearRegistroHoras(datos: IRegistroHoras): Promise<IRegistroHoras>;

  listarRegistrosHoras(
    idConsultor?: string,
    idProyecto?: string
  ): Promise<IRegistroHoras[]>;

  obtenerRegistroHorasPorId(idRegistro: string): Promise<IRegistroHoras | null>;
  
  eliminarRegistroHoras(idRegistro: string): Promise<void>;
}