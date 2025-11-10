import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { 
    CrearProyectoTareaEsquema, //* El validador
    CrearTareaServicioDTO,      //* El DTO (tipo)
    ActualizarProyectoTareaEsquema,
    ActualizarTareaServicioDTO
} from "../../esquemas/servicios/gestionTareasEsquema";
import { IGestionTareasServicio } from "../../../aplicacion/interfaces/servicios/IGestionTareasServicio";
import { request } from "http";

//* ----------------- Controlador para el S4, Maneja el tráfico HTTP y lo dirige al servicio de aplicación. -----------------//
export class GestionTareasControlador {
    //* Inyectamos el "cerebro" (Servicio)
    constructor(private readonly gestionTareasServicio: IGestionTareasServicio){}

    //* ----------------- 1°CREAR Tarea en Proyecto (POST/proyectos/:idProyecto/tareas) -----------------//
    crearTareaEnProyecto = async (
        request: FastifyRequest<{Params: {idProyecto: string};Body: CrearTareaServicioDTO;}>,
        reply: FastifyReply
    ) => {   
        try {
            const {idProyecto} = request.params;
            const nuevaTarea = CrearProyectoTareaEsquema.parse(request.body); //* <- Aqui se valida el body
            const idNuevaTarea = await this.gestionTareasServicio.crearTareaEnProyecto(idProyecto, nuevaTarea); //* <- Aqui se llama al "cerebro"-servicio
            return reply.code(201).send({
                mensaje: "Tarea creada correctamente en el proyecto",
                idNuevaTarea: idNuevaTarea,
            });
        } catch (error) {
            return this.manejarError(reply, error, "Error al crear la tarea en el proyecto");

        }   

    }

    //* ----------------- 2°LISTAR Tareas de Proyecto(GET/proyectos/:idProyecto/tareas) -----------------//
    listarTareasProyecto = async (
        request: FastifyRequest<{Params: {idProyecto: string};}>,
        reply: FastifyReply
    ) => {
        try {
            const {idProyecto} = request.params;
            const tareas = await this.gestionTareasServicio.obtenerTareasPorProyecto(idProyecto);
            return reply.code(200).send({
                mensaje: "Tareas del proyecto encontradas correctamente",
                tareas: tareas,
                total: tareas.length,
            });
        }catch (error) {
            return this.manejarError(reply, error, "Error al obtener las tareas del proyecto");
        }
    }   


    //* ----------------- 3° OBTENER Tarea por ID de Proyecto(GET/proyectos/:idProyecto/tareas/:idTarea) -----------------//
    obtenerTareaPorIdProyecto = async (
        request: FastifyRequest<{Params: {idProyecto: string; idTarea: string};}>,
        reply: FastifyReply
    ) => {
        try {
            const {idProyecto, idTarea} = request.params;
            const tarea = await this.gestionTareasServicio.obtenerTareaDeProyectoPorId(idTarea, idProyecto);
            return reply.code(200).send({
                mensaje: "Tarea del proyecto encontrada correctamente",
                tarea: tarea,
            });               
            
        } catch (error) {
            return this.manejarError(reply, error, "Error al obtener la tarea del proyecto");
        }
    }

    //* ----------------- 4° ACTUALIZAR Tarea de Proyecto (PUT/proyectos/:idProyecto/tareas/:idTarea)-----------------//
    actualizarTareaEnProyecto = async (   
        request: FastifyRequest<{Params: {idProyecto: string; idTarea: string}; Body: ActualizarTareaServicioDTO;}>,    
        reply: FastifyReply
    ) => {
        try {
            const {idProyecto, idTarea} = request.params;
            const datosTareaActualizar = ActualizarProyectoTareaEsquema.parse(request.body);//* <- Aqui se valida el body
            const tareaActualizada = await this.gestionTareasServicio.actualizarTareaEnProyecto(idTarea, idProyecto, datosTareaActualizar);
            return reply.code(200).send({
                mensaje: "Tarea del proyecto actualizada correctamente",
                tareaActualizada: tareaActualizada,
            });
        } catch (error) {
            return this.manejarError(reply, error, "Error al actualizar la tarea del proyecto");
        }
    }

    //* ----------------- 5° ELIMINAR Tarea de Proyecto (DELETE/proyectos/:idProyecto/tareas/:idTarea)-----------------//
    eliminarTareaEnProyecto = async (
        request: FastifyRequest<{Params: {idProyecto: string; idTarea: string};}>,
        reply: FastifyReply
    ) => {
        try {
            const {idProyecto, idTarea} = request.params;
            await this.gestionTareasServicio.eliminarTareaDeProyecto(idTarea, idProyecto);
            return reply.code(200).send({
                mensaje: "Tarea del proyecto eliminada correctamente",
                idTareaEliminada: idTarea,
            });
        } catch (error) {
            return this.manejarError(reply, error, "Error al eliminar la tarea del proyecto");
        }
    };




    //* HELPER para Manejo de Errores  (Maneja Zod, 404s, y otros errores de negocio)
    private manejarError(reply: FastifyReply, error: unknown, mensajeBase: string) {
        
        if (error instanceof ZodError) {
            return reply.code(400).send({
                mensaje: mensajeBase,
                error: error.issues[0]?.message || "Error de validación",
            });
        }
        
        if (error instanceof Error && (
            error.message.includes("no encontrado") || 
            error.message.includes("no encontrada")
        )) {
            return reply.code(404).send({
                mensaje: error.message,
            });
        }
        
        if (error instanceof Error) {
             // Errores de negocio (Duplicado, fecha inválida, tarea ya completada, etc.)
            return reply.code(400).send({
                mensaje: error.message,
            });
        }

        return reply.code(500).send({
            mensaje: "Error interno del servidor",
            error: String(error),
        });
    }





}
