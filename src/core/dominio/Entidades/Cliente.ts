import { ICliente } from "../ICliente"

export class Cliente implements ICliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  documentoIdentidad: string;
  

  constructor(datosCliente: ICliente) {
    this.id = datosCliente.id;
    this.nombre = datosCliente.nombre;
    this.email = datosCliente.email;
    this.telefono = datosCliente.telefono;
    this.documentoIdentidad = datosCliente.documentoIdentidad;
  }
}

export interface CrearClienteDto {
  nombre: string;
  email: string;
  telefono: string;
  documentoIdentidad: string;
}

export interface ActualizarClienteDto {
  nombre?: string;
  email?: string;
  telefono?: string;
  documentoIdentidad?: string;
}