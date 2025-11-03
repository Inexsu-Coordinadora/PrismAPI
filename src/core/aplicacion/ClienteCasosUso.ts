import { IClienteRepositorio } from '../dominio/repositorio/IClienteRepositorio';
import { Cliente, CrearClienteDto, ActualizarClienteDto } from '../dominio/Entidades/Cliente';
import { crearClienteEsquema, actualizarClienteEsquema } from '../presentacion/esquemas/clienteEsquema';

export class CasosUsoCliente {
  constructor(private repositorio: IClienteRepositorio) {}

  // Create
  async crearCliente(datos: CrearClienteDto): Promise<Cliente> {
    
    const datosValidados = crearClienteEsquema.parse(datos);
    
    const emailExiste = await this.repositorio.existeEmail(datosValidados.email);
    if (emailExiste) {
      throw new Error('Ya existe un cliente con ese email');
    }
    
    const documentoExiste = await this.repositorio.existeDocumento(datosValidados.documentoIdentidad);
    if (documentoExiste) {
      throw new Error('Ya existe un cliente con ese documento de identidad');
    }
    
    return await this.repositorio.crear(datosValidados);
  }

  // Read
  async obtenerTodos(): Promise<Cliente[]> {
    return await this.repositorio.obtenerTodos();
  }


  async obtenerPorId(id: string): Promise<Cliente> {
    const cliente = await this.repositorio.obtenerPorId(id);
    
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }
    
    return cliente;
  }

  // Update
  async actualizarCliente(id: string, datos: ActualizarClienteDto): Promise<Cliente> {

    const datosValidados = actualizarClienteEsquema.parse(datos) as ActualizarClienteDto;
    
    const clienteExiste = await this.repositorio.obtenerPorId(id);
    if (!clienteExiste) {
      throw new Error('Cliente no encontrado');
    }
    
    if (datosValidados.email) {
      const emailExiste = await this.repositorio.existeEmail(datosValidados.email, id);
      if (emailExiste) {
        throw new Error('Ya existe otro cliente con ese email');
      }
    }
    
    if (datosValidados.documentoIdentidad) {
      const documentoExiste = await this.repositorio.existeDocumento(datosValidados.documentoIdentidad, id);
      if (documentoExiste) {
        throw new Error('Ya existe otro cliente con ese documento de identidad');
      }
    }
    
    const clienteActualizado = await this.repositorio.actualizar(id, datosValidados);
    
    if (!clienteActualizado) {
      throw new Error('Error al actualizar el cliente');
    }
    
    return clienteActualizado;
  }

  // Delete
  async eliminarCliente(id: string): Promise<void> {
    const eliminado = await this.repositorio.eliminar(id);
    
    if (!eliminado) {
      throw new Error('Cliente no encontrado');
    }
  }
}