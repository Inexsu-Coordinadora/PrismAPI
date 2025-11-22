//Modelo de dominio para registro de horas.

export interface IRegistroHoras {
    idRegistroHoras?: string | undefined;
    idProyecto: string;       /** Proyecto al cual se imputan las horas */
    idConsultor: string;      /** Consultor que reporta el trabajo */
    fechaRegistro: Date;      /** Día trabajado, en el dominio manejamos Date sin hora para evitar inconsistencias por zona horaria */
    horasTrabajadas: number;  /**Reglas de negocio: > 0 y ≤ 24 */
    descripcionActividad: string;   
}