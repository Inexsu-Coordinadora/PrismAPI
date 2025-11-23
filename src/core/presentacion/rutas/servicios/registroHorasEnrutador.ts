import { FastifyInstance } from "fastify";
import { RegistroHorasServicio } from "../../../aplicacion/casos-uso/servicios/RegistroHorasServicio";
import { IRegistroHorasServicio } from "../../../aplicacion/interfaces/servicios/IRegistroHorasServicio";
import { ConsultorRepository } from "../../../infraestructura/postgres/repositorios/entidades/ConsultorRepository";
import { ProyectoRepository } from "../../../infraestructura/postgres/repositorios/entidades/ProyectoRepository";
import { RegistroHorasRepository } from "../../../infraestructura/postgres/repositorios/servicios/RegistroHorasRepository";
import { AsignacionConsultorProyectoRepository } from "../../../infraestructura/postgres/repositorios/servicios/AsignacionConsultorProyectoRepository";
import { RegistroHorasControlador } from "../../controladores/servicios/RegistroHorasControlador";

function registroHorasRutas(app: FastifyInstance, controlador: RegistroHorasControlador) {
  
  app.get("/registrar-horas", controlador.listarRegistrosHoras);

  app.get("/registrar-horas/:idRegistro", controlador.obtenerRegistroHoraPorId);

  app.post("/registrar-horas", controlador.crearRegistroHoras);

  app.delete("/registrar-horas/:idRegistro", controlador.eliminarRegistroHoras);
}

export async function construirRegistroHorasEnrutador(app: FastifyInstance) {

  const consultorRepo = new ConsultorRepository();
  const proyectoRepo = new ProyectoRepository();
  const registroHorasRepo = new RegistroHorasRepository();
  const asignacionRepo = new AsignacionConsultorProyectoRepository();

  const registroHorasServicio: IRegistroHorasServicio = new RegistroHorasServicio(
    registroHorasRepo,
    consultorRepo,
    proyectoRepo,
    asignacionRepo
  );

  const controlador = new RegistroHorasControlador(registroHorasServicio);

  registroHorasRutas(app, controlador);
}
