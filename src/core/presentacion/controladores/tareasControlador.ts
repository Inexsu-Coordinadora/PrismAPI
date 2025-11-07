import { FastifyRequest, FastifyReply } from "fastify";
import { ITareasCasosUso } from "../../aplicacion/ITareasCasosUso";
import { CrearTareaEsquema, TareaDTO, ActualizarTareaEsquema, ActualizarTareaDTO } from "../esquemas/tareaEsquema";
import { ZodError } from "zod";


export class TareasControlador {
    //* Inyectamos los Casos de Uso
    constructor(private tareasCasosUso : ITareasCasosUso){}

    //* ----------------- Método CREAR Tarea (POST /tareas) -----------------//
    crearTarea  = async (
        request: FastifyRequest <{Body: TareaDTO}>,
        reply: FastifyReply 
    ) => {
        try {
            const nuevaTarea = CrearTareaEsquema.parse(request.body);
            const idNuevaTarea = await this.tareasCasosUso.crearTarea(nuevaTarea);
            return reply.code(201).send({
                mensaje: "Tarea creada correctamente",
                idNuevaTarea: idNuevaTarea,
            });
        } catch (error) {
            return this.manejarError(reply,error, "Error al crear la tarea")
        }
    }

    //* ----------------- Método LISTAR Tarea (GET /tareas) -----------------//
    listarTarea  = async (
        request: FastifyRequest <{Querystring: {limite?:number}}>,
        reply: FastifyReply
    )=>{
        try {
            const {limite} = request.query;
            const limiteNum = limite ? Number(limite) : undefined;

            const tareas = await this.tareasCasosUso.listarTareas(limiteNum);
            return reply.code(200).send({
                mensaje: "Tareas encontradas correctamente",
                tareas: tareas,
                total: tareas.length,
            })
        } catch (error) {
            return this.manejarError(reply, error, "Error al obtener las tareas");
        }
    };

    //* --------- Método OBTENER Tarea  por ID (GET /tareas/:idTarea) ---------//
    obtenerTareaPorId = async (
        request: FastifyRequest<{Params: {idTarea: string}}>,
        reply: FastifyReply
    )=> {
        try {
            const {idTarea} = request.params;
            const tarea = await this.tareasCasosUso.obtenerTareaPorId(idTarea);

            if (!tarea){
                return reply.code(404).send({mensaje: "Tarea no encontrada"});
            }

            return reply.code(200).send({
                mensaje: "Tarea encontrada correctamente",
                tarea: tarea,
            });
        } catch (error) {
            return this.manejarError(reply,error,"Erro al obtener la tarea")
        }
    }

    //* ----------------- Método ACTUALIZAR Tarea (PUT /tareas/:idTarea) -----------------//

    actualizarTarea = async(
        request: FastifyRequest <{Params: {idTarea: string}; Body: ActualizarTareaDTO}>,
        reply: FastifyReply
    )=>{
        try {
            const {idTarea} = request.params;
            const datosActualizar = ActualizarTareaEsquema.parse(request.body);
            const tareaActualizada = await this.tareasCasosUso.actualizarTarea(idTarea, datosActualizar);

            if(!tareaActualizada){
                return reply.code(404).send({mensaje: "Tarea no encontrada"});
            }

            return reply.code(200).send({
                mensaje: "Tarea actualizada correctamente",
                tareaActualizada: tareaActualizada,
            });
        } catch (error) {
            return this.manejarError(reply, error, "Error al actualizar la tarea");
        }
    };

    //* ----------------- Método ELIMINAR Tarea (DELETE /tareas/:idTarea) -----------------//
    eliminarTarea = async(
        request: FastifyRequest<{Params: {idTarea: string}}>,
        reply: FastifyReply
    )=> {
        try {
            const {idTarea} = request.params;
            const tarea = await this.tareasCasosUso.obtenerTareaPorId(idTarea);

            if (!tarea){
                return reply.code(404).send({mensaje: "Tarea no encontrada"});
            }

            await this.tareasCasosUso.eliminarTarea(idTarea);

            return reply.code(200).send({
                mensaje: "Tarea eliminada correctamente",
                idTareaEliminada: idTarea,
            });            
        } catch (error) {
            return this.manejarError(reply,error, "Error al eliminar la tarea");
        }
    };


   //* ----------------- Helper para Manejo de Errores -----------------//
    private manejarError(reply: FastifyReply, err: unknown, mensajeBase: string) {
        if (err instanceof ZodError) {
        //* Si el error es de Zod, enviamos los detalles
        return reply.code(400).send({
            mensaje: mensajeBase,
            //* Mostramos el primer error de validación
            error: err.issues[0]?.message || "Error de validación",
        });
        }
        
        //* Error genérico del servidor
        return reply.code(500).send({
        mensaje: mensajeBase,
        error: err instanceof Error ? err.message : String(err),
        });
    }

}