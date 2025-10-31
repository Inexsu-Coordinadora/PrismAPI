export enum disponibilidad_consultor {'disponible', 'ocupado', 'no disponible'};

export interface IConsultor {
    idConsultor?: string;
    nombreConsultor: string;
    especialidadConsultor: string;
    disponibilidadConsultor: disponibilidad_consultor;
    emailConsultor: string;
    telefonoConsultor?: string | null;
}