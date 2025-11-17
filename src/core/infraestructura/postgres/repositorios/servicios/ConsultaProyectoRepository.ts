import { ProyectoConConsultoresDTO } from "../../../../presentacion/esquemas/servicios/consultaProyectoEsquema";
import { ejecutarConsulta } from "../../ClientePostgres";
import { FiltrosConsultaProyectos } from "../../../../presentacion/esquemas/servicios/consultaProyectoEsquema";


export class ConsultarProyectosPorClienteRepositorio {
  
  async obtenerProyectosPorCliente(
    idCliente: string,
    filtros?: FiltrosConsultaProyectos
  ): Promise<ProyectoConConsultoresDTO[]> {
 
    let query = `
      SELECT 
        p.id_proyecto,
        p.nombre_proyecto,
        p.estado_proyecto,
        p.fecha_inicio_proyecto,
        p.fecha_fin_proyecto,
        c.id_consultor,
        c.nombre_consultor,
        acp.rol_consultor
      FROM public.proyectos p
      LEFT JOIN public.asignaciones_consultores_proyectos acp 
        ON p.id_proyecto = acp.id_proyecto
      LEFT JOIN public.consultores c 
        ON acp.id_consultor = c.id_consultor
      WHERE p.id_cliente = $1
    `;

    const params: any[] = [idCliente];
    let paramIndex = 2;

    if (filtros?.estadoProyecto) {
      query += ` AND p.estado_proyecto = $${paramIndex}`;
      params.push(filtros.estadoProyecto);
      paramIndex++;
    }

    if (filtros?.fechaInicioProyecto) {
      query += ` AND p.fecha_inicio_proyecto >= $${paramIndex}`; 
      params.push(filtros.fechaInicioProyecto);
      paramIndex++;
    }

    if (filtros?.fechaFinProyecto) {
      query += ` AND p.fecha_fin_proyecto <= $${paramIndex}`;
      params.push(filtros.fechaFinProyecto);
      paramIndex++;
    }

    query += ` ORDER BY p.id_proyecto, c.nombre_consultor`;

    const result = await ejecutarConsulta(query, params);

    return this.mapearProyectosConConsultores(result.rows);
  }

  async existeCliente(idCliente: string): Promise<boolean> {
    const query = `
      SELECT 1 
      FROM public.clientes 
      WHERE id_cliente = $1
      LIMIT 1
    `;
    const result = await ejecutarConsulta(query, [idCliente]);
    return (result.rowCount ?? 0) > 0;
  }

  // ================== HELPERS PRIVADOS ================== //

  
  private mapearProyectosConConsultores(
    filas: any[]
  ): ProyectoConConsultoresDTO[] {
    const proyectosMap = new Map<string, ProyectoConConsultoresDTO>();

    for (const fila of filas) {
      const idProyecto: string = fila.id_proyecto;

    
      if (!proyectosMap.has(idProyecto)) {
        proyectosMap.set(idProyecto, {
          codigoProyecto: idProyecto,
          nombreProyecto: fila.nombre_proyecto,
          estadoProyecto: fila.estado_proyecto,
          fechaInicioProyecto: fila.fecha_inicio_proyecto
            ? fila.fecha_inicio_proyecto.toISOString()
            : null,
          fechaFinProyecto: fila.fecha_fin_proyecto
            ? fila.fecha_fin_proyecto.toISOString()
            : null,
          consultores: [],
        });
      }


      if (fila.id_consultor) {
        const proyecto = proyectosMap.get(idProyecto)!;
        proyecto.consultores.push({
          nombre: fila.nombre_consultor,
          rol: fila.rol_consultor,
        });
      }
    }

    return Array.from(proyectosMap.values());
  }
}
