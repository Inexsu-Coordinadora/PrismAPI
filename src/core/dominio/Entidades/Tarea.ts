import { ITarea, EstadoTarea } from "../ITarea";

export class Tarea implements ITarea{
    tituloTarea: string;
    descripcionTarea?: string | null;
    estadoTarea: EstadoTarea;

    constructor(datosTarea : ITarea){
        this.tituloTarea = datosTarea.tituloTarea;
        this.descripcionTarea = datosTarea.descripcionTarea ?? null;
        this.estadoTarea = datosTarea.estadoTarea;
    }
}
