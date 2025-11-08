import { ITarea, EstadoTarea } from "./ITarea";

export class Tarea implements ITarea{
    tituloTarea: string;
    descripcionTarea?: string | null;
    estadoTarea: EstadoTarea;

    //*-- Nuevos campos requeridos por la E2 Servicio 4 --
    idProyecto: string;
    idConsultorAsignado?: string | null;
    fechaLimite?: Date | null;

    constructor(datosTarea : ITarea){
        this.tituloTarea = datosTarea.tituloTarea;
        this.descripcionTarea = datosTarea.descripcionTarea ?? null;
        this.estadoTarea = datosTarea.estadoTarea;

        //* --- Inicializamos los nuevos campos ---
        this.idProyecto = datosTarea.idProyecto;
        this.idConsultorAsignado = datosTarea.idConsultorAsignado ?? null;
        this.fechaLimite = datosTarea.fechaLimite ?? null;
    }
}
