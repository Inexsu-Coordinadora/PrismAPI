import { boolean } from "zod";
import { IAsignacionConsultorProyecto } from "../../servicios/IAsignacionConsultorProyecto";

export interface IAsignacionConsultorProyectoRepositorio {

//Crear asignación: asignar consultor a proyecto
asignarConsultorProyecto(datosAsignacion: IAsignacionConsultorProyecto): Promise<string>;

//Obtener asignación
obtenerAsignacionPorId(idAsignacion:string):Promise<IAsignacionConsultorProyecto | null>;

obtenerAsignacionPorConsultor(idConsultor:string):Promise<IAsignacionConsultorProyecto[]>;

obtenerAsignacionPorProyecto(idProyecto:string): Promise<IAsignacionConsultorProyecto[]>;

obtenerAsignacionExistente(idConsultor: string,idProyecto: string,rolConsultor: string | null): Promise<IAsignacionConsultorProyecto | null>;

obtenerDedicacionConsultor(idConsultor:string,fechaInicioAsignacion: Date,fechaFinAsignacion: Date | null):Promise<number>

actualizarAsignacion(idAsignacion:string, datosAsignacion: IAsignacionConsultorProyecto):Promise<IAsignacionConsultorProyecto>

eliminarAsignacion(idAsignacion:string):Promise<void>
}