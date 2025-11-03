import { IProyecto } from "../../dominio/IProyecto";
import { ProyectoDTO } from "../../presentacion/esquemas/proyectoEsquema";
import { ProyectoQueryParams } from "./ProyectoQueryParams";
import { ResultadoProyectos } from "./ResultadoProyectos";

export interface IProyectosCasosUso {
    obtenerProyectos(params:ProyectoQueryParams):Promise<ResultadoProyectos>;
    obtenerProyectoPorId(idProyecto:string):Promise<IProyecto | null>;
    crearProyecto(proyecto: ProyectoDTO):Promise<string>;
    actualizarProyecto(idProyecto:string, proyecto:IProyecto):Promise<IProyecto | null>;
    eliminarProyecto(idProyecto:string):Promise<void>;
}