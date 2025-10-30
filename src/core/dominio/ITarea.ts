export type EstadoTarea = "pendiente" | "en-desarrollo" | "finalizada";

export interface ITarea{
    idTarea?: string;
    tituloTarea: string;
    descripcionTarea? : string|null;
    estadoTarea: EstadoTarea;

}