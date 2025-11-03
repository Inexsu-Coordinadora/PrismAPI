import { FastifyInstance } from "fastify";
import { ClienteControlador } from "../controladores/clienteControlador";
import { IClienteRepositorio } from "../../dominio/repositorio/IClienteRepositorio";
import { IClienteCasosUso } from "../../aplicacion/IClienteCasosUso";
import { ClienteCasosUso } from "../../aplicacion/ClienteCasosUso";
import { ClienteRepository } from "../../infraestructura/ClienteRepository";


function clienteEnrutador(
  app: FastifyInstance,
  controlador: ClienteControlador
) {
  app.get("/clientes", controlador.listarClientes);
  app.get("/clientes/:id", controlador.obtenerClientePorId);
  app.post("/clientes", controlador.crearCliente);
  app.put("/clientes/:id", controlador.actualizarCliente);
  app.delete("/clientes/:id", controlador.eliminarCliente);
}


export async function construirClienteEnrutador(app: FastifyInstance) {

  const clienteRepo: IClienteRepositorio = new ClienteRepository();

  const clienteCasosUso: IClienteCasosUso = new ClienteCasosUso(clienteRepo);

  const clienteControlador = new ClienteControlador (clienteCasosUso);

  clienteEnrutador(app, clienteControlador);
}


