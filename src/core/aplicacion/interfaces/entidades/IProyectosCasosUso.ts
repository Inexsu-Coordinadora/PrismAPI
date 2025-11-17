import { IProyecto } from "../../../dominio/entidades/IProyecto";
import { ProyectoDTO } from "../../../presentacion/esquemas/entidades/proyectoEsquema";
import { ProyectoQueryParams } from "../../../dominio/tipos/proyecto/ProyectoQueryParams";
import { ResultadoProyectos } from "../../../dominio/tipos/proyecto/ResultadoProyectos";

export interface IProyectosCasosUso {
    obtenerProyectos(params:ProyectoQueryParams):Promise<ResultadoProyectos>;
    obtenerProyectoPorId(idProyecto:string):Promise<IProyecto | null>;
    crearProyecto(proyecto: ProyectoDTO):Promise<string>;
    actualizarProyecto(idProyecto:string, proyecto:IProyecto):Promise<IProyecto | null>;
    eliminarProyecto(idProyecto:string):Promise<void>;
}