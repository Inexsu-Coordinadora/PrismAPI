export interface IAsignacionConsultorProyecto {
    idAsignacion?: string,
    idConsultor: string,
    idProyecto: string,
    rolConsultor?: string | null | undefined,
    porcentajeDedicacion?: number | null | undefined,
    fechaInicioAsignacion: Date ,
    fechaFinAsignacion?: Date | null | undefined;
}