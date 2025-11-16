import { IProyecto, EstadoProyecto } from "./IProyecto";

export class Proyecto implements IProyecto {
    nombreProyecto: string;
    tipoProyecto?: string | null;
    fechaInicioProyecto?: Date | null;
    fechaFinProyecto?: Date | null;
    estadoProyecto:EstadoProyecto;

    constructor (datosProyecto: IProyecto){
        this.nombreProyecto = datosProyecto.nombreProyecto,
        this.tipoProyecto = datosProyecto.tipoProyecto ?? null,
        this.fechaInicioProyecto = datosProyecto.fechaInicioProyecto ?? null,
        this.fechaFinProyecto = datosProyecto.fechaFinProyecto ?? null,
        this.estadoProyecto = datosProyecto.estadoProyecto;
    }

}