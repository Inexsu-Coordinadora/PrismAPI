import { IConsultorRepositorio } from "../dominio/repositorio/IConsultorRepositorio";
import { ejecutarConsulta } from "./ClientePostgres";
import { IConsultor } from "../dominio/IConsultor";
import { Pool } from "pg";

export class ConsultorRepositorio implements IConsultorRepositorio {
    async crearConsultor(datosConsultor: IConsultor, conexion: Pool): Promise<IConsultor> {
        const columnas = Object.keys(datosConsultor).map((key) => key.replace(/([A-Z])/g, '$1').toLowerCase().replace(/^./, (letra) => letra.toUpperCase()));
        const parametros: Array<string | number> = Object.values(datosConsultor);
        const placeholders = parametros.map((_, index) => `$${index + 1}`).join(", ");

        const query = `
            INSERT INTO consultores (${columnas.join(", ")}) 
            VALUES (${placeholders}) 
            RETURNING *
        `;

        const respuesta = await ejecutarConsulta(query, parametros);
        return respuesta.rows[0]; 
    }     

    async listarConsultores(limite?: number, pagina?: number): Promise<IConsultor[]> {
        let query = 'SELECT * FROM consultores';
        const valores: Array<number> = [];

        if (limite !== undefined) {
            query += ' LIMIT $1';
            valores.push(limite);
        }

        const respuesta = await ejecutarConsulta(query, valores);
        return respuesta.rows;
    }

    async obtenerConsultorPorId(idConsultor: string): Promise<IConsultor | null> {
        const query = 'SELECT * FROM consultores WHERE idConsultor = $1';
        const respuesta = await ejecutarConsulta(query, [idConsultor]);
        return respuesta.rows[0] || null;
    }

    async actualizarConsultor(idConsultor: string, datosConsultor: Partial<IConsultor>): Promise<IConsultor | null> {
        const columnas = Object.keys(datosConsultor).map((key) => key.replace(/([A-Z])/g, '$1').toLowerCase().replace(/^./, (letra) => letra.toUpperCase()));
        const parametros = Object.values(datosConsultor);
        const setClause = columnas.map((columna, index) => `${columna} = $${index + 1}`).join(", ");
        parametros.push(idConsultor);

        const query = `
            UPDATE consultores
            SET ${setClause}
            WHERE idConsultor = $${parametros.length}
            RETURNING *
        `;

        const respuesta = await ejecutarConsulta(query, parametros);
        return respuesta.rows[0] || null;
    }       

    async eliminarConsultor(idConsultor: string): Promise<void> {
        await ejecutarConsulta('DELETE FROM consultores WHERE idConsultor = $1', [idConsultor]);
    }
}
