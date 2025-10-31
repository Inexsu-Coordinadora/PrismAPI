import { ITarea } from "../dominio/ITarea";
import { TareaDTO } from "../presentacion/esquemas/tareaEsquema";


export interface ITareasCasosUso {
    crearTarea(tarea: TareaDTO): Promise <string>;
    listarTareas(limite?: number): Promise <ITarea[]>;
    obtenerTareaPorId(idTarea: string): Promise <ITarea | null>;
    actualizarTarea(idTarea: string, tarea: Partial <ITarea>):Promise <ITarea | null>;
    eliminarTarea (idTarea: string): Promise<void>;
}