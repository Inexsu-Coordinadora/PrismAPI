import { IAsignacionConsultorProyectoRepositorio } from "../../../../dominio/repositorio/servicios/IAsignacionConsultorProyectoRepositorio";
import { IAsignacionConsultorProyecto } from "../../../../dominio/servicios/IAsignacionConsultorProyecto";
import { ejecutarConsulta } from "../../ClientePostgres";

//Helper para el resultado de nuestra función privada
type PartesConsulta ={
    columnasSQL: string [];
    parametros : (string | number | null)[];
    placeholders : string[];
    setClauses : string[];
}

export class AsignacionConsultorProyectoRepository implements IAsignacionConsultorProyectoRepositorio{

    async asignarConsultorProyecto(datosAsignacion:IAsignacionConsultorProyecto):Promise<string>{
        const {columnasSQL, parametros, placeholders} = this.construirPartesConsulta(datosAsignacion);

        if(columnasSQL.length === 0){
            throw new Error("No existen datos válidos para crear la asignación");
        }

        const query =`
        INSERT INTO asignaciones_consultores_proyectos (${columnasSQL.join(", ")})
            VALUES (${placeholders.join(", ")})
            RETURNING id_asignacion
        `;
        const respuesta = await ejecutarConsulta(query, parametros);
        return respuesta.rows[0].id_asignacion;
    }

    async obtenerAsignacionPorId(idAsignacion: string):Promise<IAsignacionConsultorProyecto | null>{
        const query = `
            SELECT * FROM asignaciones_consultores_proyectos 
            WHERE id_asignacion = $1
        `;
        const result = await ejecutarConsulta(query, [idAsignacion]);
        
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapearAsignacion(result.rows[0]);
    }
    
    async obtenerAsignacionPorConsultor(idConsultor: string): Promise<IAsignacionConsultorProyecto[]> {
        const query = `
            SELECT * FROM asignaciones_consultores_proyectos 
            WHERE id_consultor = $1
            ORDER BY fecha_inicio_asignacion DESC
        `;
        const result = await ejecutarConsulta(query, [idConsultor]);
        return result.rows.map(this.mapearAsignacion);
    }

    async obtenerAsignacionPorProyecto(idProyecto: string): Promise<IAsignacionConsultorProyecto[]> {
        const query = `
            SELECT * FROM asignaciones_consultores_proyectos 
            WHERE id_proyecto = $1
            ORDER BY fecha_inicio_asignacion DESC
        `;
        const result = await ejecutarConsulta(query, [idProyecto]);
        return result.rows.map(this.mapearAsignacion);
    }

    async obtenerAsignacionExistente(idConsultor: string, idProyecto: string, rolConsultor: string | null): Promise<IAsignacionConsultorProyecto | null> {
        let query = `
            SELECT * FROM asignaciones_consultores_proyectos 
            WHERE id_consultor = $1 AND id_proyecto = $2
        `;
        
        const parametros = [idConsultor, idProyecto];
        // ¡ESTA ES LA MAGIA QUE NECESITAS!
        if (rolConsultor) {
        query += ` AND rol_consultor = $3`;
        parametros.push(rolConsultor);
    }


        const result = await ejecutarConsulta(query, parametros);

        if (result.rows.length === 0) {
            return null;
        }
        
        return this.mapearAsignacion(result.rows[0]);
    }

