import {IConsultor, DisponibilidadConsultor} from "../IConsultor";

export class Consultor implements IConsultor {
    nombreConsultor: string;
    especialidadConsultor: string;
    disponibilidadConsultor: DisponibilidadConsultor;
    emailConsultor: string;
    telefonoConsultor?: string | null;

    constructor(datosConsultor:IConsultor){
        this.nombreConsultor = datosConsultor.nombreConsultor;
        this.especialidadConsultor = datosConsultor.especialidadConsultor;
        this.disponibilidadConsultor = datosConsultor.disponibilidadConsultor;
        this.emailConsultor = datosConsultor.emailConsultor;
        this.telefonoConsultor = datosConsultor.telefonoConsultor ?? null;
    }
}