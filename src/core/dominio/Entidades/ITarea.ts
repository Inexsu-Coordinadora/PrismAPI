export type EstadoTarea = "pendiente" | "en-desarrollo" | "finalizada";

export interface ITarea{
    idTarea?: string | undefined;
    tituloTarea: string;
    descripcionTarea? : string | null | undefined;
    estadoTarea: EstadoTarea;

}