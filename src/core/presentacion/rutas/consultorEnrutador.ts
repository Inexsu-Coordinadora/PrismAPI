import { FastifyInstance } from "fastify";
import { ConsultorControlador } from "../controladores/consultorControlador";
import { ConsultorCasosUso } from "../../aplicacion/ConsultorCasosUso";
import {IConsultorRepositorio} from "../../dominio/repositorio/IConsultorRepositorio";
import {IConsultorCasosUso} from "../../aplicacion/IConsultorCasosUso";
import {ConsultorRepositorio} from "../../infraestructura/ConsultorRepository";

function consultoresEnrutador(app:FastifyInstance, controlador: ConsultorControlador) {
    app.get("/consultores", controlador.obtenerConsultores);
    app.get("/consultores/:idConsultor",controlador.obtenerConsultorPorId);
    app.post("/consultores", controlador.crearConsultor);
    app.put("/consultores/:idConsultor",controlador.actualizarConsultor);
    app.delete("/consultores/:idConsultor",controlador.eliminarConsultor);
}

export async function construirConsultorEnrutador(app: FastifyInstance) {
    const consultorRepo: IConsultorRepositorio = new ConsultorRepositorio();
    const CCasosUso: IConsultorCasosUso = new ConsultorCasosUso(consultorRepo);
    const controlador =new ConsultorControlador(CCasosUso);

    consultoresEnrutador(app, controlador);
}