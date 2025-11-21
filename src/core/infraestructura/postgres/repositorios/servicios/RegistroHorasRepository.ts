import { IRegistroHorasRepositorio } from "../../../../dominio/repositorio/servicios/IRegistroHorasRepositorio";
import { IRegistroHoras } from "../../../../dominio/servicios/IRegistroHoras";
import { ejecutarConsulta } from "../../ClientePostgres";

/** Repositorio de registros de horas sobre Postgres
  * Encapsula el esquema físico (snake_case) y expone el modelo de dominio (camelCase)
 */
export class RegistroHorasRepository implements IRegistroHorasRepositorio {

  /** Normaliza la fecha proveniente de la BD para que el dominio reciba siempre un Date sin componente de hora */
  private mapearFechaSoloDia(valor: unknown): Date {  
    if (!valor) {                                          
      throw new Error("Fecha requerida ausente en registrar_horas");
    }
    if (valor instanceof Date) {
      return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
    }
    if(typeof valor === "string") {
      const [y, m, d] = valor.split("-").map(Number);
      if (!y || !m || !d) {
        throw new Error(`Formato de fecha inválido: '${valor}'. Se esperaba 'YYYY-MM-DD'.`);
      } 
      return new Date(y, m - 1, d);
    }
    throw new Error(`Tipo de fecha no soportado en registrar_horas: ${typeof valor}`);
  }

  /** Traduce una fila en snake_case a IRegistroHoras en camel_Case con tipos correctos */
  private  mapearRegistroHoras(fila:any): IRegistroHoras{  
          return {
              idRegistroHoras: fila.id_registro_horas,
              idProyecto: fila.id_proyecto,
              idConsultor: fila.id_consultor,
              fechaRegistro: this.mapearFechaSoloDia(fila.fecha_registro),
              horasTrabajadas: Number(fila.horas_trabajadas),
              descripcionActividad: fila.descripcion_actividad
          };
      }


async crearParteHora(datos: IRegistroHoras): Promise<IRegistroHoras> {
  /** Se omiten propiedades indefinidas para no enviar nulls innecesarios a la BD */
  const entriesFiltradas = Object.entries(datos).filter(
    ([, v]) => v !== undefined && v !== null
  );
  /** Dominios en camelCase → columnas físicas en snake_case. */
  const columnas = entriesFiltradas
    .map(([key]) =>
      key.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase()
    );
  /** Se mantienen fechas como 'YYYY-MM-DD' para evitar almacenar horas.*/
  const parametros: Array<string | number> = entriesFiltradas.map(([key, v]) => {
    if (v instanceof Date) {
      const y = v.getFullYear();
      const m = String(v.getMonth() + 1).padStart(2, "0");
      const d = String(v.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    return v as string | number;
  });
  const placeholders = parametros.map((_, i) => `$${i + 1}`).join(", ");

  const query = `
    INSERT INTO registrar_horas (${columnas.join(", ")})
    VALUES (${placeholders})
    RETURNING *
  `;
  
  const respuesta = await ejecutarConsulta(query, parametros);
  const fila = respuesta.rows[0]
  return this.mapearRegistroHoras(fila);
}


    async listarPartesHoras( idConsultor?: string, idProyecto?: string): Promise<IRegistroHoras[]> {
    let query = "SELECT * FROM registrar_horas";
    const valores: any[] = [];
    const condiciones: string[] = [];
    /**Permite filtrar por consultor, proyecto o ambos utilizando la misma consulta */
    if (idConsultor) {
      condiciones.push(`id_consultor = $${valores.length + 1}`);
      valores.push(idConsultor);
    }

    if (idProyecto) {
      condiciones.push(`id_proyecto = $${valores.length + 1}`);
      valores.push(idProyecto);
    }
   
    if (condiciones.length > 0) {
      query += ` WHERE ${condiciones.join(" AND ")}`;
    }
    query += " ORDER BY fecha_registro DESC";

        const respuesta = await ejecutarConsulta(query, valores);
        return respuesta.rows.map((fila: any) => this.mapearRegistroHoras(fila)
      );
    }


    async obtenerParteHoraPorId(idParte: string): Promise<IRegistroHoras | null> {
    const query = `SELECT * FROM registrar_horas WHERE id_registro_horas = $1`;
    const respuesta = await ejecutarConsulta(query, [idParte]);
    const fila = respuesta.rows[0];
    if(!fila){
      return null;
    }
    return this.mapearRegistroHoras(fila);
    }


    async eliminarParteHora(idParte: string): Promise<void> {
    const query = `DELETE FROM registrar_horas WHERE id_registro_horas = $1`;
    await ejecutarConsulta(query, [idParte]);
    }
}