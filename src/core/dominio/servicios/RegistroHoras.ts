//Clase que implementa la interfaz
//construyen objetos bien formados

import {IRegistroHoras} from "./IRegistroHoras";

export class RegistroHoras implements IRegistroHoras {
    idRegistroHoras?: string | undefined;
    idProyecto: string; 
    idConsultor: string;
    fechaRegistro: Date;  
    horasTrabajadas: number; 
    descripcionActividad: string;

    constructor(datosRegistroHoras:IRegistroHoras){
        this.idRegistroHoras = datosRegistroHoras.idRegistroHoras ?? undefined;
        this.idProyecto = datosRegistroHoras.idProyecto;
        this.idConsultor = datosRegistroHoras.idConsultor;
        this.fechaRegistro = datosRegistroHoras.fechaRegistro;
        this.horasTrabajadas = datosRegistroHoras.horasTrabajadas;
        this.descripcionActividad = datosRegistroHoras.descripcionActividad;
    }
}