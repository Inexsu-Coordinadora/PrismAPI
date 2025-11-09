export type EstadoTarea = "pendiente" | "en-progreso" | "bloqueada" | "completada";

export interface ITarea{
    idTarea?: string | undefined;
    tituloTarea: string;
    descripcionTarea? : string | null | undefined;
    estadoTarea: EstadoTarea;

    //*-- Nuevos campos requeridos por la E2 Servicio 4 --
    idProyecto?: string | null | undefined;
    idConsultorAsignado?: string | null | undefined;
    fechaLimite?: Date | null | undefined;
}