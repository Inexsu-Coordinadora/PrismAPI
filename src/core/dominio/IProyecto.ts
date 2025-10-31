export interface IProyecto {
    idProyecto?: string,
    nombreProyecto: string,
    tipoProyecto?: string | null,
    fechaInicio: Date,
    fechaFin?: Date | null,
    estadoProyecto:string;
}