import { IAsignacionConsultorProyecto } from "../../../dominio/servicios/IAsignacionConsultorProyecto";
import { AsignacionConsultorProyectoDTO } from "../../../presentacion/esquemas/servicios/asignacionConsultorProyectoEsquema";

export interface IAsignacionConsultorProyectoServicio{

asignarConsultorProyecto(asignacion: AsignacionConsultorProyectoDTO): Promise<{ mensaje: string; asignacion: string}>;

obtenerAsignacionPorId(idAsignacion:string):Promise<IAsignacionConsultorProyecto | null>;

obtenerAsignacionPorConsultor(idConsultor:string):Promise<IAsignacionConsultorProyecto[]>;

obtenerAsignacionPorProyecto(idProyecto:string):Promise<IAsignacionConsultorProyecto[]>;

obtenerAsignacionExistente(idConsultor:string, idProyecto: string, rolConsultor: string | null):Promise<IAsignacionConsultorProyecto | null>;

obtenerDedicacionExistente(idConsultor:string, fechaInicioAsignacion: Date, fechaFinAsignacion: Date | null): Promise<number>;

actualizarAsignacion (idAsignacion:string, asignacion:AsignacionConsultorProyectoDTO): Promise<IAsignacionConsultorProyecto | null>; 

eliminarAsignacion(idAsignacion:string):Promise<void>;


}

