import { ITarea } from "../../../dominio/entidades/ITarea";
import { TareaDTO, ActualizarTareaDTO } from "../../../presentacion/esquemas/entidades/tareaEsquema";


export interface ITareasCasosUso {
    crearTarea(tarea: TareaDTO): Promise <string>;
    listarTareas(limite?: number): Promise <ITarea[]>;
    obtenerTareaPorId(idTarea: string): Promise <ITarea | null>;
    actualizarTarea(idTarea: string, tarea:ActualizarTareaDTO):Promise <ITarea | null>;
    eliminarTarea (idTarea: string): Promise<void>;
}