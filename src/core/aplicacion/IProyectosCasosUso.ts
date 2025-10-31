import { IProyecto } from "../dominio/IProyecto";
import { ProyectoDTO } from "../presentacion/esquemas/proyectoEsquema";
import { ProyectoQueryParams } from "../dominio/ProyectoQueryParams";

export interface IProyectosCasosUso {
    obtenerProyecto(params:ProyectoQueryParams):Promise<IProyecto[]>;
    obtenerProyectoPorId(idProyecto:string):Promise<IProyecto | null>;
    crearProyecto(proyecto: ProyectoDTO):Promise<string>;
    actualizarProyecto(idProyecto:string, proyecto:IProyecto):Promise<IProyecto | null>;
    eliminarProyecto(idProyecto:string):Promise<void>;
}