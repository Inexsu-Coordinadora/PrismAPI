import {FastifyRequest, FastifyReply} from 'fastify';
import { IConsultor } from '../../../dominio/entidades/IConsultor';
import { IConsultorCasosUso } from '../../../aplicacion/interfaces/entidades/IConsultorCasosUso';
import { ConsultorDTO, CrearConsultorEsquema } from '../../esquemas/entidades/consultorEsquema';
import { HttpStatus } from '../../../../common/errores/statusCode';

export class ConsultorControlador {
    constructor(private consultorCasosUso: IConsultorCasosUso) {}

        //---------------------------------METODO GET---------------------------------//

    obtenerConsultores = async (
        request: FastifyRequest<{Querystring: {limite?: number}}>, 
        reply: FastifyReply
    ) => {
            const { limite } = request.query;
            const consultoresEncontrados: IConsultor[] = await this.consultorCasosUso.obtenerConsultores(limite);

            return reply.code(HttpStatus.EXITO).send({
                mensaje: "Consultores encontrados correctamente",
                consultores: consultoresEncontrados,
                totalConsultores: consultoresEncontrados.length,
            });
        };

        //---------------------------------METODO GET By ID---------------------------------//

    obtenerConsultorPorId = async (
        request: FastifyRequest<{Params: {idConsultor: string}}>,
        reply: FastifyReply
    ) => {
        
            const { idConsultor } = request.params;
            const consultorEncontrado = await this.consultorCasosUso.obtenerConsultorPorId(idConsultor);

            if (!consultorEncontrado) {
                return reply.code(HttpStatus.NO_ENCONTRADO).send({
                    mensaje: "Consultor no encontrado",
                });
            } 

            return reply.code(HttpStatus.EXITO).send({
                mensaje: "Consultor encontrado correctamente",
                consultor: consultorEncontrado,
            });
        };

        //---------------------------------METODO POST---------------------------------//

    crearConsultor = async (
        request: FastifyRequest<{Body: ConsultorDTO}>,
        reply: FastifyReply
    ) => {
       
            const nuevoConsultor = CrearConsultorEsquema.parse(request.body);
            const idNuevoConsultor = await this.consultorCasosUso.crearConsultor(nuevoConsultor);

            return reply.code(HttpStatus.CREADO).send({                
                mensaje: "El consultor se creo correctamente",
                idConsultor: idNuevoConsultor,
            });
        };

        //---------------------------------METODO UPDATE---------------------------------//

    actualizarConsultor = async (
        request: FastifyRequest<{Params: {idConsultor: string}; Body: Partial<ConsultorDTO>}>,  //REVISAR
        reply: FastifyReply
    ) => {
        
            const { idConsultor } = request.params;
            const nuevoConsultor = request.body;
            const consultorActualizado = await this.consultorCasosUso.actualizarConsultor(
                idConsultor, 
                nuevoConsultor
            );

            if (!consultorActualizado) {
                return reply.code(HttpStatus.NO_ENCONTRADO).send({
                    mensaje:"Consultor no encontrado para actualizar",
                });
            }

            return reply.code(HttpStatus.EXITO).send({
                mensaje: "Consultor actualizado correctamente",
                consultorActualizado: consultorActualizado,
            });
        };

        //---------------------------------METODO DELETE---------------------------------//

    eliminarConsultor = async (
        request: FastifyRequest<{Params: {idConsultor: string}}>,
        reply: FastifyReply
    ) => {
        
            const { idConsultor } = request.params;
            await this.consultorCasosUso.eliminarConsultor(idConsultor);
            //const consultorEliminado = await this.consultorCasosUso.eliminarConsultor(idConsultor);

            return reply.code(HttpStatus.EXITO).send({
                mensaje: "Consultor eliminado correctamente",
                //consultorEliminado: consultorEliminado,
            });
        };
}