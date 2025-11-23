import { FastifyRequest, FastifyReply } from "fastify";
import { IClienteCasosUso } from "../../../aplicacion/interfaces/entidades/IClienteCasosUso";
import { CrearClienteDto, ActualizarClienteDto } from "../../../dominio/entidades/Cliente";
import { crearClienteEsquema, actualizarClienteEsquema } from "../../esquemas/entidades/clienteEsquema";
import { ZodError } from "zod";
import { HttpStatus } from "../../../../common/errores/statusCode"; 
import { NotFoundError } from "../../../../common/errores/AppError";

export class ClienteControlador {

  constructor(private clientesCasosUso: IClienteCasosUso) {}

  crearCliente = async (
    request: FastifyRequest<{ Body: CrearClienteDto }>,
    reply: FastifyReply
  ) => {

   const nuevoCliente = crearClienteEsquema.parse(request.body);
    const clienteCreado = await this.clientesCasosUso.crearCliente(nuevoCliente);

    return reply.code(HttpStatus.CREADO).send({ 
      mensaje: "Cliente creado correctamente",
      cliente: clienteCreado,
    });
  };


  listarClientes = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const clientes = await this.clientesCasosUso.obtenerClientes();
    return reply.code(HttpStatus.EXITO).send({ 
      mensaje: "Clientes encontrados correctamente",
      clientes: clientes,
      total: clientes.length,
    });
  };


  obtenerClientePorId = async (
    request: FastifyRequest<{ Params: { idCliente: string } }>,
    reply: FastifyReply
  ) => {
    const { idCliente } = request.params;
    const cliente = await this.clientesCasosUso.obtenerClientePorId(idCliente);


    if (!cliente) {
        throw new NotFoundError("Cliente no encontrado");
    }

    return reply.code(HttpStatus.EXITO).send({ 
      mensaje: "Cliente encontrado correctamente",
      cliente: cliente,
    });
  };


  actualizarCliente = async (
    request: FastifyRequest<{ Params: { idCliente: string }; Body: ActualizarClienteDto }>,
    reply: FastifyReply
  ) => {
    const { idCliente } = request.params;
    const datosActualizarCliente = actualizarClienteEsquema.parse(request.body);

    const clienteActualizado = await this.clientesCasosUso.actualizarCliente(
      idCliente,
      datosActualizarCliente
    );


    if (!clienteActualizado) {
        throw new NotFoundError("Cliente no encontrado para actualizar");
    }

    return reply.code(HttpStatus.EXITO).send({ 
      mensaje: "Cliente actualizado correctamente",
      cliente: clienteActualizado,
    });
  };


 eliminarCliente = async (
    request: FastifyRequest<{ Params: { idCliente: string } }>,
    reply: FastifyReply
  ) => {
    const { idCliente } = request.params;
    
    // Solo se llama al método de eliminación. 
    // Si la eliminación es exitosa, el código continúa.
    // Si el cliente no existe, el Caso de Uso lanza NotFoundError (404),
    // y el manejador global lo captura, pero la intención era eliminarlo.
    await this.clientesCasosUso.eliminarCliente(idCliente); 

    // Solo se ejecuta si la eliminación fue exitosa y no se lanzó una excepción
    return reply.code(HttpStatus.EXITO).send({ 
      mensaje: "Cliente eliminado correctamente",
      idClienteEliminado: idCliente,
    });
  };


}

