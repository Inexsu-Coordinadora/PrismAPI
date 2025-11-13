import { ITarea } from "../../entidades/ITarea";

export interface ITareaRepositorio {
    crearTarea(datosTarea : ITarea): Promise <string>;
    listarTareas(limite?: number): Promise <ITarea[]>;
    obtenerTareaPorId(idTarea: string): Promise <ITarea | null>;
    actualizarTarea(idTarea: string, datosTarea: Partial <ITarea>):Promise <ITarea | null>;
    eliminarTarea (idTarea: string): Promise<void>;

    //* --- Métodos de S4 (Consultas Complejas) ---
    buscarPorTituloYProyecto(tituloTarea: string, idProyecto: string): Promise<ITarea | null>;
    obtenerTareasPorProyecto(idProyecto: string): Promise<ITarea[]>;
    obtenerTareaDeProyectoPorId(idTarea: string, idProyecto: string): Promise<ITarea | null>;




}