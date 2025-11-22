import { FastifyRequest, FastifyReply } from "fastify";
import { IAsignacionConsultorProyectoServicio } from "../../../aplicacion/interfaces/servicios/IAsignacionConsultorProyectoServicio";
import { CrearAsignacionConsultorProyectoEsquema, AsignacionConsultorProyectoDTO } from "../../esquemas/servicios/asignacionConsultorProyectoEsquema";
import { NotFoundError } from "../../../../common/errores/AppError";
import { HttpStatus } from "../../../../common/errores/statusCode";
export class AsignacionConsultorProyectoControlador{
    constructor(private readonly asignacionServicio: IAsignacionConsultorProyectoServicio) {}

    asignarConsultorProyecto = async(request: FastifyRequest, reply: FastifyReply)=>{
                   //validar datos de entrada con zod
            const datosValidados = CrearAsignacionConsultorProyectoEsquema.parse(request.body);
            //ejecutar el servicio
            const resultado = await this.asignacionServicio.asignarConsultorProyecto(datosValidados);

            return reply.code(HttpStatus.CREADO).send({
            exito: true,
            mensaje: resultado.mensaje,  // ← Usar el mensaje del servicio
            datos: {
            idAsignacion: resultado.asignacion
            }
        });
    } 

    obtenerAsignacionPorId = async (request: FastifyRequest, reply: FastifyReply) => {
            const { idAsignacion } = request.params as { idAsignacion: string };
            const asignacion = await this.asignacionServicio.obtenerAsignacionPorId(idAsignacion);

            if (!asignacion) {
                throw new NotFoundError("Asignación no encontrada");
            }

            return reply.code(HttpStatus.EXITO).send({
                exito: true,
                mensaje: "Asignación obtenida correctamente",
                datos: asignacion
            });
    }

    obtenerAsignacionPorConsultor = async (request: FastifyRequest, reply: FastifyReply) => {
            const { idConsultor } = request.params as { idConsultor: string };
            const asignaciones = await this.asignacionServicio.obtenerAsignacionPorConsultor(idConsultor);

            return reply.code(HttpStatus.EXITO).send({
                exito: true,
                mensaje: `Se encontraron ${asignaciones.length} asignaciones`,
                datos: asignaciones
            });
    }

    obtenerAsignacionPorProyecto = async (request: FastifyRequest, reply: FastifyReply) => {
            const { idProyecto } = request.params as { idProyecto: string };
            const asignaciones = await this.asignacionServicio.obtenerAsignacionPorProyecto(idProyecto);

            return reply.code(HttpStatus.EXITO).send({
                exito: true,
                mensaje: `Se encontraron ${asignaciones.length} asignaciones`,
                datos: asignaciones
            });
    }

    obtenerAsignacionExistente = async (request: FastifyRequest, reply: FastifyReply) => { 
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

            return reply.code(HttpStatus.EXITO).send({
                exito: true,
                mensaje: asignacionExistente 
                    ? "Ya existe una asignación idéntica" 
                    : "No existe asignación duplicada",
                datos: {
                    existe: !!asignacionExistente,
                    asignacion: asignacionExistente
                }
            });
    }

    obtenerDedicacionConsultor = async (request: FastifyRequest, reply: FastifyReply) => {
            const { idConsultor } = request.params as { idConsultor: string };
            const { fechaInicio, fechaFin } = request.query as { fechaInicio: string, fechaFin?: string };
            
            const dedicacion = await this.asignacionServicio.obtenerDedicacionConsultor(
                idConsultor,
                new Date(fechaInicio),
                fechaFin ? new Date(fechaFin) : null
            );

            return reply.code(HttpStatus.EXITO).send({
                exito: true,
                mensaje: "Dedicación calculada correctamente",
                datos: { dedicacion: `${dedicacion}%` }
            });
    }

    actualizarAsignacion = async (request: FastifyRequest, reply: FastifyReply) => {
            const { idAsignacion } = request.params as { idAsignacion: string };
            const datosValidados = CrearAsignacionConsultorProyectoEsquema.parse(request.body);
            
            const asignacionActualizada = await this.asignacionServicio.actualizarAsignacion(idAsignacion, datosValidados);

            return reply.code(HttpStatus.EXITO).send({
                exito: true,
                mensaje: "Asignación actualizada correctamente",
                datos: asignacionActualizada
            });
    }

    eliminarAsignacion = async (request: FastifyRequest, reply: FastifyReply) => {
            const { idAsignacion} = request.params as { idAsignacion: string };
            
            await this.asignacionServicio.eliminarAsignacion(idAsignacion);

            return reply.code(HttpStatus.EXITO).send({
                exito: true,
                mensaje: "Asignación eliminada correctamente",
                datos: null
            });
    }
}