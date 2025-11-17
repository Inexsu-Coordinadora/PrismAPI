import { ICliente } from "../../../dominio/entidades/ICliente";
import { CrearClienteDto, ActualizarClienteDto } from "../../../dominio/entidades/Cliente";

export interface IClienteCasosUso {
  crearCliente(cliente: CrearClienteDto): Promise<ICliente>;
  obtenerClientes(): Promise<ICliente[]>;
  obtenerClientePorId(idCliente: string): Promise<ICliente>;
  actualizarCliente(idCliente: string, cliente: ActualizarClienteDto): Promise<ICliente>;
  eliminarCliente(idCliente: string): Promise<void>;
}