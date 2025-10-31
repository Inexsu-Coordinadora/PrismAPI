import { ITarea } from "../dominio/ITarea";
import { TareaDTO } from "../presentacion/esquemas/tareaEsquema";
import { ITareaRepositorio } from "../dominio/repositorio/ITareasRepositorio";
import { ITareasCasosUso } from "./ITareasCasosUso";

export class TareasCasosUSo implements ITareasCasosUso{

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
    async actualizarTarea(idTarea: string, tarea: Partial<ITarea>): Promise<ITarea | null> {
        const tareaActualizada = await this.tareasRepositorio.actualizarTarea(idTarea, tarea);
    return tareaActualizada;
    }
    async eliminarTarea(idTarea: string): Promise<void> {
        await this.tareasRepositorio.eliminarTarea(idTarea);
    }
    
}