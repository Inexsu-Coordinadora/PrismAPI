import { ActualizarClienteDto, CrearClienteDto } from "../Entidades/Cliente";
import { ICliente } from "../ICliente"

export interface IClienteRepositorio {
  crearCliente(datosCliente: CrearClienteDto): Promise<ICliente>;
  
  obtenerClientes(): Promise<ICliente[]>;

  obtenerClientePorId(idCliente: string): Promise<ICliente | null>;
  
  actualizarCliente(idCliente: string, datosCliente: ActualizarClienteDto): Promise<ICliente | null>;
  
  eliminarCliente(idCliente: string): Promise<boolean>; 
  
  existeEmailCliente(emailCliente: string, idClienteExcluir?: string): Promise<boolean>;
  
  existeDocumentoCliente(documentoCliente: string, idClienteExcluir?: string): Promise<boolean>;
}