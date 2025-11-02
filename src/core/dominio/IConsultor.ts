export enum DisponibilidadConsultor {'disponible', 'ocupado', 'en descanso', 'no disponible'};

export interface IConsultor {
    idConsultor?: string;
    nombreConsultor: string;
    especialidadConsultor: string;
    disponibilidadConsultor: DisponibilidadConsultor;
    emailConsultor: string;
    telefonoConsultor?: string | null;
}