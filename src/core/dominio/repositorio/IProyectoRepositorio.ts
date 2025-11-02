import { IProyecto } from "../IProyecto";
import { ProyectoQueryParams } from "../../aplicacion/Proyecto/ProyectoQueryParams";

import { Pool } from "pg";

export interface IProyectoRepositorio {
    obtenerProyectos(params:ProyectoQueryParams): Promise<{
        data: IProyecto[];
        total: number;
        pagina:number;
        limite:number;
    }>;

    crearProyecto (datosProyecto: IProyecto): Promise<string>;
    obtenerProyectoPorId (idProyecto: string): Promise<IProyecto | null>;
    actualizarProyecto(idProyecto:string, datosproyecto: IProyecto):Promise<IProyecto | null>;
    eliminarProyecto(idProyecto:string):Promise<void>;
}