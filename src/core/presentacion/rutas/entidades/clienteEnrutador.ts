import { FastifyInstance } from "fastify";
import { ClienteControlador } from "../controladores/clienteControlador";
import { IClienteRepositorio } from "../../../dominio/repositorio/entidades/IClienteRepositorio";
import { IClienteCasosUso } from "../../aplicacion/IClienteCasosUso";
import { ClienteCasosUso } from "../../../aplicacion/casos-uso/entidades/ClienteCasosUso";
import { ClienteRepository } from "../../../infraestructura/postgres/repositorios/entidades/ClienteRepository";


function clienteEnrutador(
  app: FastifyInstance,
  controlador: ClienteControlador
) {
  app.get("/clientes", controlador.listarClientes);
  app.get("/clientes/:idCliente", controlador.obtenerClientePorId);
  app.post("/clientes", controlador.crearCliente);
  app.put("/clientes/:idCliente", controlador.actualizarCliente);
  app.delete("/clientes/:idCliente", controlador.eliminarCliente);
}


export async function construirClienteEnrutador(app: FastifyInstance) {

  const clienteRepo: IClienteRepositorio = new ClienteRepository();

  const clienteCasosUso: IClienteCasosUso = new ClienteCasosUso(clienteRepo);

  const clienteControlador = new ClienteControlador (clienteCasosUso);

  clienteEnrutador(app, clienteControlador);
}


