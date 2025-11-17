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

    app.post("/proyectos/:idProyecto/tareas", controlador.crearTareaEnProyecto);    
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
