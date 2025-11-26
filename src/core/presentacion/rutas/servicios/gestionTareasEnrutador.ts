import { FastifyInstance } from "fastify";
import { 
  CrearTareaProyectoBodySchema, 
  TareaProyectoParamsSchema,
  TareaProyectoParamsConTareaSchema,
  ActualizarTareaProyectoBodySchema,
  TareaProyectoResponse201Schema,
  ListarTareasProyectoResponse200Schema,
  ActualizarTareaProyectoResponse200Schema,
  ErrorResponse400NegocioConEjemplos,
  ErrorResponse404ConEjemplos,
  ErrorResponse409ConEjemplos
} from "../../../../docs/schemas/servicios/gestionTareasSchema";
//* Importamos el "Ensamblador" de cada capa

//* Capa Presentación -> Controlador
import { GestionTareasControlador } from "../../controladores/servicios/GestionTareasControlador";

//*  Capa Aplicación -> Servicio/Cerebro
import { IGestionTareasServicio } from "../../../aplicacion/interfaces/servicios/IGestionTareasServicio";
import { GestionTareasServicio } from "../../../aplicacion/casos-uso/servicios/GestionTareasServicio";

// * Capa Infraestructura -> Repositorios (Implementaciones CONCRETAS)
import { TareaRepository } from "../../../infraestructura/postgres/repositorios/entidades/TareaRepository";
import { ProyectoRepository } from "../../../infraestructura/postgres/repositorios/entidades/ProyectoRepository";
import { ConsultorRepository } from "../../../infraestructura/postgres/repositorios/entidades/ConsultorRepository";
// TODO: import { AsignacionConsultorProyectoRepository } from "../../../infraestructura/postgres/repositorios/servicios/AsignacionConsultorProyectoRepository";

//* (CONTRATOS)
import { ITareaRepositorio } from "../../../dominio/repositorio/entidades/ITareasRepositorio";
import { IProyectoRepositorio } from "../../../dominio/repositorio/entidades/IProyectoRepositorio";
import { IConsultorRepositorio } from "../../../dominio/repositorio/entidades/IConsultorRepositorio";
import { IAsignacionConsultorProyectoRepositorio } from "../../../dominio/repositorio/servicios/IAsignacionConsultorProyectoRepositorio";
import { AsignacionConsultorProyectoRepository } from "../../../infraestructura/postgres/repositorios/servicios/AsignacionConsultorProyectoRepository";


  //* ----------------- 1. FUNCIÓN DE RUTAS -----------------//
function gestionTareasEnrutador(app: FastifyInstance, controlador: GestionTareasControlador){

    app.post("/proyectos/:idProyecto/tareas", {
        schema: {
            tags: ['Gestión Tareas'],
            summary: "Crear una tarea en un proyecto",
            description: "Crea una nueva tarea asociada a un proyecto específico. Valida que el proyecto exista y que el consultor asignado esté en el proyecto.",
            params: TareaProyectoParamsSchema,
            body: CrearTareaProyectoBodySchema,
            response: {
                201: TareaProyectoResponse201Schema,
                400: ErrorResponse400NegocioConEjemplos,
                404: ErrorResponse404ConEjemplos,
                409: ErrorResponse409ConEjemplos
            }
        }
    }, controlador.crearTareaEnProyecto);    
    
    app.get("/proyectos/:idProyecto/tareas", {
      schema: {
        tags: ['DEMO PRESENTACIÓN', 'Gestión Tareas'],
        summary: "2. Listar tareas de un proyecto",
        description: "Obtiene la lista de todas las tareas que pertenecen a un proyecto específico. Valida que el proyecto exista.",
        params: TareaProyectoParamsSchema,
        response: {
          200: {
            description: "Listado de tareas obtenido correctamente (incluye contador y detalle por tarea).",
            ...ListarTareasProyectoResponse200Schema
          },
          404: {
            description: "El proyecto indicado no existe o no es accesible.",
            ...ErrorResponse404ConEjemplos
          }
        }
      }
    }, controlador.listarTareasProyecto);
    
    app.get("/proyectos/:idProyecto/tareas/:idTarea", {
      schema: {
        tags: ['Gestión Tareas']
      }
    }, controlador.obtenerTareaDeProyectoPorId);    
    
    app.put("/proyectos/:idProyecto/tareas/:idTarea", {
      schema: {
        tags: ['DEMO PRESENTACIÓN', 'Gestión Tareas'],
        summary: "3. Actualizar una tarea de un proyecto",
        description: "Actualiza parcialmente una tarea (título, estado, consultor, etc.). Valida que la tarea exista y pertenezca al proyecto, y que el consultor asignado esté en el proyecto.",
        params: TareaProyectoParamsConTareaSchema,
        body: ActualizarTareaProyectoBodySchema,
        response: {
          200: {
            description: "Tarea actualizada correctamente.",
            ...ActualizarTareaProyectoResponse200Schema
          },
          400: {
            description: "Errores de negocio: fecha límite fuera del rango del proyecto o consultor no asignado al proyecto.",
            ...ErrorResponse400NegocioConEjemplos
          },
          404: {
            description: "No se encontró el proyecto, el consultor o la tarea asociada al proyecto.",
            ...ErrorResponse404ConEjemplos
          },
          409: {
            description: "Conflictos de negocio: la tarea ya se encuentra completada o el título está duplicado en el proyecto.",
            ...ErrorResponse409ConEjemplos
          }
        }
      }
    }, controlador.actualizarTareaEnProyecto);
    
    app.delete("/proyectos/:idProyecto/tareas/:idTarea", {
      schema: {
        tags: ['Gestión Tareas']
      }
    }, controlador.eliminarTareaEnProyecto);
}

//* ----------------- 2. FUNCIÓN CONSTRUCTORA (Builder) -----------------//
//* Aquí ocurre la Inyección de Dependencias.
export async function construirGestionTareasEnrutador(app: FastifyInstance) {

    //* 1. Capa Infraestructura (Creamos las herramientas)
    const tareaRepo: ITareaRepositorio = new TareaRepository();
    const proyectoRepo: IProyectoRepositorio = new ProyectoRepository();
    const consultorRepo: IConsultorRepositorio = new ConsultorRepository();
    const asignacionRepo: IAsignacionConsultorProyectoRepositorio = new AsignacionConsultorProyectoRepository();


    //* 2. Capa Aplicación (Creamos el "cerebro" y le pasamos las herramientas)
    const gestionTareasServicio: IGestionTareasServicio = new GestionTareasServicio(
        tareaRepo,
        proyectoRepo,
        consultorRepo,
        asignacionRepo
    );

    //* 3. Capa Presentación (Creamos el "controlador" y le pasamos el cerebro)
    const gestionTareasController = new GestionTareasControlador(gestionTareasServicio);

    //* 4. Conectamos el mapa de rutas con el controlador
    gestionTareasEnrutador(app, gestionTareasController);
}
