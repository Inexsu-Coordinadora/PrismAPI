import { FastifyInstance } from "fastify";
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
            tags: ['DEMO PRESENTACIÓN', 'Gestión Tareas'],
            summary: "Crear una tarea en un proyecto",
            description: "Crea una nueva tarea asociada a un proyecto específico. Valida que el proyecto exista y que el consultor asignado esté en el proyecto.",
            params: {
                type: 'object',
                properties: {
                    idProyecto: {
                        type: 'string',
                        format: 'uuid',
                        description: 'ID del proyecto donde se creará la tarea'
                    }
                },
                required: ['idProyecto']
            },
            body: {
                type: 'object',
                required: ['tituloTarea'],
                properties: {
                    tituloTarea: {
                        type: 'string',
                        minLength: 5,
                        maxLength: 100,
                        description: 'Título de la tarea (5-100 caracteres)'
                    },
                    descripcionTarea: {
                        type: 'string',
                        maxLength: 500,
                        nullable: true,
                        description: 'Descripción detallada de la tarea (máx. 500 caracteres)'
                    },
                    estadoTarea: {
                        type: 'string',
                        enum: ['pendiente', 'en-progreso', 'bloqueada', 'completada'],
                        default: 'pendiente',
                        description: 'Estado inicial de la tarea'
                    },
                    idConsultorAsignado: {
                        type: 'string',
                        format: 'uuid',
                        nullable: true,
                        description: 'ID del consultor asignado a la tarea (debe estar asignado al proyecto)'
                    },
                    fechaLimiteTarea: {
                        type: 'string',
                        format: 'date',
                        nullable: true,
                        description: 'Fecha límite de la tarea (YYYY-MM-DD)'
                    }
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        mensaje: { type: 'string' },
                        idNuevaTarea: { type: 'string', format: 'uuid' }
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
                }
            }
        }
    }, controlador.crearTareaEnProyecto);    
    app.get("/proyectos/:idProyecto/tareas", controlador.listarTareasProyecto);
    app.get("/proyectos/:idProyecto/tareas/:idTarea", controlador.obtenerTareaDeProyectoPorId);    
    app.put("/proyectos/:idProyecto/tareas/:idTarea", controlador.actualizarTareaEnProyecto);
    app.delete("/proyectos/:idProyecto/tareas/:idTarea", controlador.eliminarTareaEnProyecto);
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
