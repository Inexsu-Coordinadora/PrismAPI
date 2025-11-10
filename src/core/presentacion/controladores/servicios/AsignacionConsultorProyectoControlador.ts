import { FastifyRequest, FastifyReply } from "fastify";
import { IAsignacionConsultorProyectoServicio } from "../../../aplicacion/interfaces/servicios/IAsignacionConsultorProyectoServicio";
import { CrearAsignacionConsultorProyectoEsquema, AsignacionConsultorProyectoDTO } from "../../esquemas/servicios/asignacionConsultorProyectoEsquema";
import { ZodError } from "zod";
import { IAsignacionConsultorProyecto } from "../../../dominio/servicios/IAsignacionConsultorProyecto";
import { manejarError } from "../../rutas/utils/manejadorErrores";

export class AsignacionConsultorProyectoControlador{
    constructor(private readonly asignacionServicio: IAsignacionConsultorProyectoServicio) {}

    asignarConsultorProyecto = async(request: FastifyRequest, reply: FastifyReply)=>{
        try{

            //validar datos de entrada con zod
            const datosValidados = CrearAsignacionConsultorProyectoEsquema.parse(request.body);
            //ejecutar el servicio
            const resultado = await this.asignacionServicio.asignarConsultorProyecto(datosValidados);

            return reply.code(201).send({
            exito: true,
            mensaje: resultado.mensaje,  // ← Usar el mensaje del servicio
            datos: {
            idAsignacion: resultado.asignacion
            }
        });

        }catch (error){
            return manejarError(reply, error, "Error al asignar consultor al proyecto");        
        }
    } 

    obtenerAsignacionPorId = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { idAsignacion } = request.params as { idAsignacion: string };
            const asignacion = await this.asignacionServicio.obtenerAsignacionPorId(idAsignacion);

            if (!asignacion) {
                return reply.code(404).send({
                    exito: false,
                    mensaje: "Asignación no encontrada"
                });
            }

            return reply.code(200).send({
                exito: true,
                mensaje: "Asignación obtenida correctamente",
                datos: asignacion
            });

        } catch (error) {
            return manejarError(reply, error, "Error al obtener asignación");
        }
    }

    obtenerAsignacionPorConsultor = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { idConsultor } = request.params as { idConsultor: string };
            const asignaciones = await this.asignacionServicio.obtenerAsignacionPorConsultor(idConsultor);

            return reply.code(200).send({
                exito: true,
                mensaje: `Se encontraron ${asignaciones.length} asignaciones`,
                datos: asignaciones
            });

        } catch (error) {
            return manejarError(reply, error, "Error al obtener asignaciones del consultor");
        }
    }

    obtenerAsignacionPorProyecto = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { idProyecto } = request.params as { idProyecto: string };
            const asignaciones = await this.asignacionServicio.obtenerAsignacionPorProyecto(idProyecto);

            return reply.code(200).send({
                exito: true,
                mensaje: `Se encontraron ${asignaciones.length} asignaciones`,
                datos: asignaciones
            });

        } catch (error) {
            return manejarError(reply, error, "Error al obtener asignaciones del proyecto");
        }
    }

    obtenerAsignacionExistente = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { idConsultor, idProyecto, rolConsultor } = request.query as { 
                idConsultor: string, 
                idProyecto: string, 
                rolConsultor?: string 
            };

            const asignacionExistente = await this.asignacionServicio.obtenerAsignacionExistente(
                idConsultor,
                idProyecto,
                rolConsultor ?? null
            );

            return reply.code(200).send({
                exito: true,
                mensaje: asignacionExistente 
                    ? "Ya existe una asignación idéntica" 
                    : "No existe asignación duplicada",
                datos: {
                    existe: !!asignacionExistente,
                    asignacion: asignacionExistente
                }
            });

        } catch (error) {
            return manejarError(reply, error, "Error al verificar asignación existente");
        }
    }

    obtenerDedicacionExistente = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { idConsultor } = request.params as { idConsultor: string };
            const { fechaInicio, fechaFin } = request.query as { fechaInicio: string, fechaFin?: string };
            
            const dedicacion = await this.asignacionServicio.obtenerDedicacionExistente(
                idConsultor,
                new Date(fechaInicio),
                fechaFin ? new Date(fechaFin) : null
            );

            return reply.code(200).send({
                exito: true,
                mensaje: "Dedicación calculada correctamente",
                datos: { dedicacion: `${dedicacion}%` }
            });

        } catch (error) {
            return manejarError(reply, error, "Error al calcular dedicación del consultor");
        }
    }

    actualizarAsignacion = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { idAsignacion } = request.params as { idAsignacion: string };
            const datosValidados = CrearAsignacionConsultorProyectoEsquema.parse(request.body);
            
            const asignacionActualizada = await this.asignacionServicio.actualizarAsignacion(idAsignacion, datosValidados);

            return reply.code(200).send({
                exito: true,
                mensaje: "Asignación actualizada correctamente",
                datos: asignacionActualizada
            });

        } catch (error) {
            return manejarError(reply, error, "Error al actualizar asignación");
        }
    }

    eliminarAsignacion = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { idAsignacion} = request.params as { idAsignacion: string };
            
            await this.asignacionServicio.eliminarAsignacion(idAsignacion);

            return reply.code(200).send({
                exito: true,
                mensaje: "Asignación eliminada correctamente",
                datos: null
            });

        } catch (error) {
            return manejarError(reply, error, "Error al eliminar asignación");
        }
    }
}