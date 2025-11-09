import { ITarea } from "../../../dominio/entidades/ITarea";
import {
    CrearTareaServicioDTO,
    ActualizarTareaServicioDTO,
} from "../../../presentacion/esquemas/servicios/gestionTareasEsquema";

//* Aqui se definen las operaciones de negocio para la gestión de tareas dentro del contexto de un proyecto (Servicio 4).
export interface IGestionTareasServicio {
  crearTareaEnProyecto( //* Crea una nueva tarea y la asocia a un proyecto. Realiza validaciones de negocio (ej: proyecto existe, consultor existe, etc.)
    idProyecto: string,
    datosTarea: CrearTareaServicioDTO): Promise<string>; //* Devuelve el ID de la nueva tarea
  obtenerTareasPorProyecto(idProyecto: string): Promise<ITarea[]>; //* Lista todas las tareas que pertenecen a un proyecto específico.
  obtenerTareaDeProyectoPorId( //* Obtiene una tarea específica, asegurándose que pertenezca al proyecto.
    idTarea: string,
    idProyecto: string ): Promise<ITarea | null>; 
  actualizarTareaEnProyecto( //* Actualiza una tarea, Realiza validaciones de negocio (ej: no completar tarea completada, etc.)
    idTarea: string,
    idProyecto: string,
    datosTarea: ActualizarTareaServicioDTO): Promise<ITarea | null>; 
  eliminarTareaDeProyecto(idTarea: string, idProyecto: string): Promise<void>; //* Elimina una tarea específica de un proyecto.
}


