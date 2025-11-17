import { FastifyInstance } from "fastify";

import { ConsultarProyectosPorClienteServicio } from "../../../aplicacion/casos-uso/servicios/ConsultaProyectoServicio";
import { IConsultaProyectosPorClienteServicio } from "../../../aplicacion/interfaces/servicios/IConsultaProyectoServicio";
import { ConsultarProyectosPorClienteRepositorio } from "../../../infraestructura/postgres/repositorios/servicios/ConsultaProyectoRepository";
import { ConsultaProyectoControlador } from "../../controladores/servicios/ConsultaProyectoControlador";

function consultaProyectoEnrutador(
  app: FastifyInstance,
  controlador: ConsultaProyectoControlador
) {
  app.get(
    "/clientes/:idCliente/proyectos",
    controlador.consultarClienteProyecto  
  );
}

export async function construirConsultaProyectoEnrutador(app: FastifyInstance) {
 
  const repositorio = new ConsultarProyectosPorClienteRepositorio();

  const servicio: IConsultaProyectosPorClienteServicio =
    new ConsultarProyectosPorClienteServicio(repositorio);

  const controlador = new ConsultaProyectoControlador(servicio);


  consultaProyectoEnrutador(app, controlador);
}
  
