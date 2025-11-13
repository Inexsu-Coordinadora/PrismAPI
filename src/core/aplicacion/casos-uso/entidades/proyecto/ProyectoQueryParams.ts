import { EstadoProyecto } from "../../../../dominio/entidades/IProyecto";

export interface ProyectoQueryParams {
    nombre?: string;
    estado?: EstadoProyecto;
    fechaInicioDesde?: string | Date;
    fechaInicioHasta?: string | Date;
    ordenarPor?: 'nombreProyecto' | 'fechaInicio' | 'estadoProyecto' ;
    ordenarOrden?: 'asc' | 'desc' ;
    pagina?: number;
    limite?: number; 
}