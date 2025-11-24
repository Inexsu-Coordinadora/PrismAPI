import { FastifyInstance } from "fastify";
import { RegistroHorasServicio } from "../../../aplicacion/casos-uso/servicios/RegistroHorasServicio";
import { 
  RegistroHorasBodySchema, 
  RegistroHorasResponse201Schema,
  ErrorResponse400NegocioConEjemplos,
  ErrorResponse404ConEjemplos,
  ErrorResponse409ConEjemplos
} from "../../../../docs/schemas/servicios/registroHorasSchema";
import { IRegistroHorasServicio } from "../../../aplicacion/interfaces/servicios/IRegistroHorasServicio";
import { ConsultorRepository } from "../../../infraestructura/postgres/repositorios/entidades/ConsultorRepository";
import { ProyectoRepository } from "../../../infraestructura/postgres/repositorios/entidades/ProyectoRepository";
import { RegistroHorasRepository } from "../../../infraestructura/postgres/repositorios/servicios/RegistroHorasRepository";
import { AsignacionConsultorProyectoRepository } from "../../../infraestructura/postgres/repositorios/servicios/AsignacionConsultorProyectoRepository";
import { RegistroHorasControlador } from "../../controladores/servicios/RegistroHorasControlador";

function registroHorasRutas(app: FastifyInstance, controlador: RegistroHorasControlador) {
  
  app.get("/registrar-horas", {
    schema: {
      tags: ['Registro Horas']
    }
  }, controlador.listarRegistrosHoras);

  app.get("/registrar-horas/:idRegistro", {
    schema: {
      tags: ['Registro Horas']
    }
  }, controlador.obtenerRegistroHoraPorId);

  app.post("/registrar-horas", {
    schema: {
      tags: ['DEMO PRESENTACIÓN', 'Registro Horas'],
      summary: "3. Registrar horas trabajadas",
      description: "Crea un nuevo registro de horas trabajadas por un consultor en un proyecto. Valida que el consultor esté asignado al proyecto y que la fecha esté dentro del rango de asignación.",
      body: RegistroHorasBodySchema,
      response: {
        201: RegistroHorasResponse201Schema,
        400: ErrorResponse400NegocioConEjemplos,
        404: ErrorResponse404ConEjemplos,
        409: ErrorResponse409ConEjemplos
      }
    }
  }, controlador.crearRegistroHoras);

  app.delete("/registrar-horas/:idRegistro", {
    schema: {
      tags: ['Registro Horas']
    }
  }, controlador.eliminarRegistroHoras);
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
