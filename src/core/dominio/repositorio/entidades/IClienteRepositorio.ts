import { ActualizarClienteDto, CrearClienteDto } from "../../entidades/Cliente";
import { ICliente } from "../../entidades/ICliente"

export interface IClienteRepositorio {
  crearCliente(datosCliente: CrearClienteDto): Promise<ICliente>;
  
  obtenerClientes(): Promise<ICliente[]>;

  obtenerClientePorId(idCliente: string): Promise<ICliente | null>;
  
  actualizarCliente(idCliente: string, datosCliente: ActualizarClienteDto): Promise<ICliente | null>;
  
  eliminarCliente(idCliente: string): Promise<boolean>; 
  
  existeEmailCliente(emailCliente: string, idClienteExcluir?: string): Promise<boolean>;
  
  existeDocumentoCliente(documentoCliente: number, idClienteExcluir?: string): Promise<boolean>;
}