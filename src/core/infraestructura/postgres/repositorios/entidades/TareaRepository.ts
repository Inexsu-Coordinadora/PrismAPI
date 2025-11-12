import { ITareaRepositorio } from "../../../../dominio/repositorio/entidades/ITareasRepositorio";
import { ITarea } from "../../../../dominio/entidades/ITarea";
import { ejecutarConsulta } from "../../ClientePostgres";


type PartesConsulta = {
    columnasSQL: string[];
    parametros: (string | number | null)[];
    placeholders: string[]; //* Solo para crearTarea -> INSERT
    setClauses: string[];   //* Solo para actualizarTarea -> UPDATE
};
export class TareaRepository implements ITareaRepositorio {
    
    async crearTarea(datosTarea: ITarea): Promise<string> {
        const { columnasSQL, parametros, placeholders } = 
        this.construirPartesConsulta(datosTarea); //* <-- Usa el Helper 3
        
        if (columnasSQL.length === 0) {
            throw new Error("No hay datos válidos para crear la tarea.");
        }
        
        const query = `
        INSERT INTO tareas(${columnasSQL.join(", ")})
        VALUES (${placeholders.join(", ")})
        RETURNING id_tarea
        `;
        
        const respuesta = await ejecutarConsulta(query, parametros);
        return respuesta.rows[0].id_tarea;
    }
    
    
    async listarTareas(limite?: number): Promise<ITarea[]> {
        let query = "SELECT * FROM tareas ORDER BY id_tarea ASC";
        const valores: number[] = [];
        
        if (limite !== undefined) {
            query += " LIMIT $1";
            valores.push(limite);
        }
        
        const result = await ejecutarConsulta(query, valores);
        
        return result.rows.map(this.mapearTarea);//* <-- Usa el Helper 1
    }
    

    async obtenerTareaPorId(idTarea: string): Promise<ITarea | null> {
        const query = "SELECT * FROM tareas WHERE id_tarea = $1";
        const result = await ejecutarConsulta(query, [idTarea]);
        
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapearTarea(result.rows[0]); //* <-- Usa el Helper 1
    }
    

    async actualizarTarea(
        idTarea: string,
        datosTarea: Partial<ITarea>
    ): Promise<ITarea | null> {
        
        const { parametros, setClauses } = 
        this.construirPartesConsulta(datosTarea); //* <-- Usa el Helper 3
        
        if (setClauses.length === 0) {
            return this.obtenerTareaPorId(idTarea); 
        }
        
        const setClause = setClauses.join(", ");
        parametros.push(idTarea);
        
        const query = `
        UPDATE tareas
        SET ${setClause}
        WHERE id_tarea = $${parametros.length}
        RETURNING *; 
        `;
        
        const result = await ejecutarConsulta(query,parametros);
        
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapearTarea(result.rows[0]); //* <-- Usa el Helper 1
        
    }


    async eliminarTarea(idTarea: string): Promise<void> {
        const query ="DELETE FROM tareas WHERE id_tarea = $1";
        await ejecutarConsulta(query, [idTarea]);
    }

    //* ------------------------ Nuevos Métodos de S4 (Consultas Complejas) ------------------------ //

    async buscarPorTituloYProyecto(tituloTarea: string, idProyecto: string): Promise<ITarea | null> {
        const query = `
            SELECT * FROM tareas 
            WHERE titulo_tarea = $1 AND id_proyecto = $2
        `;

        const parametros = [tituloTarea, idProyecto];
        const result = await ejecutarConsulta(query, parametros);

        if (result.rows.length === 0) {
            return null;
        }
        
        return this.mapearTarea(result.rows[0]);//* <-- Usa el Helper 1

    }


    async obtenerTareasPorProyecto(idProyecto: string): Promise<ITarea[]> {
        const query = `
            SELECT * FROM tareas 
            WHERE id_proyecto = $1 
            ORDER BY titulo_tarea ASC
        `;
        
        const result = await ejecutarConsulta(query, [idProyecto]);
        return result.rows.map(this.mapearTarea);//* <-- Usa el Helper 1
    }


    async obtenerTareaDeProyectoPorId(idTarea: string, idProyecto: string): Promise<ITarea | null> {
        const query = `
            SELECT * FROM tareas 
            WHERE id_tarea = $1 AND id_proyecto = $2
        `;
        const parametros = [idTarea, idProyecto];
        const result = await ejecutarConsulta(query, parametros);

        if (result.rows.length === 0) {
            return null;
        }
        
        return this.mapearTarea(result.rows[0]);//* <-- Usa el Helper 1
    
    }
    

    
    //* HELPER 1: Esta es una "fábrica" que construye objetos SQL(snake_case)  -> JS(camelCase)
    //*  Se usa para CONSTRUIR el objeto JS después de recibir de la BD 
    private mapearTarea(fila: any): ITarea {
        return {
        idTarea: fila.id_tarea,
        tituloTarea: fila.titulo_tarea,
        descripcionTarea: fila.descripcion_tarea,
        estadoTarea: fila.estado_tarea,
        //* Campos S4
        idProyecto: fila.id_proyecto,
        idConsultorAsignado: fila.id_consultor_asignado,
        fechaLimiteTarea: fila.fecha_limite_tarea 
        };
    }

    //* HELPER 2: Este es un DICCIONARIO de nombres (JS -> SQL)
    //* Se usa para CONSTRUIR la consulta (INSERT/UPDATE)
        private readonly mapeoColumnas: { [key in keyof Partial<ITarea>]?: string } = {
        tituloTarea: "titulo_tarea",
        descripcionTarea: "descripcion_tarea",
        estadoTarea: "estado_tarea",
        //* Campos S4
        idProyecto: "id_proyecto",
        idConsultorAsignado: "id_consultor_asignado",
        fechaLimiteTarea: "fecha_limite_tarea" 
    };

    //* HELPER 3:El constructor de consultas
    private construirPartesConsulta(
        datos: Partial<ITarea>, 
        inicioIndex = 1
    ): PartesConsulta {
        
        const columnasSQL: string[] = [];
        const parametros: (string | number | null)[] = [];
        const placeholders: string[] = [];
        const setClauses: string[] = [];
        let parametroIndex = inicioIndex;

        for (const key of Object.keys(datos)) {
            const jsKey = key as keyof ITarea;
            const dbColumna = this.mapeoColumnas[jsKey]; //* <-- Usa del Helper 2
            const valor = datos[jsKey];

            if (dbColumna && valor !== undefined) {
                columnasSQL.push(dbColumna);
                placeholders.push(`$${parametroIndex}`);
                setClauses.push(`${dbColumna} = $${parametroIndex}`);

                if (valor instanceof Date) {
                    parametros.push(valor.toISOString().split('T')[0]!);
                } else {
                    parametros.push(valor ?? null);
                }
                parametroIndex++;
            }
        }
        return { columnasSQL, parametros, placeholders, setClauses };
    }

}