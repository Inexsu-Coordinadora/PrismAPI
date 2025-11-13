export type EstadoProyecto = 'activo' | 'finalizado' | 'pendiente';

export interface IProyecto {
    idProyecto?: string,
    nombreProyecto: string,
    tipoProyecto?: string | null | undefined,
    fechaInicio?: Date | null | undefined,
    fechaFin?: Date | null | undefined,
    estadoProyecto:EstadoProyecto;
}