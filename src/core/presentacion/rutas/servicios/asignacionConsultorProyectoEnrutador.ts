import { FastifyInstance } from "fastify";
import { AsignacionConsultorProyectoControlador } from "../../controladores/servicios/AsignacionConsultorProyectoControlador";
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
            summary: "Asignar un consultor a un proyecto",
            description: "Crea una nueva asignación de consultor a proyecto con validaciones de negocio (dedicación máxima 100%, fechas válidas, etc.)",
            body: {
                type: 'object',
                required: ['idConsultor', 'idProyecto', 'fechaInicioAsignacion'],
                properties: {
                    idConsultor: {
                        type: 'string',
                        format: 'uuid',
                        description: 'ID del consultor a asignar'
                    },
                    idProyecto: {
                        type: 'string',
                        format: 'uuid',
                        description: 'ID del proyecto al que se asigna el consultor'
                    },
                    rolConsultor: {
                        type: 'string',
                        minLength: 2,
                        maxLength: 30,
                        nullable: true,
                        description: 'Rol del consultor en el proyecto (opcional)'
                    },
                    porcentajeDedicacion: {
                        type: 'number',
                        minimum: 0,
                        maximum: 100,
                        nullable: true,
                        description: 'Porcentaje de dedicación del consultor (0-100%, opcional)'
                    },
                    fechaInicioAsignacion: {
                        type: 'string',
                        format: 'date',
                        description: 'Fecha de inicio de la asignación (YYYY-MM-DD)'
                    },
                    fechaFinAsignacion: {
                        type: 'string',
                        format: 'date',
                        nullable: true,
                        description: 'Fecha de fin de la asignación (YYYY-MM-DD, opcional)'
                    }
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        exito: { type: 'boolean' },
                        mensaje: { type: 'string' },
                        datos: {
                            type: 'object',
                            properties: {
                                idAsignacion: { type: 'string', format: 'uuid' }
                            }
                        }
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
    }, controlador.asignarConsultorProyecto);

    // GET - Obtener por ID
    app.get("/asignaciones/:idAsignacion", controlador.obtenerAsignacionPorId);

    // GET - Obtener asignaciones por consultor
    app.get("/asignaciones/consultor/:idConsultor", controlador.obtenerAsignacionPorConsultor);

    // GET - Obtener asignaciones por proyecto
    app.get("/asignaciones/proyecto/:idProyecto", controlador.obtenerAsignacionPorProyecto);

    // GET - Verificar asignación existente
    app.get("/asignaciones/verificar/existente", controlador.obtenerAsignacionExistente);

    // GET - Calcular dedicación del consultor
    app.get("/asignaciones/consultor/:idConsultor/dedicacion", controlador.obtenerDedicacionConsultor);

    // PUT - Actualizar asignación
    app.put("/asignaciones/:idAsignacion", controlador.actualizarAsignacion);

    // DELETE - Eliminar asignación
    app.delete("/asignaciones/:idAsignacion", controlador.eliminarAsignacion);
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