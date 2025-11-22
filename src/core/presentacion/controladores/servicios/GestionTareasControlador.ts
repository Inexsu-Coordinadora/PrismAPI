import { FastifyRequest, FastifyReply } from "fastify";
import { 
    CrearProyectoTareaEsquema, //* El validador
    CrearTareaServicioDTO,      //* El DTO (tipo)
    ActualizarProyectoTareaEsquema,
    ActualizarTareaServicioDTO
} from "../../esquemas/servicios/gestionTareasEsquema";
import { IGestionTareasServicio } from "../../../aplicacion/interfaces/servicios/IGestionTareasServicio";
import { HttpStatus } from "../../../../common/errores/statusCode";

//* ----------------- Controlador para el S4, Maneja el tráfico HTTP y lo dirige al servicio de aplicación. -----------------//
export class GestionTareasControlador {
    //* Inyectamos el "cerebro" (Servicio)
    constructor(private readonly gestionTareasServicio: IGestionTareasServicio){}


    //* ----------------- 1°CREAR Tarea en Proyecto (POST/proyectos/:idProyecto/tareas) -----------------//
    crearTareaEnProyecto = async (
        request: FastifyRequest<{Params: {idProyecto: string};Body: CrearTareaServicioDTO;}>,
        reply: FastifyReply
    ) => {   
            const {idProyecto} = request.params;
            const nuevaTarea = CrearProyectoTareaEsquema.parse(request.body); //* <- Aqui se valida el body
            const idNuevaTarea = await this.gestionTareasServicio.crearTareaEnProyecto(idProyecto, nuevaTarea); //* <- Aqui se llama al "cerebro"-servicio
            return reply.code(HttpStatus.CREADO).send({
                mensaje: "Tarea creada correctamente en el proyecto",
                idNuevaTarea: idNuevaTarea,
            });
        }   
    


    //* ----------------- 2°LISTAR Tareas de Proyecto(GET/proyectos/:idProyecto/tareas) -----------------//
    listarTareasProyecto = async (
        request: FastifyRequest<{Params: {idProyecto: string};}>,
        reply: FastifyReply
    ) => {
            const {idProyecto} = request.params;
            const tareas = await this.gestionTareasServicio.obtenerTareasPorProyecto(idProyecto);
            return reply.code(HttpStatus.EXITO).send({
                mensaje: "Tareas del proyecto encontradas correctamente",
                tareas: tareas,
                total: tareas.length,
        });
    }


    //* ----------------- 3° OBTENER Tarea por ID de Proyecto(GET/proyectos/:idProyecto/tareas/:idTarea) -----------------//
    obtenerTareaDeProyectoPorId = async (
        request: FastifyRequest<{Params: {idProyecto: string; idTarea: string};}>,
        reply: FastifyReply
    ) => {
            const {idProyecto, idTarea} = request.params;
            const tarea = await this.gestionTareasServicio.obtenerTareaDeProyectoPorId(idTarea, idProyecto);
            return reply.code(HttpStatus.EXITO).send({
                mensaje: "Tarea del proyecto encontrada correctamente",
                tarea: tarea,
            });               
    }
    

    //* ----------------- 4° ACTUALIZAR Tarea de Proyecto (PUT/proyectos/:idProyecto/tareas/:idTarea)-----------------//
    actualizarTareaEnProyecto = async (   
        request: FastifyRequest<{Params: {idProyecto: string; idTarea: string}; Body: ActualizarTareaServicioDTO;}>,    
        reply: FastifyReply
    ) => {
            const {idProyecto, idTarea} = request.params;
            const datosTareaActualizar = ActualizarProyectoTareaEsquema.parse(request.body);//* <- Aqui se valida el body
            const tareaActualizada = await this.gestionTareasServicio.actualizarTareaEnProyecto(idTarea, idProyecto, datosTareaActualizar);
            return reply.code(HttpStatus.EXITO).send({
                mensaje: "Tarea del proyecto actualizada correctamente",
                tareaActualizada: tareaActualizada,
        });
    }
    

    //* ----------------- 5° ELIMINAR Tarea de Proyecto (DELETE/proyectos/:idProyecto/tareas/:idTarea)-----------------//
    eliminarTareaEnProyecto = async (
        request: FastifyRequest<{Params: {idProyecto: string; idTarea: string};}>,
        reply: FastifyReply
    ) => {
            const {idProyecto, idTarea} = request.params;
            await this.gestionTareasServicio.eliminarTareaDeProyecto(idTarea, idProyecto);
            return reply.code(HttpStatus.EXITO).send({
                mensaje: "Tarea del proyecto eliminada correctamente",
                idTareaEliminada: idTarea,
        });
    };
}

