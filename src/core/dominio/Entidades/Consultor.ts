import {IConsultor} from "../IConsultor";

export class Consultor implements IConsultor {
    idConsultor: string;
    nombreConsultor: string;
    especialidadConsultor: string;
    disponibilidadConsultor: string;
    emailConsultor: string;
    telefonoConsultor?: string | null;

    constructor(datosConsultor:IConsultor){
        this.idConsultor = datosConsultor.idConsultor;
        this.nombreConsultor = datosConsultor.nombreConsultor;
        this.especialidadConsultor = datosConsultor.especialidadConsultor;
        this.disponibilidadConsultor = datosConsultor.disponibilidadConsultor;
        this.emailConsultor = datosConsultor.emailConsultor;
        this.telefonoConsultor = datosConsultor.telefonoConsultor ?? null;
    }
}