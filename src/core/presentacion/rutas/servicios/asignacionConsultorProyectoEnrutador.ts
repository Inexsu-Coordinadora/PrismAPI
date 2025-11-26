import { FastifyInstance } from "fastify";
import { AsignacionConsultorProyectoControlador } from "../../controladores/servicios/AsignacionConsultorProyectoControlador";
import { 
  AsignacionBodySchema, 
  AsignacionResponse201Schema, 
  ErrorResponse400NegocioConEjemplos,
  ErrorResponse404ConEjemplos,
  ErrorResponse409ConEjemplos
} from "../../../../docs/schemas/servicios/asignacionConsultorProyectoSchema";
import { IAsignacionConsultorProyectoServicio } from "../../../aplicacion/interfaces/servicios/IAsignacionConsultorProyectoServicio";
import { AsignacionConsultorProyectoRepository } from "../../../infraestructura/postgres/repositorios/servicios/AsignacionConsultorProyectoRepository";
import { AsignacionConsultorProyectoServicio } from "../../../aplicacion/casos-uso/servicios/AsignacionConsultorProyectoServicio";
import { ProyectoRepository } from "../../../infraestructura/postgres/repositorios/entidades/ProyectoRepository";
import { IAsignacionConsultorProyectoRepositorio } from "../../../dominio/repositorio/servicios/IAsignacionConsultorProyectoRepositorio";
import { IConsultorRepositorio } from "../../../dominio/repositorio/entidades/IConsultorRepositorio";
import { IProyectoRepositorio } from "../../../dominio/repositorio/entidades/IProyectoRepositorio";
import { GestionAsignacionConsultor } from "../../../aplicacion/gestion-servicio/GestionAsignacionConsultor";
import { ConsultorRepository } from "../../../infraestructura/postgres/repositorios/entidades/ConsultorRepository";

function asignacionConsultorProyectoEnrutador(
    app: FastifyInstance,
    controlador: AsignacionConsultorProyectoControlador
) {
      // POST - Crear asignación
    app.post("/asignaciones", {
        schema: {
            tags: ['DEMO PRESENTACIÓN', 'Asignaciones'],
            summary: "4. Asignar un consultor a un proyecto",
            description: "Crea una nueva asignación de consultor a proyecto con validaciones de negocio (dedicación máxima 100%, fechas válidas, etc.)",
            body: AsignacionBodySchema,
            response: {
                201: {
                    description: "Asignación creada exitosamente con el identificador generado.",
                    ...AsignacionResponse201Schema
                },
                400: {
                    description: "Errores de negocio: validaciones de dedicación, coherencia de fechas o rangos fuera del proyecto.",
                    ...ErrorResponse400NegocioConEjemplos
                },
                404: {
                    description: "No se encontró el consultor o el proyecto especificado.",
                    ...ErrorResponse404ConEjemplos
                },
                409: {
                    description: "Conflictos de negocio: asignación duplicada, consultor no disponible o proyecto finalizado.",
                    ...ErrorResponse409ConEjemplos
                }
            }
        }
    }, controlador.asignarConsultorProyecto);

    // GET - Obtener por ID
    app.get("/asignaciones/:idAsignacion", {
      schema: {
        tags: ['Asignaciones']
      }
    }, controlador.obtenerAsignacionPorId);

    // GET - Obtener asignaciones por consultor
    app.get("/asignaciones/consultor/:idConsultor", {
      schema: {
        tags: ['Asignaciones']
      }
    }, controlador.obtenerAsignacionPorConsultor);

    // GET - Obtener asignaciones por proyecto
    app.get("/asignaciones/proyecto/:idProyecto", {
      schema: {
        tags: ['Asignaciones']
      }
    }, controlador.obtenerAsignacionPorProyecto);

    // GET - Verificar asignación existente
    app.get("/asignaciones/verificar/existente", {
      schema: {
        tags: ['Asignaciones']
      }
    }, controlador.obtenerAsignacionExistente);

    // GET - Calcular dedicación del consultor
    app.get("/asignaciones/consultor/:idConsultor/dedicacion", {
      schema: {
        tags: ['Asignaciones']
      }
    }, controlador.obtenerDedicacionConsultor);

    // PUT - Actualizar asignación
    app.put("/asignaciones/:idAsignacion", {
      schema: {
        tags: ['Asignaciones']
      }
    }, controlador.actualizarAsignacion);

    // DELETE - Eliminar asignación
    app.delete("/asignaciones/:idAsignacion", {
      schema: {
        tags: ['Asignaciones']
      }
    }, controlador.eliminarAsignacion);
}

export async function construirAsignacionConsultorProyectoEnrutador(app: FastifyInstance) {
    // 1. Repositorios
    const asignacionRepositorio: IAsignacionConsultorProyectoRepositorio = new AsignacionConsultorProyectoRepository();
    const consultorRepositorio: IConsultorRepositorio = new ConsultorRepository();
    const proyectoRepositorio: IProyectoRepositorio = new ProyectoRepository();

    // 2. Validador
    const validador = new GestionAsignacionConsultor(
        consultorRepositorio,
        proyectoRepositorio,
        asignacionRepositorio
    );

    // 3. Servicio
    const asignacionServicio: IAsignacionConsultorProyectoServicio = new AsignacionConsultorProyectoServicio(
        asignacionRepositorio,
        validador
    );

    // 4. Controlador
    const controlador = new AsignacionConsultorProyectoControlador(asignacionServicio);

    // 5. Registrar rutas
    asignacionConsultorProyectoEnrutador(app, controlador);
}