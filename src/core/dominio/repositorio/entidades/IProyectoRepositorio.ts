import { IProyecto } from "../../entidades/IProyecto";
import { ProyectoQueryParams } from "../../tipos/proyecto/ProyectoQueryParams";


export interface IProyectoRepositorio {
    obtenerProyectos(params:ProyectoQueryParams): Promise<{
        data: IProyecto[];
        total: number;
        pagina:number;
        limite:number;
    }>;

    crearProyecto (datosProyecto: IProyecto): Promise<string>;
    obtenerProyectoPorId (idProyecto: string): Promise<IProyecto | null>;
    actualizarProyecto(idProyecto:string, datosproyecto: Partial<IProyecto>):Promise<IProyecto | null>;
    eliminarProyecto(idProyecto:string):Promise<void>;
}