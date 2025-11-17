import { FastifyInstance } from "fastify";

// 1) Servicio de aplicación e interfaz
import { RegistroHorasServicio } from "../../../aplicacion/casos-uso/servicios/RegistroHorasServicio";
import { IRegistroHorasServicio } from "../../../aplicacion/interfaces/servicios/IRegistroHorasServicio";

// 2) Repositorios reales
import { ConsultorRepository } from "../../../infraestructura/postgres/repositorios/entidades/ConsultorRepository";
import { ProyectoRepository } from "../../../infraestructura/postgres/repositorios/entidades/ProyectoRepository";
import { RegistroHorasRepository } from "../../../infraestructura/postgres/repositorios/servicios/RegistroHorasRepository";
import { AsignacionConsultorProyectoRepository } from "../../../infraestructura/postgres/repositorios/servicios/AsignacionConsultorProyectoRepository";

// 3) Controlador
import { RegistroHorasControlador } from "../../controladores/servicios/RegistroHorasControlador";

/**
 * Función que registra las rutas del servicio "Registro de horas"
 * en la instancia de Fastify.
 */
function registroHorasRutas(app: FastifyInstance, controlador: RegistroHorasControlador) {
  // Listar registros (con filtros opcionales)
  app.get("/registrar-horas", controlador.listarRegistrosHoras);

  // Obtener un registro por ID
  app.get("/registrar-horas/:idRegistro", controlador.obtenerRegistroHoraPorId);

  // Crear un nuevo registro de horas
  app.post("/registrar-horas", controlador.crearRegistroHoras);

  // Eliminar un registro de horas
  app.delete("/registrar-horas/:idRegistro", controlador.eliminarRegistroHoras);
}

export async function construirRegistroHorasEnrutador(app: FastifyInstance) {
  // 1) Instanciar repos reales
  const consultorRepo = new ConsultorRepository();
  const proyectoRepo = new ProyectoRepository();
  const registroHorasRepo = new RegistroHorasRepository();
  const asignacionRepo = new AsignacionConsultorProyectoRepository();

  // 2) Servicio de aplicación con TODOS los repos inyectados
  const registroHorasServicio: IRegistroHorasServicio = new RegistroHorasServicio(
    registroHorasRepo,
    consultorRepo,
    proyectoRepo,
    asignacionRepo
  );

  // 3) Controlador
  const controlador = new RegistroHorasControlador(registroHorasServicio);

  // 4) Registrar rutas
  registroHorasRutas(app, controlador);
}
