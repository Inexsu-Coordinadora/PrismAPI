import { FastifyRequest, FastifyReply } from "fastify";
import { IProyectosCasosUso } from "../../../aplicacion/interfaces/entidades/IProyectosCasosUso";
import { CrearProyectoEsquema, ActualizarProyectoEsquema, ProyectoDTO, ActualizarProyectoDTO} from "../../esquemas/entidades/proyectoEsquema";
import { ProyectoQueryParams } from "../../../dominio/tipos/proyecto/ProyectoQueryParams";
import { HttpStatus } from "../../../../common/errores/statusCode";
import { NotFoundError } from "../../../../common/errores/AppError";



export class ProyectosControlador {
    constructor(private proyectosCasosUso: IProyectosCasosUso){}

    obtenerProyectos = async (
        request: FastifyRequest<{
            Querystring: ProyectoQueryParams}>,         
        reply: FastifyReply
    ) =>{        
            const {
                nombre, estado, fechaInicioDesde, fechaInicioHasta, pagina, limite, ordenarPor, ordenarOrden
            } = request.query;

            const params ={nombre, 
                estado,
                fechaInicioDesde: fechaInicioDesde ? new Date(fechaInicioDesde): undefined,
                fechaInicioHasta : fechaInicioHasta ? new Date(fechaInicioHasta) : undefined,
                pagina : pagina ? Number(pagina) : 1,
                limite: limite ? Number(limite): 10,
                ordenarPor,
                ordenarOrden,
            } as ProyectoQueryParams;

            const resultado = await this.proyectosCasosUso.obtenerProyectos(params);

            return reply.code(HttpStatus.EXITO).send({
                mensaje :"Proyectos obtenidos correctamente",
                total: resultado.total,
                pagina: resultado.pagina,
                limite: resultado.limite,
                data: resultado.data,
            });
        }

    obtenerProyectoPorId = async (
        request: FastifyRequest<{
            Params: {idProyecto: string}}>,
            reply:FastifyReply
        ) =>{            
                const { idProyecto } = request.params;
                const proyectoEncontrado = await this.proyectosCasosUso.obtenerProyectoPorId(idProyecto);

                if (!proyectoEncontrado){
                    throw new NotFoundError("Proyecto no encontrado");                        
                    }
                

                return reply.code(HttpStatus.EXITO).send({
                    mensaje: "Proyecto encontrado correctamente",
                    proyecto: proyectoEncontrado,
                });
        }

        crearProyecto = async(
            request: FastifyRequest<{Body:ProyectoDTO}>,
            reply: FastifyReply
        ) => {            
                const nuevoProyecto = CrearProyectoEsquema.parse(request.body);
                const idNuevoProyecto = await this.proyectosCasosUso.crearProyecto(nuevoProyecto);

                return reply.code(HttpStatus.CREADO).send({
                    mensaje:"El proyecto se creó correctamente",
                    idNuevoProyecto: idNuevoProyecto,
                });
            } 

        actualizarProyecto = async (
            request: FastifyRequest<{
            Params:{idProyecto:string};
            Body: ActualizarProyectoDTO }>,
            reply:FastifyReply
        )=>{            

                const {idProyecto}= request.params;
                const nuevoProyecto = ActualizarProyectoEsquema.parse(request.body);
                const proyectoActualizado = await this.proyectosCasosUso.actualizarProyecto(
                    idProyecto, nuevoProyecto
                );

                if (!proyectoActualizado){
                    throw new NotFoundError('Proyecto no encontrado para actualizar');                        
                }
                
                return reply.code(HttpStatus.EXITO).send({
                    mensaje: "Proyecto actualizado correctamente",
                    proyectoActualizado: proyectoActualizado,
                });
            }         
        

        eliminarProyecto = async(
            request: FastifyRequest<{
            Params : {idProyecto: string}
            }>,
            reply: FastifyReply
        ) =>{
                const {idProyecto} = request.params;
                const proyecto = await this.proyectosCasosUso.obtenerProyectoPorId(idProyecto);

                if(!proyecto){
                    throw new NotFoundError("Proyecto no encontrado para eliminar");
                }

                await this.proyectosCasosUso.eliminarProyecto(idProyecto);

                return reply.code(HttpStatus.EXITO).send({
                    mensaje: "Proyecto eliminado correctamente",
                    idProyecto: idProyecto,
                });
            };
        }
        
            
        








        
    