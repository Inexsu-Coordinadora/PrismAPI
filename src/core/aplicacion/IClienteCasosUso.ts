import { ICliente } from "../dominio/ICliente";
import { CrearClienteDto, ActualizarClienteDto } from "../dominio/Entidades/Cliente";

export interface IClientesCasosUso {
  crearCliente(cliente: CrearClienteDto): Promise<ICliente>;
  obtenerTodos(): Promise<ICliente[]>;
  obtenerPorId(id: string): Promise<ICliente>;
  actualizarCliente(id: string, cliente: ActualizarClienteDto): Promise<ICliente>;
  eliminarCliente(id: string): Promise<void>;
}