import { IProyecto } from "../dominio/IProyecto";
import { IProyectoRepositorio
} from "../dominio/repositorio/IProyectoRepositorio";
import { ProyectoQueryParams } from "../dominio/ProyectoQueryParams";

export class ProyectoCasosUso {
    constructor (private proyectoRepositorio: IProyectoRepositorio){}

    async obtenerProyecto (params:ProyectoQueryParams){
        if(params.pagina && params.pagina<1){
            throw new Error('La página debe ser >= 1 ');
        }
        if(params.limite && params.limite >1){
            throw new Error ('El límite debe ser >= 1');
        }
    return  await this.proyectoRepositorio.obtenerProyectos(params);
    }
    
    async obtenerProyectoPorId (idProyecto:string):Promise<IProyecto | null>{
        const proyectoObtenido = await this.proyectoRepositorio.obtenerProyectoPorId(idProyecto);
        console.log(proyectoObtenido);
        return proyectoObtenido;
    }

    async crearproyecto (datosProyecto: IProyecto): Promise<string>{
        const idNuevoProyecto = await this.proyectoRepositorio.crearProyecto(datosProyecto);
        return idNuevoProyecto;
    }

    async actualizarProyecto(idProyecto:string, proyecto: IProyecto):Promise<IProyecto | null>{
        const proyectoActualizado = await this.proyectoRepositorio.actualizarProyecto(idProyecto, proyecto);
        return proyectoActualizado || null;
    }

    async eliminarproyecto(idProyecto:string): Promise<void>{
        await this.proyectoRepositorio.eliminarProyecto(idProyecto);
    }

}