    async obtenerDedicacionConsultor(idConsultor: string, fechaInicioAsignacion: Date, fechaFinAsignacion: Date | null): Promise<number> {

        /*Se requiere % de tiempo que tiene asignado un consultor en un rango de fechas específico
        Suma todos los porcentajes de asignaciones del consultor donde las fechas de la asignación existente se traslapan de cualquier manera con el rango de fechas que quiero asignar. */
        
    const query = `
        SELECT COALESCE(SUM(porcentaje_dedicacion), 0) as dedicacion_acumulada
        FROM asignaciones_consultores_proyectos 
        WHERE id_consultor = $1 
        AND (
            -- Caso 1: Asignación empieza DENTRO del rango consultado
            (fecha_inicio_asignacion >= $2 AND 
            (fecha_fin_asignacion IS NULL OR fecha_inicio_asignacion <= $3))
            OR
            -- Caso 2: Asignación termina DENTRO del rango consultado  
            (fecha_fin_asignacion >= $2 AND fecha_fin_asignacion <= $3)
            OR
            -- Caso 3: Asignación cubre TODO el rango consultado
            (fecha_inicio_asignacion <= $2 AND 
            (fecha_fin_asignacion IS NULL OR fecha_fin_asignacion >= $3))
            OR
            -- Caso 4: Rango consultado cubre TODA la asignación
            (fecha_inicio_asignacion >= $2 AND fecha_fin_asignacion <= $3)
        )
    `;

    const fechaInicioStr = fechaInicioAsignacion.toISOString().split('T')[0] as string; //con esto se está diciendo que es string nunca undefined
    const fechaFinStr = fechaFinAsignacion 
    ? fechaFinAsignacion.toISOString().split('T')[0] as string
    : '2100-12-31'; 

    
    const parametros = [idConsultor, fechaInicioStr, fechaFinStr];
    const resultado = await ejecutarConsulta(query, parametros);
    
    return parseInt(resultado.rows[0].dedicacion_acumulada) || 0;

}
    
async actualizarAsignacion(idAsignacion: string, datosAsignacion: IAsignacionConsultorProyecto): Promise<IAsignacionConsultorProyecto> {
    const { parametros, setClauses } = this.construirPartesConsulta(datosAsignacion);
        
        if (setClauses.length === 0) {
            return this.obtenerAsignacionPorId(idAsignacion) as Promise<IAsignacionConsultorProyecto>;
        }
        
        const setClause = setClauses.join(", ");
        parametros.push(idAsignacion);
        
        const query = `
            UPDATE asignaciones_consultores_proyectos
            SET ${setClause}
            WHERE id_asignacion = $${parametros.length}
            RETURNING *
        `;
        
        const result = await ejecutarConsulta(query, parametros);
        
        if (result.rows.length === 0) {
            throw new Error("Asignación no encontrada para actualizar");
        }
        
        return this.mapearAsignacion(result.rows[0]);
    
}

async eliminarAsignacion(idAsignacion: string): Promise<void> {
    const query = "DELETE FROM asignaciones_consultores_proyectos WHERE id_asignacion = $1";
        await ejecutarConsulta(query, [idAsignacion]);
}



//HELPERS: implementación interna

    private mapearAsignacion(fila: any): IAsignacionConsultorProyecto {
        return {
            idAsignacion: fila.id_asignacion,
            idConsultor: fila.id_consultor,
            idProyecto: fila.id_proyecto,
            rolConsultor: fila.rol_consultor,
            porcentajeDedicacion: fila.porcentaje_dedicacion,
            fechaInicioAsignacion: new Date(fila.fecha_inicio_asignacion),
            fechaFinAsignacion: fila.fecha_fin_asignacion ? new Date(fila.fecha_fin_asignacion) : null
        };
    }

    private construirPartesConsulta(datosAsignacion: Partial<IAsignacionConsultorProyecto>): PartesConsulta {
        const columnasSQL: string[] = [];
        const parametros: (string | number | null)[] = [];
        const placeholders: string[] = [];
        const setClauses: string[] = [];
        let contador = 1;

        // Campos de la asignación
        if (datosAsignacion.idConsultor !== undefined) {
            columnasSQL.push("id_consultor");
            parametros.push(datosAsignacion.idConsultor ?? null);
            placeholders.push(`$${contador}`);
            setClauses.push(`id_consultor = $${contador}`);
            contador++;
        }

        if (datosAsignacion.idProyecto !== undefined) {
            columnasSQL.push("id_proyecto");
            parametros.push(datosAsignacion.idProyecto ?? null);
            placeholders.push(`$${contador}`);
            setClauses.push(`id_proyecto = $${contador}`);
            contador++;
        }

        if (datosAsignacion.rolConsultor !== undefined) {
            columnasSQL.push("rol_consultor");
            parametros.push(datosAsignacion.rolConsultor ?? null);
            placeholders.push(`$${contador}`);
            setClauses.push(`rol_consultor = $${contador}`);
            contador++;
        }

        if (datosAsignacion.porcentajeDedicacion !== undefined) {
            columnasSQL.push("porcentaje_dedicacion");
            parametros.push(datosAsignacion.porcentajeDedicacion ?? null);
            placeholders.push(`$${contador}`);
            setClauses.push(`porcentaje_dedicacion = $${contador}`);
            contador++;
        }

        if (datosAsignacion.fechaInicioAsignacion !== undefined) {
            columnasSQL.push("fecha_inicio_asignacion");
            const fechaStr = datosAsignacion.fechaInicioAsignacion 
        ? datosAsignacion.fechaInicioAsignacion.toISOString().split('T')[0] 
        : null;
    
        parametros.push(fechaStr as string | null);
        placeholders.push(`$${contador}`);
        setClauses.push(`fecha_inicio_asignacion = $${contador}`);
        contador++;
        }

        if (datosAsignacion.fechaFinAsignacion !== undefined) {
            columnasSQL.push("fecha_fin_asignacion");
            const fechaStr = datosAsignacion.fechaFinAsignacion 
            ? datosAsignacion.fechaFinAsignacion.toISOString().split('T')[0] 
            : null;
            parametros.push(fechaStr as string | null);
            placeholders.push(`$${contador}`);
            setClauses.push(`fecha_fin_asignacion = $${contador}`);
            contador++;
        }

        return { columnasSQL, parametros, placeholders, setClauses };
    }
}