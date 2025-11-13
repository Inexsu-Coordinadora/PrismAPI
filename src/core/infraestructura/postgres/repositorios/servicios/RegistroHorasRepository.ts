import { IRegistroHorasRepositorio } from "../../../../dominio/repositorio/servicios/IRegistroHorasRepositorio";
import { IRegistroHoras } from "../../../../dominio/servicios/IRegistroHoras";
import { ejecutarConsulta } from "../../ClientePostgres";

// Consultas reales sobre la tabla registrar_horas.
export class RegistroHorasRepository implements IRegistroHorasRepositorio {

//---------------------------- INSERTA UN NUEVO REGISTRO DE HORAS ----------------------------//
  async crearParteHora(datos: IRegistroHoras): Promise<IRegistroHoras> {
    const columnas = Object.keys(datos)                                // camelCase a snake_case
      .map((key) => key.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase());

    // CORRECCIÓN: no se envía Date al POOL. CONVIERTE A 'YYYY-MM-DD' Y TIPAMOS COMO (string|number|null)[]
    // Tomamos los valores, pero si alguno es Date lo convertimos a string 'YYYY-MM-DD'
    const entries = Object.entries(datos).map(([k, v]) => {
      if (v instanceof Date) {
        const y = v.getFullYear();
        const m = String(v.getMonth() + 1).padStart(2, "0");
        const d = String(v.getDate()).padStart(2, "0");
        return [k, `${y}-${m}-${d}`]; // <- queda string
      }
      return [k, v];
    });

    const parametros: Array<string | number | null> = entries.map(([, v]) =>
      (v as string | number | null) ?? null
    );

    const placeholders = parametros.map((_, i) => `$${i + 1}`).join(", "); // valor temporal o marcador de posición

    const query = // Query de inserción y devuelve el registro creado
      `INSERT INTO registrar_horas (${columnas.join(", ")})
      VALUES (${placeholders})
      RETURNING *
      `;

    
    const respuesta = await ejecutarConsulta(query, parametros);
    return respuesta.rows[0];
  }

//---------------------------- LISTA TODOS LOS REGISTROS DE HORAS ----------------------------//
    async listarPartesHoras( idConsultor?: string, idProyecto?: string): Promise<IRegistroHoras[]> {
    let query = "SELECT * FROM registrar_horas";
    const valores: any[] = [];
    const condiciones: string[] = [];

    if (idConsultor) {
      condiciones.push(`id_consultor = $${valores.length + 1}`);
      valores.push(idConsultor);
    }

    if (idProyecto) {
      condiciones.push(`id_proyecto = $${valores.length + 1}`);
      valores.push(idProyecto);
    }
    /*
    *** Las condiciones las agregamos con WHERE
    */
    if (condiciones.length > 0) {
      query += ` WHERE ${condiciones.join(" AND ")}`;
    }
    query += " ORDER BY fecha_registro DESC";

        const respuesta = await ejecutarConsulta(query, valores);
        return respuesta.rows;
    }
//---------------------------- BUSCA UN REGISTRO ESPECIFICO POR ID ----------------------------//
    async obtenerParteHoraPorId(idParte: string): Promise<IRegistroHoras | null> {
    const query = `SELECT * FROM registrar_horas WHERE id_registro_horas = $1`;
    const respuesta = await ejecutarConsulta(query, [idParte]);
    return respuesta.rows[0] || null;
    }
//---------------------------- ELIMINA UN REGISTRO DE LA TABLA ----------------------------//
      async eliminarParteHora(idParte: string): Promise<void> {
    const query = `DELETE FROM registrar_horas WHERE id_registro_horas = $1`;
    await ejecutarConsulta(query, [idParte]);
    }
}