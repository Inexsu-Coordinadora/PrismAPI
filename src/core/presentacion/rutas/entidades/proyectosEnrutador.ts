import { FastifyInstance } from "fastify";
import { ProyectosControlador } from "../../controladores/entidades/ProyectosControlador";
import { IProyectoRepositorio } from "../../../dominio/repositorio/entidades/IProyectoRepositorio";
import { ProyectoRepository } from "../../../infraestructura/postgres/repositorios/entidades/ProyectoRepository";
import { ProyectoCasosUso } from "../../../aplicacion/casos-uso/entidades/ProyectosCasosUso";



function proyectosEnrutador (
    app: FastifyInstance,
    proyectosController: ProyectosControlador
){
    app.get("/proyectos", {
      schema: {
        tags: ['Proyectos']
      }
    }, proyectosController.obtenerProyectos);
    
    app.get("/proyectos/:idProyecto", {
      schema: {
        tags: ['Proyectos']
      }
    }, proyectosController.obtenerProyectoPorId);
    
    app.post("/proyectos", {
      schema: {
        tags: ['Proyectos']
      }
    }, proyectosController.crearProyecto);
    
    app.put("/proyectos/:idProyecto", {
      schema: {
        tags: ['Proyectos']
      }
    }, proyectosController.actualizarProyecto);
    
    app.delete("/proyectos/:idProyecto", {
      schema: {
        tags: ['Proyectos']
      }
    }, proyectosController.eliminarProyecto);
}

export async function construirProyectosEnrutador(app: FastifyInstance){
    const proyectoRepositorio: IProyectoRepositorio = new ProyectoRepository();
    const proyectosCasosUso = new ProyectoCasosUso(proyectoRepositorio);
    const proyectosController = new ProyectosControlador(proyectosCasosUso);

    proyectosEnrutador (app, proyectosController);
}

