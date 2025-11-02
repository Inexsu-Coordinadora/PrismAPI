import { ActualizarClienteDto, CrearClienteDto } from "../Entidades/Cliente";
import { ICliente } from "../ICliente"

export interface IClienteRepositorio {
  crear(datos: CrearClienteDto): Promise<ICliente>;
  
  obtenerTodos(): Promise<ICliente[]>;

  obtenerPorId(id: string): Promise<ICliente | null>;
  
  actualizar(id: string, datos: ActualizarClienteDto): Promise<ICliente | null>;
  
  eliminar(id: string): Promise<boolean>; 
  
  existeEmail(email: string, idExcluir?: string): Promise<boolean>;
  
  existeDocumento(documento: string, idExcluir?: string): Promise<boolean>;
}