import { ICliente } from "./ICliente"

export class Cliente implements ICliente {
  idCliente: string;
  nombreCliente: string;
  apellidoCliente: string;
  documentoCliente: number;
  emailCliente: string;
  telefonoCliente: string;
  
  

  constructor(datosCliente: ICliente) {
    this.idCliente = datosCliente.idCliente;
    this.nombreCliente = datosCliente.nombreCliente;
    this.apellidoCliente = datosCliente.apellidoCliente;
    this.emailCliente = datosCliente.emailCliente;
    this.telefonoCliente = datosCliente.telefonoCliente;
    this.documentoCliente = datosCliente.documentoCliente;
  }
}

export interface CrearClienteDto {
  nombreCliente: string;
  apellidoCliente: string;
  emailCliente: string | null;
  telefonoCliente: string;
  documentoCliente: string;
}

export interface ActualizarClienteDto {
  nombreCliente?: string | undefined;
  apellidoCliente?: string | undefined;
  emailCliente?: string | undefined;
  telefonoCliente?: string | undefined;
  documentoCliente?: string | undefined;
}