//Definición del modelo de negocio (interfaz) "registro de horas" que un consultor carga sobre un proyecto en una fecha especifica.

export interface IRegistroHoras {
    idRegistroHoras?: string | undefined;
    idProyecto: string; // se le cargan las horas -----  ayudar a verificar que proyecto exista
    idConsultor: string; // trabajo las horas ----ayudar a verificar que consultor exista, Verificar que el consultor este asignado al proyecto
    fechaRegistro: Date;  //rango de la asignación del consultor a ese proyecto
    horasTrabajadas: number; //Cantidad de horas sea > 0 y razonable (≤ 24 por día)
    descripcionActividad: string;   
}