import { IConsultorRepositorio } from "../../../../dominio/repositorio/entidades/IConsultorRepositorio";
import { ejecutarConsulta } from "../../ClientePostgres";
import { IConsultor } from "../../../../dominio/entidades/IConsultor";

/** Repositorio de registros de horas sobre Postgres
  * Encapsula el esquema físico (snake_case) y expone el modelo de dominio (camelCase)
 */

export class ConsultorRepository implements IConsultorRepositorio {
    
    /**Mapea una fila de la tabla consultores (snake_case) al modelo de dominio IConsultor.*/
    private  mapearConsultor(fila:any): IConsultor{
        return {
            idConsultor: fila.id_consultor,
            nombreConsultor: fila.nombre_consultor,
            especialidadConsultor: fila.especialidad_consultor,
            disponibilidadConsultor: fila.disponibilidad_consultor,
            emailConsultor: fila.email_consultor,
            telefonoConsultor: fila.telefono_consultor
        }
    }


    async crearConsultor(datosConsultor: IConsultor): Promise<IConsultor> {
        const columnas = Object.keys(datosConsultor)
        .map(key => key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase());
        const entries = Object.entries(datosConsultor);                                                  
        const parametros: Array<string | number | null> = entries.map(([, v]) => (v as string | number | null) ?? null);
        const placeholders = parametros.map((_, index) => `$${index + 1}`).join(", ");

        const query = `
            INSERT INTO consultores (${columnas.join(", ")}) 
            VALUES (${placeholders}) 
            RETURNING *
        `;

        const respuesta = await ejecutarConsulta(query, parametros);
        const fila = respuesta.rows[0];
        return this.mapearConsultor(fila); 
    }     


    async listarConsultores(limite?: number, pagina?: number): Promise<IConsultor[]> {
        let query = 'SELECT * FROM consultores';
        const valores: Array<number> = [];

        /** El paginado es opcional: si no hay límite, se devuelven todos los registros. */
        if (limite !== undefined) {
            query += ' LIMIT $1';
            valores.push(limite);

            if (pagina !== undefined && pagina > 0) {
                query += " OFFSET $2";
                valores.push((pagina - 1) * limite);
            }
        }

        const respuesta = await ejecutarConsulta(query, valores);
        return respuesta.rows.map((fila) => this.mapearConsultor(fila));
    }


    async obtenerConsultorPorId(idConsultor: string): Promise<IConsultor | null> {
        const query = 'SELECT * FROM consultores WHERE id_consultor = $1';
        const respuesta = await ejecutarConsulta(query, [idConsultor]);
        const fila = respuesta.rows[0];
        if(!fila) return null;
        return this.mapearConsultor(fila); 
    }


    async actualizarConsultor(idConsultor: string, datosConsultor: Partial<IConsultor>): Promise<IConsultor | null> {
        /** Si no se envía ningún campo, se devuelve el estado actual del consultor*/
        if (Object.keys(datosConsultor).length === 0){
            return this.obtenerConsultorPorId(idConsultor);
        }
        const columnas = Object.keys(datosConsultor).map(key => key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase());
        const valores = Object.values(datosConsultor) as (string | number | null)[];
        const setClause = columnas.map((columna, index) => `${columna} = $${index + 1}`).join(", ");
        const parametros: (string | number | null)[] = [...valores, idConsultor];

        const query = `
            UPDATE consultores
            SET ${setClause}
            WHERE id_consultor = $${parametros.length}
            RETURNING *
        `;

        const respuesta = await ejecutarConsulta(query, parametros);
        const fila = respuesta.rows[0];
        if(!fila) return null;
        return this.mapearConsultor(fila);
    }       

    
    async eliminarConsultor(idConsultor: string): Promise<void> {
        await ejecutarConsulta('DELETE FROM consultores WHERE id_consultor = $1', [idConsultor]);
    }
}