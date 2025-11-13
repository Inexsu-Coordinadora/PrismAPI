import {FastifyRequest, FastifyReply} from 'fastify';
import { IConsultor } from '../../../dominio/entidades/IConsultor';
import { IConsultorCasosUso } from '../../../aplicacion/interfaces/entidades/IConsultorCasosUso';
import { ConsultorDTO, CrearConsultorEsquema } from '../../esquemas/entidades/consultorEsquema';
import { ZodError} from 'zod';

export class ConsultorControlador {
    constructor(private consultorCasosUso: IConsultorCasosUso) {}

        //---------------------------------METODO GET---------------------------------//

    obtenerConsultores = async (
        request: FastifyRequest<{Querystring: {limite?: number}}>, 
        reply: FastifyReply
    ) => {
        try{
            const { limite } = request.query;
            const consultoresEncontrados: IConsultor[] = await this.consultorCasosUso.obtenerConsultores(limite);

            return reply.code(200).send({
                mensaje: "Consultores encontrados correctamente",
                consultores: consultoresEncontrados,
                totalConsultores: consultoresEncontrados.length,
            });
        }   catch (error) {
            return reply.code(500).send({
                mensaje: "Error al obtener los consultores",
                error: error instanceof Error ? error.message : error,
            });
        }
    };

        //---------------------------------METODO GET By ID---------------------------------//

    obtenerConsultorPorId = async (
        request: FastifyRequest<{Params: {idConsultor: string}}>,
        reply: FastifyReply
    ) => {
        try {
            const { idConsultor } = request.params;
            const consultorEncontrado = await this.consultorCasosUso.obtenerConsultorPorId(idConsultor);

            if (!consultorEncontrado) {
                return reply.code(404).send({
                    mensaje: "Consultor no encontrado",
                });
            } 

            return reply.code(200).send({
                mensaje: "Consultor encontrado correctamente",
                consultor: consultorEncontrado,
            });
        } catch (error) {
            return reply.code(500).send({
                mensaje: "Error al obtener el consultor",
                error: error instanceof Error ? error.message : error,
            });
        }
    };

        //---------------------------------METODO POST---------------------------------//

    crearConsultor = async (
        request: FastifyRequest<{Body: ConsultorDTO}>,
        reply: FastifyReply
    ) => {
        try {
            const nuevoConsultor = CrearConsultorEsquema.parse(request.body);
            const idNuevoConsultor = await this.consultorCasosUso.crearConsultor(nuevoConsultor);

            return reply.code(201).send({                
                mensaje: "El consultor se creo correctamente",
                idConsultor: idNuevoConsultor,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.code(400).send({
                    mensaje: "Error al crear un nuevo consultor",
                    error: error.issues[0]?.message || "Error desconocido",
                });
            }
            return reply.code(500).send({
                mensaje: "Error al crear un nuevo consultor",
                error: error instanceof Error ? error.message : String(error),
            });
        }
    };

        //---------------------------------METODO UPDATE---------------------------------//

    actualizarConsultor = async (
        request: FastifyRequest<{Params: {idConsultor: string}; Body: Partial<ConsultorDTO>}>,  //REVISAR
        reply: FastifyReply
    ) => {
        try {
            const { idConsultor } = request.params;
            const nuevoConsultor = request.body;
            const consultorActualizado = await this.consultorCasosUso.actualizarConsultor(
                idConsultor, 
                nuevoConsultor
            );

            if (!consultorActualizado) {
                return reply.code(404).send({
                    mensaje:"Consultor no encontrado para actualizar",
                });
            }

            return reply.code(200).send({
                mensaje: "Consultor actualizado correctamente",
                consultorActualizado: consultorActualizado,
            });
        } catch (error) {
            return reply.code(500).send({
                mensaje: "Error al actualizar el consultor",
                error: error instanceof Error ? error.message : error,
            });
        }
    };

        //---------------------------------METODO DELETE---------------------------------//

    eliminarConsultor = async (
        request: FastifyRequest<{Params: {idConsultor: string}}>,
        reply: FastifyReply
    ) => {
        try {
            const { idConsultor } = request.params;
            await this.consultorCasosUso.eliminarConsultor(idConsultor);
            //const consultorEliminado = await this.consultorCasosUso.eliminarConsultor(idConsultor);

            return reply.code(200).send({
                mensaje: "Consultor eliminado correctamente",
                //consultorEliminado: consultorEliminado,
            });
        }catch (error) {
            return reply.code(500).send({
                mensaje: "Error al eliminar el consultor",
                error: error instanceof Error ? error.message : error,
            });
        }
    };
}