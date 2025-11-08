import { IClienteRepositorio } from '../../../dominio/repositorio/entidades/IClienteRepositorio';
import { IClienteCasosUso } from '../../IClienteCasosUso';
import { Cliente, CrearClienteDto, ActualizarClienteDto } from '../../../dominio/entidades/Cliente';
import { crearClienteEsquema, actualizarClienteEsquema } from '../../../presentacion/esquemas/entidades/clienteEsquema';

export class ClienteCasosUso implements IClienteCasosUso {
  constructor(private clienteRepositorio: IClienteRepositorio) {}

  // Create
  async crearCliente(datos: CrearClienteDto): Promise<Cliente> {
    
    const datosValidados = crearClienteEsquema.parse(datos);
    
    const emailExisteCliente = await this.clienteRepositorio.existeEmailCliente(datosValidados.emailCliente);
    if (emailExisteCliente) {
      throw new Error('Ya existe un cliente con ese email');
    }
    
    const documentoExiste = await this.clienteRepositorio.existeDocumentoCliente(datosValidados.documentoCliente);
    if (documentoExiste) {
      throw new Error('Ya existe un cliente con ese documento de identidad');
    }
    
    return await this.clienteRepositorio.crearCliente(datosValidados);
  }

  // Read
  async obtenerClientes(): Promise<Cliente[]> {
    return await this.clienteRepositorio.obtenerClientes();
  }


  async obtenerClientePorId(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepositorio.obtenerClientePorId(id);
    
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }
    
    return cliente;
  }

  // Update
  async actualizarCliente(id: string, datos: ActualizarClienteDto): Promise<Cliente> {

    const datosValidados = actualizarClienteEsquema.parse(datos) as ActualizarClienteDto;
    
    const clienteExiste = await this.clienteRepositorio.obtenerClientePorId(id);
    if (!clienteExiste) {
      throw new Error('Cliente no encontrado');
    }
    
    if (datosValidados.emailCliente) {
      const emailExiste = await this.clienteRepositorio.existeEmailCliente(datosValidados.emailCliente, id);
      if (emailExiste) {
        throw new Error('Ya existe otro cliente con ese email');
      }
    }
    
    if (datosValidados.documentoCliente) {
      const documentoExiste = await this.clienteRepositorio.existeDocumentoCliente(datosValidados.documentoCliente, id);
      if (documentoExiste) {
        throw new Error('Ya existe otro cliente con ese documento de identidad');
      }
    }
    
    const clienteActualizado = await this.clienteRepositorio.actualizarCliente(id, datosValidados);
    
    if (!clienteActualizado) {
      throw new Error('Error al actualizar el cliente');
    }
    
    return clienteActualizado;
  }

  // Delete
  async eliminarCliente(idCliente: string): Promise<void> {
    const eliminado = await this.clienteRepositorio.eliminarCliente(idCliente);
    
    if (!eliminado) {
      throw new Error('Cliente no encontrado');
    }
  }
}