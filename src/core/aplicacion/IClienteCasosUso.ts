import { ICliente } from "../dominio/ICliente";
import { CrearClienteDto, ActualizarClienteDto } from "../dominio/Entidades/Cliente";

export interface IClienteCasosUso {
  crearCliente(cliente: CrearClienteDto): Promise<ICliente>;
  obtenerClientes(): Promise<ICliente[]>;
  obtenerClientePorId(idCliente: string): Promise<ICliente>;
  actualizarCliente(idCliente: string, cliente: ActualizarClienteDto): Promise<ICliente>;
  eliminarCliente(idCliente: string): Promise<void>;
}