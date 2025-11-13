// QUE PUEDE HACER EL SERVICIO DE REGISTRO DE HORAS 

import { IRegistroHoras } from "../../../dominio/servicios/IRegistroHoras";

export interface IRegistroHorasServicio {

//---------------------------- INSERTA UN NUEVO REGISTRO DE HORAS ----------------------------//
  crearRegistroHoras(datos: IRegistroHoras): Promise<IRegistroHoras>;

//---------------------------- LISTA LOS REGISTRO DE HORAS ----------------------------//
  listarRegistrosHoras(
    idConsultor?: string,
    idProyecto?: string
  ): Promise<IRegistroHoras[]>;

//---------------------------- OBTENER UN REGISTRO DE HORAS ----------------------------//
  obtenerRegistroHorasPorId(idRegistro: string): Promise<IRegistroHoras | null>;
  
//---------------------------- ELIMINA UN REGISTRO DE HORAS ----------------------------//
  eliminarRegistroHoras(idRegistro: string): Promise<void>;
}
