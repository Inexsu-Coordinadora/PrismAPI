import { IAsignacionConsultorProyecto } from "../../../dominio/servicios/IAsignacionConsultorProyecto";
import { AsignacionConsultorProyectoDTO } from "../../../presentacion/esquemas/servicios/asignacionConsultorProyectoEsquema";

export interface IAsignacionConsultorProyectoServicio{

asignarConsultorProyecto(asignacion: AsignacionConsultorProyectoDTO): Promise<string>;

obtenerAsignacionPorId(idAsignacion:string):Promise<IAsignacionConsultorProyecto | null>;

obtenerAsignacionPorConsultor(idConsultor:string):Promise<IAsignacionConsultorProyecto[]>;

obtenerAsignacionPorProyecto(idProyecto:string):Promise<IAsignacionConsultorProyecto[]>;

obtenerAsignacionExistente(idConsultor:string, idProyecto: string, rolConsultor: string | null):Promise<IAsignacionConsultorProyecto | null>;

actualizarAsignacion (idAsignacion:string, asignacion:AsignacionConsultorProyectoDTO): Promise<IAsignacionConsultorProyecto | null>; 

eliminarAsignacion(idAsignacion:string):Promise<void>;


}

