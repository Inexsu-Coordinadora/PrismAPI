import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";

import {
  consultarProyectosPorClienteParamsEsquema,
  consultarProyectosPorClienteQueryEsquema,
  ConsultarProyectosPorClienteParams,
  FiltrosConsultaProyectos,
} from "../../esquemas/servicios/consultaProyectoEsquema";

import { IConsultaProyectosPorClienteServicio } from "../../../aplicacion/interfaces/servicios/IConsultaProyectoServicio";


export class ConsultaProyectoControlador {

  constructor(
    private readonly consultaProyectosServicio: IConsultaProyectosPorClienteServicio
  ) {}


  consultarClienteProyecto = async (
    request: FastifyRequest<{
      Params: ConsultarProyectosPorClienteParams;
      Querystring: FiltrosConsultaProyectos;
    }>,

    reply: FastifyReply
  ) => {
    try {
      const { idCliente } = consultarProyectosPorClienteParamsEsquema.parse(
        request.params
      );

      const filtrosQuery = consultarProyectosPorClienteQueryEsquema.parse(
        request.query
      );
      
    
      const proyectos = await this.consultaProyectosServicio.consultarProyectosPorClienteServicio(
        idCliente,
        filtrosQuery
      );  

     
    return reply.code(200).send (proyectos)
    
   

    } catch (error) {
      return this.manejarError(
        reply,
        error,
        "Error al consultar los proyectos del cliente"
      );
    }
  };


  private manejarError(reply: FastifyReply, error: unknown, mensajeBase: string) {

    if (error instanceof ZodError) {
      return reply.code(400).send({
        mensaje: mensajeBase,
        error: error.issues[0]?.message || "Error de validación",
      });
    }

    
    if (
      error instanceof Error &&
      (error.message.includes("no encontrado") ||
        error.message.includes("no encontrada"))
    ) {
      return reply.code(404).send({
        mensaje: error.message,
      });
    }

    if (error instanceof Error) {
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
