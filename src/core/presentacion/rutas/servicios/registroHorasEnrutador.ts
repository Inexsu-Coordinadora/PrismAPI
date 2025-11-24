import { FastifyInstance } from "fastify";
import { RegistroHorasServicio } from "../../../aplicacion/casos-uso/servicios/RegistroHorasServicio";
import { IRegistroHorasServicio } from "../../../aplicacion/interfaces/servicios/IRegistroHorasServicio";
import { ConsultorRepository } from "../../../infraestructura/postgres/repositorios/entidades/ConsultorRepository";
import { ProyectoRepository } from "../../../infraestructura/postgres/repositorios/entidades/ProyectoRepository";
import { RegistroHorasRepository } from "../../../infraestructura/postgres/repositorios/servicios/RegistroHorasRepository";
import { AsignacionConsultorProyectoRepository } from "../../../infraestructura/postgres/repositorios/servicios/AsignacionConsultorProyectoRepository";
import { RegistroHorasControlador } from "../../controladores/servicios/RegistroHorasControlador";

function registroHorasRutas(app: FastifyInstance, controlador: RegistroHorasControlador) {
  
  app.get("/registrar-horas", controlador.listarRegistrosHoras);

  app.get("/registrar-horas/:idRegistro", controlador.obtenerRegistroHoraPorId);

  app.post("/registrar-horas", {
    schema: {
      tags: ['DEMO PRESENTACIÓN', 'Registro Horas'],
      summary: "Registrar horas trabajadas",
      description: "Crea un nuevo registro de horas trabajadas por un consultor en un proyecto. Valida que el consultor esté asignado al proyecto y que la fecha esté dentro del rango de asignación.",
      body: {
        type: 'object',
        required: ['id_consultor', 'id_proyecto', 'fecha_registro', 'horas_trabajadas', 'descripcion_actividad'],
        properties: {
          id_consultor: {
            type: 'string',
            format: 'uuid',
            description: 'ID del consultor que registra las horas'
          },
          id_proyecto: {
            type: 'string',
            format: 'uuid',
            description: 'ID del proyecto donde se trabajaron las horas'
          },
          fecha_registro: {
            type: 'string',
            format: 'date',
            description: 'Fecha del registro de horas (YYYY-MM-DD)'
          },
          horas_trabajadas: {
            type: 'number',
            minimum: 0.01,
            maximum: 24,
            description: 'Cantidad de horas trabajadas (0.01 - 24 horas)'
          },
          descripcion_actividad: {
            type: 'string',
            minLength: 1,
            maxLength: 500,
            description: 'Descripción de la actividad realizada (1-500 caracteres)'
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            mensaje: { type: 'string' },
            registro: {
              type: 'object',
              properties: {
                idRegistroHoras: { type: 'string', format: 'uuid' },
                idConsultor: { type: 'string', format: 'uuid' },
                idProyecto: { type: 'string', format: 'uuid' },
                fechaRegistro: { type: 'string', format: 'date' },
                horasTrabajadas: { type: 'number' },
                descripcionActividad: { type: 'string' }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            mensaje: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            mensaje: { type: 'string' }
          }
        },
        409: {
          type: 'object',
          properties: {
            mensaje: { type: 'string' }
          }
        }
      }
    }
  }, controlador.crearRegistroHoras);

  app.delete("/registrar-horas/:idRegistro", controlador.eliminarRegistroHoras);
}

export async function construirRegistroHorasEnrutador(app: FastifyInstance) {

  const consultorRepo = new ConsultorRepository();
  const proyectoRepo = new ProyectoRepository();
  const registroHorasRepo = new RegistroHorasRepository();
  const asignacionRepo = new AsignacionConsultorProyectoRepository();

  const registroHorasServicio: IRegistroHorasServicio = new RegistroHorasServicio(
    registroHorasRepo,
    consultorRepo,
    proyectoRepo,
    asignacionRepo
  );

  const controlador = new RegistroHorasControlador(registroHorasServicio);

  registroHorasRutas(app, controlador);
}
