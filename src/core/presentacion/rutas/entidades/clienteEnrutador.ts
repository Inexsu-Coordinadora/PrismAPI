import { FastifyInstance } from "fastify";
import { ClienteControlador } from "../../controladores/entidades/clienteControlador";
import { IClienteRepositorio } from "../../../dominio/repositorio/entidades/IClienteRepositorio";
import { IClienteCasosUso } from "../../../aplicacion/interfaces/entidades/IClienteCasosUso";
import { ClienteCasosUso } from "../../../aplicacion/casos-uso/entidades/ClienteCasosUso";
import { ClienteRepository } from "../../../infraestructura/postgres/repositorios/entidades/ClienteRepository";


function clienteEnrutador(
  app: FastifyInstance,
  controlador: ClienteControlador
) {
  app.get("/clientes", {
    schema: {
      tags: ['Clientes']
    }
  }, controlador.listarClientes);
  
  app.get("/clientes/:idCliente", {
    schema: {
      tags: ['Clientes']
    }
  }, controlador.obtenerClientePorId);
  
  app.post("/clientes", {
    schema: {
      tags: ['Clientes']
    }
  }, controlador.crearCliente);
  
  app.put("/clientes/:idCliente", {
    schema: {
      tags: ['Clientes']
    }
  }, controlador.actualizarCliente);
  
  app.delete("/clientes/:idCliente", {
    schema: {
      tags: ['Clientes']
    }
  }, controlador.eliminarCliente);
}


export async function construirClienteEnrutador(app: FastifyInstance) {

  const clienteRepo: IClienteRepositorio = new ClienteRepository();

  const clienteCasosUso: IClienteCasosUso = new ClienteCasosUso(clienteRepo);

  const clienteControlador = new ClienteControlador (clienteCasosUso);

  clienteEnrutador(app, clienteControlador);
}

