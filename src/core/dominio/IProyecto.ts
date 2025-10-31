export type EstadoProyecto = 'activo' | 'finalizado' | 'pendiente';

export interface IProyecto {
    idProyecto?: string,
    nombreProyecto: string,
    tipoProyecto?: string | null,
    fechaInicio: Date,
    fechaFin?: Date | null,
    estadoProyecto:EstadoProyecto;
}