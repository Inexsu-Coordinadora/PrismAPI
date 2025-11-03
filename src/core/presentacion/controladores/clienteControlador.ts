import { FastifyRequest, FastifyReply } from "fastify";
import { IClienteCasosUso } from "../../aplicacion/IClienteCasosUso";
import { CrearClienteDto, ActualizarClienteDto } from "../../dominio/Entidades/Cliente";
import { crearClienteEsquema, actualizarClienteEsquema  } from "../../presentacion/esquemas/clienteEsquema";
import { ZodError } from "zod";

export class ClienteControlador {

  constructor(private clientesCasosUso: IClienteCasosUso) {}

  crearCliente = async (
    request: FastifyRequest<{ Body: CrearClienteDto }>,
    reply: FastifyReply
  ) => {
    try {
      const nuevoCliente = crearClienteEsquema.parse(request.body);
      const clienteCreado = await this.clientesCasosUso.crearCliente(nuevoCliente);
      return reply.code(201).send({
        mensaje: "Cliente creado correctamente",
        cliente: clienteCreado,
      });
    } catch (error) {
      return this.manejarError(reply, error, "Error al crear el cliente");
    }
  };


  listarClientes = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const clientes = await this.clientesCasosUso.obtenerTodos();
      return reply.code(200).send({
        mensaje: "Clientes encontrados correctamente",
        clientes: clientes,
        total: clientes.length,
      });
    } catch (error) {
      return this.manejarError(reply, error, "Error al obtener los clientes");
    }
  };


  obtenerClientePorId = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;
      const cliente = await this.clientesCasosUso.obtenerPorId(id);

      return reply.code(200).send({
        mensaje: "Cliente encontrado correctamente",
        cliente: cliente,
      });
    } catch (error) {
    
      if (error instanceof Error && error.message === "Cliente no encontrado") {
        return reply.code(404).send({ mensaje: error.message });
      }
      return this.manejarError(reply, error, "Error al obtener el cliente");
    }
  };


  actualizarCliente = async (
    request: FastifyRequest<{ Params: { id: string }; Body: ActualizarClienteDto }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;
      const datosActualizar = actualizarClienteEsquema.parse(request.body);
      const clienteActualizado = await this.clientesCasosUso.actualizarCliente(
        id,
        datosActualizar
      );

      return reply.code(200).send({
        mensaje: "Cliente actualizado correctamente",
        cliente: clienteActualizado,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Cliente no encontrado") {
        return reply.code(404).send({ mensaje: error.message });
      }
      return this.manejarError(reply, error, "Error al actualizar el cliente");
    }
  };


  eliminarCliente = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;
      await this.clientesCasosUso.eliminarCliente(id);

      return reply.code(200).send({
        mensaje: "Cliente eliminado correctamente",
        idClienteEliminado: id,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Cliente no encontrado") {
        return reply.code(404).send({ mensaje: error.message });
      }
      return this.manejarError(reply, error, "Error al eliminar el cliente");
    }
  };


  private manejarError(reply: FastifyReply, err: unknown, mensajeBase: string) {
    if (err instanceof ZodError) {

        return reply.code(400).send({
        mensaje: mensajeBase,

        error: err.issues[0]?.message || "Error de validación",
      });
    }

    return reply.code(500).send({
      mensaje: mensajeBase,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}