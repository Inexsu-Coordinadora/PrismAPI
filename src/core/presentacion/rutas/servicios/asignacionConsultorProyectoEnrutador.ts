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
    app.post("/asignaciones", controlador.asignarConsultorProyecto);

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