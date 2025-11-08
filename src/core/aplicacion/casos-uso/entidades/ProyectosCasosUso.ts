import { IProyecto } from "../../dominio/entidades/IProyecto";
import { IProyectoRepositorio
} from "../../dominio/repositorio/entidades/IProyectoRepositorio";
import { ProyectoQueryParams } from "./ProyectoQueryParams";
import { ResultadoProyectos } from "./ResultadoProyectos";

export class ProyectoCasosUso {
    constructor (private proyectoRepositorio: IProyectoRepositorio){}

    async obtenerProyectos (params:ProyectoQueryParams): Promise<ResultadoProyectos>{
        const pagina = params.pagina ?? 1;
        const limite = params.limite ?? 10;

        if(pagina<1){
            throw new Error('La página debe ser >= 1 ');
        }
        if(limite <1){
            throw new Error ('El límite debe ser >= 1');
        }
    return  await this.proyectoRepositorio.obtenerProyectos(params);
    }
    
    async obtenerProyectoPorId (idProyecto:string):Promise<IProyecto | null>{
        const proyectoObtenido = await this.proyectoRepositorio.obtenerProyectoPorId(idProyecto);
        console.log(proyectoObtenido);
        return proyectoObtenido;
    }

    async crearProyecto (datosProyecto: IProyecto): Promise<string>{
        const idNuevoProyecto = await this.proyectoRepositorio.crearProyecto(datosProyecto);
        return idNuevoProyecto;
    }

    async actualizarProyecto(idProyecto:string, proyecto:IProyecto):Promise<IProyecto | null>{
        const proyectoActualizado = await this.proyectoRepositorio.actualizarProyecto(idProyecto, proyecto);
        return proyectoActualizado || null;
    }

    async eliminarProyecto(idProyecto:string): Promise<void>{
        await this.proyectoRepositorio.eliminarProyecto(idProyecto);
    }

}