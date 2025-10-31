export interface ProyectoQueryParams {
    nombre?: string;
    estado?: string;
    fechaInicioDesde: Date;
    fechaInicioHasta: Date;
    ordenarPor?: 'nombreProyecto' | 'fechaIncio' | 'estadoProyecto';
    ordenarOrden: 'asc' | 'desc';
    pagina?: number;
    limite?: number; 
}