import { IClienteRepositorio } from '../dominio/repositorio/IClienteRepositorio';
import { IClienteCasosUso } from './IClienteCasosUso';
import { Cliente, CrearClienteDto, ActualizarClienteDto } from '../dominio/Entidades/Cliente';
import { crearClienteEsquema, actualizarClienteEsquema } from '../presentacion/esquemas/clienteEsquema';

export class ClienteCasosUso implements IClienteCasosUso {
  constructor(private repositorio: IClienteRepositorio) {}

  // Create
  async crearCliente(datos: CrearClienteDto): Promise<Cliente> {
    
    const datosValidados = crearClienteEsquema.parse(datos);
    
    const emailExisteCliente = await this.repositorio.existeEmailCliente(datosValidados.emailCliente);
    if (emailExisteCliente) {
      throw new Error('Ya existe un cliente con ese email');
    }
    
    const documentoExiste = await this.repositorio.existeDocumentoCliente(datosValidados.documentoCliente);
    if (documentoExiste) {
      throw new Error('Ya existe un cliente con ese documento de identidad');
    }
    
    return await this.repositorio.crearCliente(datosValidados);
  }

  // Read
  async obtenerClientes(): Promise<Cliente[]> {
    return await this.repositorio.obtenerClientes();
  }


  async obtenerClientePorId(id: string): Promise<Cliente> {
    const cliente = await this.repositorio.obtenerClientePorId(id);
    
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }
    
    return cliente;
  }

  // Update
  async actualizarCliente(id: string, datos: ActualizarClienteDto): Promise<Cliente> {

    const datosValidados = actualizarClienteEsquema.parse(datos) as ActualizarClienteDto;
    
    const clienteExiste = await this.repositorio.obtenerClientePorId(id);
    if (!clienteExiste) {
      throw new Error('Cliente no encontrado');
    }
    
    if (datosValidados.emailCliente) {
      const emailExiste = await this.repositorio.existeEmailCliente(datosValidados.emailCliente, id);
      if (emailExiste) {
        throw new Error('Ya existe otro cliente con ese email');
      }
    }
    
    if (datosValidados.documentoCliente) {
      const documentoExiste = await this.repositorio.existeDocumentoCliente(datosValidados.documentoCliente, id);
      if (documentoExiste) {
        throw new Error('Ya existe otro cliente con ese documento de identidad');
      }
    }
    
    const clienteActualizado = await this.repositorio.actualizarCliente(id, datosValidados);
    
    if (!clienteActualizado) {
      throw new Error('Error al actualizar el cliente');
    }
    
    return clienteActualizado;
  }

  // Delete
  async eliminarCliente(idCliente: string): Promise<void> {
    const eliminado = await this.repositorio.eliminarCliente(idCliente);
    
    if (!eliminado) {
      throw new Error('Cliente no encontrado');
    }
  }
}