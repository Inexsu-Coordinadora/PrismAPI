import { FastifyInstance } from "fastify";
import { ProyectosControlador } from "../controladores/ProyectosControlador";
import { IProyectoRepositorio } from "../../dominio/repositorio/IProyectoRepositorio";
import { ProyectoRepository } from "../../infraestructura/ProyectoRepository";
import { ProyectoCasosUso } from "../../aplicacion/ProyectosCasosUso";
import { IProyectosCasosUso } from "../../aplicacion/IProyectosCasosUso";

function proyectosEnrutador (
    app: FastifyInstance,
    proyectosController: ProyectosControlador
){
    app.get("/proyectos", 
        proyectosController.obtenerProyectos);
    app.get("/proyectos/:idProyecto", proyectosController.obtenerProyectoPorId);
    app.post("proyectos",proyectosController.crearProyecto);
    app.put("/proyectos/:idProyecto", proyectosController.actualizarProyecto);
    app.delete("/proyectos/:idProyecto", proyectosController.eliminarProyecto);
}

export async function construirProyectosEnrutador(app: FastifyInstance){
    const proyectoRepositorio:
    IProyectoRepositorio = new ProyectoRepository();
    const proyectosCasosUso = new ProyectoCasosUso(proyectoRepositorio);
    const proyectosController = new ProyectosControlador(proyectosCasosUso);

    proyectosEnrutador (app, proyectosController);
}