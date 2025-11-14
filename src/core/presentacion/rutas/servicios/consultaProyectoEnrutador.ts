import { FastifyInstance } from "fastify";
import { ConsultaProyectoControlador } from "../../controladores/servicios/ConsultaProyectoControlador";
import { ConsultarProyectosPorClienteCasoUso } from "../../../aplicacion/casos-uso/servicios/ConsultaProyectoClienteServicios";
import { ConsultarProyectosPorClienteRepositorio } from "../../../infraestructura/postgres/repositorios/servicios/ConsultaProyectoRepository";

// 1) Definimos las rutas HTTP y las conectamos con el controlador
function consultaProyectoEnrutador(
  app: FastifyInstance,
  controlador: ConsultaProyectoControlador
) {
  // GET /clientes/:idCliente/proyectos?estado=...&fechaInicio=...&fechaFin=...
  app.get(
    "/clientes/:idCliente/proyectos",
    controlador.consultarProyectos
  );
}

// 2) Construimos el pipeline repositorio → caso de uso → controlador
export async function construirConsultaProyectoEnrutador(app: FastifyInstance) {
  // Repositorio (accede a Postgres, usa ejecutarConsulta internamente)
  const repositorio = new ConsultarProyectosPorClienteRepositorio();

  // Caso de uso (orquesta la lógica: validar cliente, aplicar filtros, etc.)
  const casoUso = new ConsultarProyectosPorClienteCasoUso(repositorio);

  // Controlador (capa HTTP / Fastify)
  const controlador = new ConsultaProyectosControlador(casoUso);

  // Registrar las rutas en Fastify
  consultaProyecto(app, controlador);
}