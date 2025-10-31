import { IProyecto, EstadoProyecto } from "../IProyecto";

export class Proyecto implements IProyecto {
    nombreProyecto: string;
    tipoProyecto?: string | null;
    fechaInicio: Date;
    fechaFin?: Date | null;
    estadoProyecto:EstadoProyecto;

    constructor (datosProyecto: IProyecto){
        this.nombreProyecto = datosProyecto.nombreProyecto,
        this.tipoProyecto = datosProyecto.tipoProyecto ?? null,
        this.fechaInicio = datosProyecto.fechaInicio,
        this.fechaFin = datosProyecto.fechaFin ?? null,
        this.estadoProyecto = datosProyecto.estadoProyecto;
    }

}