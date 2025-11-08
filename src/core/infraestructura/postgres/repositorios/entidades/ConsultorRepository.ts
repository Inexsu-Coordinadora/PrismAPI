import { IConsultorRepositorio } from "../../../../dominio/repositorio/entidades/IConsultorRepositorio";
import { ejecutarConsulta } from "./ClientePostgres";
import { IConsultor } from "../../../../dominio/entidades/IConsultor";
import { ConsultorDTO } from "../../../../presentacion/esquemas/entidades/consultorEsquema";

export class ConsultorRepositorio implements IConsultorRepositorio {
    async crearConsultor(datosConsultor: ConsultorDTO): Promise<IConsultor> {
        const columnas = Object.keys(datosConsultor)
        .map(key => key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase());
        const entries = Object.entries(datosConsultor);                                                  // Convierte un objeto en arreglo pares clave-valor
        const parametros: Array<string | number | null> = entries.map(([, v]) => (v as string | number | null) ?? null);  //Recorre el arreglo y tomas solo los valores, dev otro arreglo
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
       // BASE DE LA CONSULTA
        let query = 'SELECT * FROM consultores';
        const valores: Array<number> = [];
        // SI VIENE LIMITE LO APLICO
        if (limite !== undefined) {
            query += ' LIMIT $1';
            valores.push(limite);
        }

        const respuesta = await ejecutarConsulta(query, valores);
        return respuesta.rows;
    }

    async obtenerConsultorPorId(idConsultor: string): Promise<IConsultor | null> {
        const query = 'SELECT * FROM consultores WHERE id_consultor = $1';
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
            WHERE id_consultor = $${parametros.length}
            RETURNING *
        `;

        const respuesta = await ejecutarConsulta(query, parametros);
        return respuesta.rows[0] || null;
    }       

    async eliminarConsultor(idConsultor: string): Promise<void> {
        await ejecutarConsulta('DELETE FROM consultores WHERE id_consultor = $1', [idConsultor]);
    }
}
