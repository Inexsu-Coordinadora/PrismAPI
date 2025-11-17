import { ITarea } from "../../../dominio/entidades/ITarea";
import { TareaDTO, ActualizarTareaDTO } from "../../../presentacion/esquemas/entidades/tareaEsquema";
import { ITareaRepositorio } from "../../../dominio/repositorio/entidades/ITareasRepositorio";
import { ITareasCasosUso } from "../../interfaces/entidades/ITareasCasosUso";

export class TareasCasosUso implements ITareasCasosUso{

    //* Inyectamos el Repositorio en el constructor
    constructor(private tareasRepositorio : ITareaRepositorio){}


    async crearTarea(datosTarea: TareaDTO): Promise<string> {
    const idNuevaTarea = await this.tareasRepositorio.crearTarea(datosTarea);
    return idNuevaTarea;
    }


    async listarTareas(limite?: number): Promise<ITarea[]> {
        return await this.tareasRepositorio.listarTareas(limite);
    }


    async obtenerTareaPorId(idTarea: string): Promise<ITarea | null> {
        return await this.tareasRepositorio.obtenerTareaPorId(idTarea);
    }


    async actualizarTarea(idTarea: string, tarea: ActualizarTareaDTO): Promise<ITarea | null> {
        const tareaActualizada = await this.tareasRepositorio.actualizarTarea(idTarea, tarea as Partial<ITarea>);
    return tareaActualizada;
    }

    
    async eliminarTarea(idTarea: string): Promise<void> {
        await this.tareasRepositorio.eliminarTarea(idTarea);
    }
    
}