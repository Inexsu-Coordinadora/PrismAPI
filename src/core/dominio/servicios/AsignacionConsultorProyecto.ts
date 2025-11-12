import { IAsignacionConsultorProyecto } from "./IAsignacionConsultorProyecto";

export class AsignacionConsultorProyecto implements IAsignacionConsultorProyecto{
    idConsultor: string;
    idProyecto: string;    
    rolConsultor?: string | null | undefined;
    porcentajeDedicacion?: number | null | undefined;
    fechaInicioAsignacion: Date;
    fechaFinAsignacion?: Date | null | undefined;

    constructor (datosAsignacion: IAsignacionConsultorProyecto){
        this.idConsultor = datosAsignacion.idConsultor,
        this.idProyecto = datosAsignacion.idProyecto,
        this.rolConsultor = datosAsignacion.rolConsultor,
        this.porcentajeDedicacion = datosAsignacion.porcentajeDedicacion,
        this.fechaInicioAsignacion = datosAsignacion.fechaInicioAsignacion,
        this.fechaFinAsignacion = datosAsignacion.fechaFinAsignacion

    }
}
