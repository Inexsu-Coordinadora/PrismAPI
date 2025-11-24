import { FastifyInstance } from "fastify";
import { TareasControlador } from "../../controladores/entidades/tareasControlador";
import { ITareaRepositorio } from "../../../dominio/repositorio/entidades/ITareasRepositorio";
import { ITareasCasosUso } from "../../../aplicacion/interfaces/entidades/ITareasCasosUso";
import { TareasCasosUso } from "../../../aplicacion/casos-uso/entidades/TareaCasosUso";
import { TareaRepository } from "../../../infraestructura/postgres/repositorios/entidades/TareaRepository";


 //* ----------------- 1. FUNCIÓN DE RUTAS -----------------//
 //* Esta función define las rutas HTTP y las conecta a los métodos del controlador. Es el "mapa" de la API.
    function tareasEnrutador(
        app: FastifyInstance,
        controlador: TareasControlador
    ){
        
        //* GET /tareas - Listar todas las tareas
        app.get("/tareas", {
            schema: {
                tags: ['Tareas'],
                summary: "Listar todas las tareas",
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            mensaje: { type: 'string' },
                            tareas: {
                                type: 'array',
                                items: { $ref: 'TareaSchema#' }
                            },
                            total: { type: 'number' }
                        }
                    }
                }
            }
        }, controlador.listarTareas);

        //* GET /tareas/:idTarea - Obtener tarea por ID
        app.get("/tareas/:idTarea", {
            schema: {
                tags: ['Tareas'],
                summary: "Obtener una tarea por su ID",
                params: {
                    type: 'object',
                    properties: {
                        idTarea: { 
                            type: 'string', 
                            format: 'uuid',
                            description: 'ID único de la tarea'
                        }
                    },
                    required: ['idTarea']
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            mensaje: { type: 'string' },
                            tarea: { $ref: 'TareaSchema#' }
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
        }, controlador.obtenerTareaPorId);

        //* POST /tareas - Crear nueva tarea
        app.post("/tareas", {
            schema: {
                tags: ['Tareas'],
                summary: "Crear una nueva tarea",
                description: "Crea una nueva tarea en el sistema. El título es obligatorio y debe tener entre 5 y 100 caracteres.",
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
                        }
                    }
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            mensaje: { type: 'string' },
                            idNuevaTarea: { 
                                type: 'string',
                                format: 'uuid',
                                description: 'ID de la tarea recién creada'
                            }
                        }
                    }
                }
            }
        }, controlador.crearTarea);

        //* PUT /tareas/:idTarea - Actualizar tarea
        app.put("/tareas/:idTarea", {
            schema: {
                tags: ['Tareas'],
                summary: "Actualizar una tarea existente",
                params: {
                    type: 'object',
                    properties: {
                        idTarea: { 
                            type: 'string', 
                            format: 'uuid',
                            description: 'ID único de la tarea a actualizar'
                        }
                    },
                    required: ['idTarea']
                },
                body: {
                    type: 'object',
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
                            description: 'Estado de la tarea'
                        }
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            mensaje: { type: 'string' },
                            tareaActualizada: { $ref: 'TareaSchema#' }
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
        }, controlador.actualizarTarea);

        //* DELETE /tareas/:idTarea - Eliminar tarea
        app.delete("/tareas/:idTarea", {
            schema: {
                tags: ['Tareas'],
                summary: "Eliminar una tarea",
                params: {
                    type: 'object',
                    properties: {
                        idTarea: { 
                            type: 'string', 
                            format: 'uuid',
                            description: 'ID único de la tarea a eliminar'
                        }
                    },
                    required: ['idTarea']
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            mensaje: { type: 'string' },
                            idTareaEliminada: { 
                                type: 'string',
                                format: 'uuid',
                                description: 'ID de la tarea eliminada'
                            }
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
        }, controlador.eliminarTarea);
    }

    //* ----------------- 2. FUNCIÓN CONSTRUCTORA (Builder) -----------------//
    //* Esta es la función MÁS IMPORTANTE. Aquí es donde ocurre la Inyección de Dependencias -> conectar todas las capas.

    export async function construirTareasEnrutador (app:FastifyInstance) {
        //* Las capas se leen de adentro hacia afuera (de la BD hacia la API):

        //* 1°. Creamos la capa de REPOSITORIO
        const tareasRepo: ITareaRepositorio = new TareaRepository();

        //* 2°. Creamos la capa de CASOS DE USO y le inyectamos el repositorio
        const tareasCasosUso: ITareasCasosUso = new TareasCasosUso(tareasRepo);

        //* 3°. Creamos la capa de CONTROLADOR y le inyectamos los casos de uso
        const tareasController = new TareasControlador(tareasCasosUso);

        //* 4°. Finalmente, se le pasa el controlador al mapa de rutas
        tareasEnrutador(app, tareasController);
    }