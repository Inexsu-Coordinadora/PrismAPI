import { FastifyRequest, FastifyReply } from "fastify";
import {
  consultarProyectosPorClienteParamsEsquema,
  consultarProyectosPorClienteQueryEsquema,
  ConsultarProyectosPorClienteParams,
  FiltrosConsultaProyectos,
} from "../../esquemas/servicios/consultaProyectoEsquema";

import { IConsultaProyectosPorClienteServicio } from "../../../aplicacion/interfaces/servicios/IConsultaProyectoServicio";
import { HttpStatus } from "../../../../common/errores/statusCode";


export class ConsultaProyectoControlador {

  constructor(
    private readonly consultaProyectosServicio: IConsultaProyectosPorClienteServicio
  ) { }


  consultarClienteProyecto = async (
    request: FastifyRequest<{
      Params: ConsultarProyectosPorClienteParams;
      Querystring: FiltrosConsultaProyectos;
    }>,
    reply: FastifyReply
  ) => {

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

    return reply.code(HttpStatus.EXITO).send(proyectos)

  }
};
