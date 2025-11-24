import { FastifyInstance } from "fastify";
import { ConsultorControlador } from "../../controladores/entidades/consultorControlador";
import { ConsultorCasosUso } from "../../../aplicacion/casos-uso/entidades/ConsultorCasosUso";
import {IConsultorRepositorio} from "../../../dominio/repositorio/entidades/IConsultorRepositorio";
import { IConsultorCasosUso } from "../../../aplicacion/interfaces/entidades/IConsultorCasosUso";
import { ConsultorRepository } from "../../../infraestructura/postgres/repositorios/entidades/ConsultorRepository";

function consultoresEnrutador(app:FastifyInstance, controlador: ConsultorControlador) {
    app.get("/consultores", {
      schema: {
        tags: ['Consultores']
      }
    }, controlador.obtenerConsultores);
    
    app.get("/consultores/:idConsultor", {
      schema: {
        tags: ['Consultores']
      }
    }, controlador.obtenerConsultorPorId);
    
    app.post("/consultores", {
      schema: {
        tags: ['Consultores']
      }
    }, controlador.crearConsultor);
    
    app.put("/consultores/:idConsultor", {
      schema: {
        tags: ['Consultores']
      }
    }, controlador.actualizarConsultor);
    
    app.delete("/consultores/:idConsultor", {
      schema: {
        tags: ['Consultores']
      }
    }, controlador.eliminarConsultor);
}

export async function construirConsultorEnrutador(app: FastifyInstance) {
    const consultorRepo: IConsultorRepositorio = new ConsultorRepository();
    const CCasosUso: IConsultorCasosUso = new ConsultorCasosUso(consultorRepo);
    const controlador =new ConsultorControlador(CCasosUso);

    consultoresEnrutador(app, controlador);
}