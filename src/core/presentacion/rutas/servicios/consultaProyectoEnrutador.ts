import { FastifyInstance } from "fastify";
import { 
  ConsultaProyectoParamsSchema, 
  ConsultaProyectoQuerySchema, 
  ConsultaProyectoResponse200Schema,
  ErrorResponse400NegocioConEjemplos,
  ErrorResponse404ConEjemplos
} from "../../../../docs/schemas/servicios/consultaProyectoSchema";
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
    {
      schema: {
        tags: ['DEMO PRESENTACIÓN', 'Consulta Proyectos'],
        summary: "1. Consultar proyectos de un cliente",
        description: "Obtiene todos los proyectos de un cliente específico con sus consultores asignados. Permite filtrar por estado y rango de fechas.",
        params: ConsultaProyectoParamsSchema,
        querystring: ConsultaProyectoQuerySchema,
        response: {
          200: {
            description: "Consulta ejecutada correctamente. Devuelve los proyectos del cliente (con consultores y filtros aplicados).",
            ...ConsultaProyectoResponse200Schema
          },
          400: {
            description: "Errores de negocio: rango de fechas inválido o filtros inconsistentes.",
            ...ErrorResponse400NegocioConEjemplos
          },
          404: {
            description: "El cliente solicitado no existe o no tiene proyectos asociados.",
            ...ErrorResponse404ConEjemplos
          }
        }
      }
    },
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
  
