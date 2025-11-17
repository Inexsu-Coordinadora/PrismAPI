import { FastifyInstance } from "fastify";

import { ProyectosControlador } from "../../controladores/entidades/ProyectosControlador";
import { IProyectoRepositorio } from "../../../dominio/repositorio/entidades/IProyectoRepositorio";
import { ProyectoRepository } from "../../../infraestructura/postgres/repositorios/entidades/ProyectoRepository";
import { ProyectoCasosUso } from "../../../aplicacion/casos-uso/entidades/ProyectosCasosUso";
import { IProyectosCasosUso } from "../../../aplicacion/interfaces/entidades/IProyectosCasosUso";


function proyectosEnrutador (
    app: FastifyInstance,
    proyectosController: ProyectosControlador
){
    app.get("/proyectos", 
        proyectosController.obtenerProyectos);
    app.get("/proyectos/:idProyecto", proyectosController.obtenerProyectoPorId);
    app.post("/proyectos",proyectosController.crearProyecto);
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

