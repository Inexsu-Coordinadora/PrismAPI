export type EstadoProyecto = 'activo' | 'finalizado' | 'pendiente';

export interface IProyecto {
    idProyecto?: string,
    nombreProyecto: string,
    tipoProyecto?: string | null | undefined,
    fechaInicioProyecto?: Date | null | undefined,
    fechaFinProyecto?: Date | null | undefined,
    estadoProyecto:EstadoProyecto;
}