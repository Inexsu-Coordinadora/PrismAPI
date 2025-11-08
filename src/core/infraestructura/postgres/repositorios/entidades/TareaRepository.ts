import { ITareaRepositorio } from "../../../../dominio/repositorio/entidades/ITareasRepositorio";
import { ITarea } from "../../../../dominio/entidades/ITarea";
import { ejecutarConsulta } from "./ClientePostgres";

export class TareaRepository implements ITareaRepositorio {
  //* Este es un "mapeador", que traduce los nombres de la BD (snake_case) a los nombres de nuestro proyecto (camelCase).
private mapearTarea(fila: any): ITarea {
    return {
    idTarea: fila.id_tarea,
    tituloTarea: fila.titulo_tarea,
    descripcionTarea: fila.descripcion_tarea,
    estadoTarea: fila.estado_tarea,
    };
}

async crearTarea(datosTarea: ITarea): Promise<string> {
    const { tituloTarea, descripcionTarea, estadoTarea } = datosTarea;

    const query = `
        INSERT INTO tareas (titulo_tarea, descripcion_tarea, estado_tarea)
        VALUES ($1, $2, $3)
        RETURNING *
        `;

    const parametros = [tituloTarea, descripcionTarea ?? null, estadoTarea];
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

    return result.rows.map(this.mapearTarea);
}

async obtenerTareaPorId(idTarea: string): Promise<ITarea | null> {
    const query = "SELECT * FROM tareas WHERE id_tarea = $1";
    const result = await ejecutarConsulta(query, [idTarea]);

    if (result.rows.length === 0) {
    return null;
    }
    return this.mapearTarea(result.rows[0]);
}

async actualizarTarea(
    idTarea: string,
    datosTarea: Partial<ITarea>
): Promise<ITarea | null> {
    
    //* Mapeo de atributos de JS (camelCase) a columnas de DB (snake_case)
    const mapeoColumnas: { [key in keyof ITarea]?: string } = {
    tituloTarea: "titulo_tarea",
    descripcionTarea: "descripcion_tarea",
    estadoTarea: "estado_tarea",
    };

    const columnasActualizar = Object.keys(datosTarea)
    .map((key) => mapeoColumnas[key as keyof ITarea])
    .filter(Boolean);

    if(columnasActualizar.length === 0){
        return this.obtenerTareaPorId(idTarea);
    }

    const setClause = columnasActualizar.map((col, i) => `${col}=$${i + 1}`).join(", ");

    const parametros = Object.values(datosTarea).map((val) => val ?? null);
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
    return this.mapearTarea(result.rows[0]);

}
async eliminarTarea(idTarea: string): Promise<void> {
    const query ="DELETE FROM tareas WHERE id_tarea = $1";
    await ejecutarConsulta(query, [idTarea]);
}
}
