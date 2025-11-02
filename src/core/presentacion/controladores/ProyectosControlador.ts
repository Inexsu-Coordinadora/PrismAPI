import { FastifyRequest, FastifyReply } from "fastify";
import { IProyectosCasosUso } from "../../aplicacion/IProyectosCasosUso";
import { CrearProyectoEsquema, ProyectoDTO } from "../esquemas/proyectoEsquema";
import { ZodError } from "zod";
import { IProyecto } from "../../dominio/IProyecto";
import { request } from "http";
import { ProyectoQueryParams } from "../../dominio/ProyectoQueryParams";

export class ProyectosControlador {
    constructor(private proyectosCasosUso: IProyectosCasosUso){}

    obtenerProyectos = async (
        request: FastifyRequest<{
            Querystring: ProyectoQueryParams}>,         
        reply: FastifyReply
    ) =>{
        try{
            const {
                nombre, estado, fechaInicioDesde, fechaInicioHasta, pagina, limite, ordenarPor, ordenarOrden
            } = request.query;

            const params ={                 nombre, 
                estado,
                fechaInicioDesde: fechaInicioDesde ? new Date(fechaInicioDesde): undefined,
                fechaInicioHasta : fechaInicioHasta ? new Date(fechaInicioHasta) : undefined,
                pagina : pagina ? Number(pagina) : 1,
                limite: limite ? Number(limite): 10,
                ordenarPor,
                ordenarOrden,
            } as ProyectoQueryParams;

            const resultado = await this.proyectosCasosUso.obtenerProyectos(params);

            return reply.code(200).send({
                mensaje :"Proyectos obtenidos correctamente",
                total: resultado.total,
                pagina: resultado.pagina,
                limite: resultado.limite,
                data: resultado.data,
            });
        }catch (err){
            return reply.code(500).send({
                mensaje: "Error al obtener los proyectos",
                error: err instanceof Error ? err.message : err,
            });
        }
    };

    obtenerProyectoPorId = async (
        request: FastifyRequest<{
            Params: {idProyecto: string}}>,
            reply:FastifyReply
        ) =>{
            try{
                const { idProyecto } = request.params;
                const proyectoEncontrado = await this.proyectosCasosUso.obtenerProyectoPorId(idProyecto);

                if (!proyectoEncontrado){
                    return reply.code(404).send({
                        mensaje: "Proyecto no encontrado",
                    });
                }

                return reply.code(200).send({
                    mensaje: "Proyecto encontrado correctamente",
                    proyecto: proyectoEncontrado
                });
            } catch (err){
                return reply.code(500).send({
                    mensaje: "Error al obtener el proyecto",
                    error: err instanceof 
                    Error ? err.message : err,
                });
            }
        };

        crearProyecto = async(
            request: FastifyRequest<{Body:ProyectoDTO}>,
            reply: FastifyReply
        ) => {
            try {
                const nuevoProyecto = CrearProyectoEsquema.parse(request.body);
                const idNuevoProyecto = await this.proyectosCasosUso.crearProyecto(nuevoProyecto);

                return reply.code(200).send({
                    mensaje:"El proyecto se creó correctamente",
                    idNuevoProyecto: idNuevoProyecto,
                });
            } catch (err){
                if(err instanceof ZodError){
                    return reply.code(400).send({
                        mensaje: "Error crear nuevo proyecto",
                        error: err.issues[0]?.message || "Error desconocido",
                    });
                }
                return reply.code(500).send({
                    mensaje: "Error crear un nuevo plato",
                    error: err instanceof Error ? err.message: String (err),
                });
            }
        };

        actualizarProyecto = async (
            request: FastifyRequest<{
            Params:{idProyecto:string};
            Body: IProyecto}>,
            reply:FastifyReply
        )=>{
            try{

                const {idProyecto}= request.params;
                const nuevoProyecto = request.body;
                const proyectoActualizado = await this.proyectosCasosUso.actualizarProyecto(
                    idProyecto, nuevoProyecto
                );

                if (!proyectoActualizado){
                    return reply.code (404).send({
                        mensaje: 'Proyecto no encontrado',
                });
                }
                return reply.code(200).send({
                    mensaje: "Proyecto actualizado correctamente",
                    proyectoActualizado: proyectoActualizado,
                });
            } catch (err){
                return reply.code(500).send({
                    mensaje: "Error al actualizar el proyecto",
                    error: err instanceof Error ? err.message : err,
                });
            }
        };

        eliminarProyecto = async(
            request: FastifyRequest<{
            Params : {idProyecto: string}
            }>,
            reply: FastifyReply
        ) =>{
            try {
                const {idProyecto} = request.params;
                await this.proyectosCasosUso.eliminarProyecto(idProyecto);

                return reply.code(200).send({
                    mensaje: "Proeycto eliminado correctamente",
                    idProyecto: idProyecto,
                });
            } catch (err){
                return reply.code(500).send({
                    mensaje: "Error al eliminar el proyecto",
                    error: err instanceof Error ? err.message :err,
                });
            }
            };
        }
        
            
        








        
    
