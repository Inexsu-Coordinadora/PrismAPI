export enum DisponibilidadConsultor {
  DISPONIBLE = 'disponible',
  OCUPADO = 'ocupado',
  EN_DESCANSO = 'en descanso',
  NO_DISPONIBLE = 'no disponible'
}

export interface IConsultor {
    idConsultor?: string;
    nombreConsultor: string;
    especialidadConsultor: string;
    disponibilidadConsultor: DisponibilidadConsultor;
    emailConsultor: string;
    telefonoConsultor?: string | null;
}