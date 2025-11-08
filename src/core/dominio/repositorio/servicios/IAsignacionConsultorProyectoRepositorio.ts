import { boolean } from "zod";
import { IAsignacionConsultorProyecto } from "../../servicios/IAsignacionConsultorProyecto";

export interface IAsignacionConsultorProyectoRepositorio {

existeConsultor(idConsultor:string):Promise<boolean>

existeProyecto(idProyecto:string):Promise<boolean>;

//Crear asignación: asignar consultor a proyecto
asignarConsultorProyecto(datosAsignacion: IAsignacionConsultorProyecto): Promise<string>;

//Obtener asignación
obtenerAsignacionPorId(idAsignacion:string):Promise<IAsignacionConsultorProyecto | null>;

obtenerAsignacionPorConsultor(idConsultor:string):Promise<IAsignacionConsultorProyecto[]>;

obtenerAsignacionPorProyecto(idProyecto:string): Promise<IAsignacionConsultorProyecto[]>;

existeAsignacionDuplicada(idConsultor: string,idProyecto: string,rolConsultor: string): Promise<boolean>;

obtenerDedicacionConsultor(idConsultor:string,fechaInicioAsignacion: string,fechaFinAsignacion: string):Promise<number>

actualizarAsignacion(idAsignacion:string, datosAsignacion: IAsignacionConsultorProyecto):Promise<IAsignacionConsultorProyecto>

eliminarAsignacion(idAsignacion:string):Promise<void>
}