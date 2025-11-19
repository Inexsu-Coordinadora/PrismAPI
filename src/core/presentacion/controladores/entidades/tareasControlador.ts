import { FastifyRequest, FastifyReply } from "fastify";
import { ITareasCasosUso } from "../../../aplicacion/interfaces/entidades/ITareasCasosUso";
import { CrearTareaEsquema, TareaDTO, ActualizarTareaEsquema, ActualizarTareaDTO } from "../../esquemas/entidades/tareaEsquema";
import { HttpStatus } from "../../../../common/errores/statusCode";
import { NotFoundError } from "../../../../common/errores/AppError";

export class TareasControlador {
    //* Inyectamos los Casos de Uso
    constructor(private tareasCasosUso : ITareasCasosUso){}

    //* ----------------- Método CREAR Tarea (POST /tareas) -----------------//
    crearTarea  = async (
        request: FastifyRequest <{Body: TareaDTO}>,
        reply: FastifyReply 
    ) => {
            const nuevaTarea = CrearTareaEsquema.parse(request.body);
            const idNuevaTarea = await this.tareasCasosUso.crearTarea(nuevaTarea);
            return reply.code(HttpStatus.CREADO).send({
                mensaje: "Tarea creada correctamente",
                idNuevaTarea: idNuevaTarea,
            });
    }

    //* ----------------- Método LISTAR Tarea (GET /tareas) -----------------//
    listarTareas  = async (
        request: FastifyRequest <{Querystring: {limite?:number}}>,
        reply: FastifyReply
    )=>{
            const {limite} = request.query;
            const limiteNum = limite ? Number(limite) : undefined;

            const tareas = await this.tareasCasosUso.listarTareas(limiteNum);
            return reply.code(HttpStatus.EXITO).send({
                mensaje: "Tareas encontradas correctamente",
                tareas: tareas,
                total: tareas.length,
            })
    };

    //* --------- Método OBTENER Tarea  por ID (GET /tareas/:idTarea) ---------//
    obtenerTareaPorId = async (
        request: FastifyRequest<{Params: {idTarea: string}}>,
        reply: FastifyReply
    )=> {
            const {idTarea} = request.params;
            const tarea = await this.tareasCasosUso.obtenerTareaPorId(idTarea);

            if (!tarea){
                throw new NotFoundError("Tarea no encontrada");
            }

            return reply.code(HttpStatus.EXITO).send({
                mensaje: "Tarea encontrada correctamente",
                tarea: tarea,
            });
    }

    //* ----------------- Método ACTUALIZAR Tarea (PUT /tareas/:idTarea) -----------------//

    actualizarTarea = async(
        request: FastifyRequest <{Params: {idTarea: string}; Body: ActualizarTareaDTO}>,
        reply: FastifyReply
    )=>{
            const {idTarea} = request.params;
            const datosActualizar = ActualizarTareaEsquema.parse(request.body);
            const tareaActualizada = await this.tareasCasosUso.actualizarTarea(idTarea, datosActualizar);

            if(!tareaActualizada){
                throw new NotFoundError("Tarea no encontrada para actualizar");
            }

            return reply.code(HttpStatus.EXITO).send({
                mensaje: "Tarea actualizada correctamente",
                tareaActualizada: tareaActualizada,
            });
    };

    //* ----------------- Método ELIMINAR Tarea (DELETE /tareas/:idTarea) -----------------//
    eliminarTarea = async(
        request: FastifyRequest<{Params: {idTarea: string}}>,
        reply: FastifyReply
    )=> {
            const {idTarea} = request.params;
            const tarea = await this.tareasCasosUso.obtenerTareaPorId(idTarea);

            if (!tarea){
                throw new NotFoundError("Tarea no encontrada para eliminar");
            }

            await this.tareasCasosUso.eliminarTarea(idTarea);

            return reply.code(HttpStatus.EXITO).send({
                mensaje: "Tarea eliminada correctamente",
                idTareaEliminada: idTarea,
            });            
    };
}
