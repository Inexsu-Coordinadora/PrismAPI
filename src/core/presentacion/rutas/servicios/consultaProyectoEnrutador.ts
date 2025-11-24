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
    {
      schema: {
        tags: ['DEMO PRESENTACIÓN', 'Consulta Proyectos'],
        summary: "Consultar proyectos de un cliente",
        description: "Obtiene todos los proyectos de un cliente específico con sus consultores asignados. Permite filtrar por estado y rango de fechas.",
        params: {
          type: 'object',
          properties: {
            idCliente: {
              type: 'string',
              format: 'uuid',
              description: 'ID del cliente cuyos proyectos se desean consultar'
            }
          },
          required: ['idCliente']
        },
        querystring: {
          type: 'object',
          properties: {
            estadoProyecto: {
              type: 'string',
              enum: ['activo', 'finalizado', 'pendiente'],
              description: 'Filtrar por estado del proyecto (opcional)'
            },
            fechaInicioProyecto: {
              type: 'string',
              format: 'date',
              description: 'Filtrar proyectos con fecha de inicio mayor o igual (YYYY-MM-DD, opcional)'
            },
            fechaFinProyecto: {
              type: 'string',
              format: 'date',
              description: 'Filtrar proyectos con fecha de fin menor o igual (YYYY-MM-DD, opcional)'
            }
          }
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                codigoProyecto: { type: 'string' },
                nombreProyecto: { type: 'string' },
                estadoProyecto: { 
                  type: 'string',
                  enum: ['activo', 'finalizado', 'pendiente']
                },
                fechaInicioProyecto: { type: 'string', nullable: true },
                fechaFinProyecto: { type: 'string', nullable: true },
                consultores: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      nombre: { type: 'string' },
                      rol: { type: 'string', nullable: true }
                    }
                  }
                }
              }
            }
          },
          404: {
            type: 'object',
            properties: {
              mensaje: { type: 'string' }
            }
          },
          400: {
            type: 'object',
            properties: {
              mensaje: { type: 'string' }
            }
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
  
