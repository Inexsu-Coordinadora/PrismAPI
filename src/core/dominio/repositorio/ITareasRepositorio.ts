import { ITarea } from "../ITarea";

export interface ITareaRepositorio {
    crearTarea(datosTarea : ITarea): Promise <string>;
    listarTareas(limite?: number): Promise <ITarea[]>;
    obtenerTareaPorId(idTarea: string): Promise <ITarea | null>;
    actualizarTarea(idTarea: string, datosTarea: Partial <ITarea>):Promise <ITarea | null>;
    eliminarTarea (idTarea: string): Promise<void>;
}