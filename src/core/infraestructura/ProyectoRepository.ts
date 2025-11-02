import { IProyectoRepositorio } from "../dominio/repositorio/IProyectoRepositorio";
import { ejecutarConsulta } from "./ClientePostgres";
import { IProyecto } from "../dominio/IProyecto";
import { ProyectoQueryParams } from "../dominio/ProyectoQueryParams";

export class ProyectoRepository implements IProyectoRepositorio {

    //mapeador que traduce los nombres de las bases de datos (snake_case) a los nombres de nuestro proyecto (camelcase)
    private mapearProyecto(fila:any):IProyecto{

        return{
            idProyecto: fila.id_proyecto,
            nombreProyecto: fila.nombre_proyecto,
            tipoProyecto: fila.tipo_proyecto ,
            fechaInicio: fila.fecha_inicio,
            fechaFin: fila.fecha_fin,
            estadoProyecto:fila.estado_proyecto
        }
    }
    async crearProyecto(datosProyecto: IProyecto): Promise<string>{
        const {nombreProyecto, tipoProyecto, fechaInicio, fechaFin, estadoProyecto} = datosProyecto;

        const fechaInicioStr = fechaInicio instanceof Date ? fechaInicio.toISOString().split('T')[0] : (fechaInicio ?? null);
        const fechaFinStr = fechaFin instanceof Date ? fechaFin.toISOString().split('T')[0] : (fechaFin ?? null);
        
        const query = 
        `INSERT INTO proyectos (nombre_proyecto, tipo_proyecto, fecha_inicio, fecha_fin, estado_proyecto)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING * --aquí Postgress genera el id automáticamente`;

        const parametros: (string | null)[] = [nombreProyecto, tipoProyecto ?? null, fechaInicioStr ?? null, fechaFinStr ?? null, estadoProyecto]
        const respuesta = await ejecutarConsulta(query, parametros);
        return respuesta.rows[0].id_proyecto;
    }

    async obtenerProyectoPorId (idProyecto:string): Promise<IProyecto | null>{
        const query = "SELECT * FROM proyectos WHERE idProyecto = $1";
        const result = await ejecutarConsulta(query, [idProyecto]);

        if (result.rows.length=== 0){
            return null;
        }
        return this.mapearProyecto(result.rows[0]);
    }

    async obtenerProyectos(params: ProyectoQueryParams):Promise<{ data: IProyecto[]; total: number; pagina: number; limite: number }>{
        let query = " FROM proyectos WHERE 1=1";        
        const values: (string | number)[] = [];
        let parametroConsulta = 1;

        if(params.nombre){
        query += ` AND nombreProyecto ILIKE $${parametroConsulta}`;
        values.push(`%${params.nombre}%`);
        parametroConsulta++;
        }

        if (params.estado) {
        query += ` AND estadoProyecto = $${parametroConsulta}`;
        values.push(params.estado);
        parametroConsulta++;
        }

        if (params.fechaInicioDesde) {
        const fechaDesde = params.fechaInicioDesde instanceof Date
        ? params.fechaInicioDesde.toISOString().split('T')[0]
        : params.fechaInicioDesde;
        query += ` AND fechaInicio >= $${parametroConsulta}`;
        if(fechaDesde!== undefined){
        values.push(fechaDesde)};
        parametroConsulta++;
        }

        if (params.fechaInicioHasta) {
            const fechaHasta = params.fechaInicioHasta instanceof Date
            ? params.fechaInicioHasta.toISOString().split('T')[0]
            : params.fechaInicioHasta;
            query += ` AND fechaInicio <= $${parametroConsulta}`;
            if(fechaHasta !==undefined){
            values.push(fechaHasta);
            parametroConsulta++};
        }

        const countQuery = "SELECT COUNT(*) as total" + query;
        const limite = params.limite ?? 10;
        const pagina = params.pagina && params.pagina > 0 ? params.pagina : 1;
        const offset = (pagina - 1) * limite;

        const dataQuery = "SELECT *" + query + ` LIMIT $${parametroConsulta} OFFSET $${parametroConsulta + 1}`;
        values.push(limite, offset);

        const countResult = await ejecutarConsulta(countQuery, values.slice(0, parametroConsulta - 1)); // Solo los filtros, sin paginación
        const total = parseInt(countResult.rows[0].total, 10);
        const result = await ejecutarConsulta(dataQuery, values);
        const proyectos = result.rows.map(row => this.mapearProyecto(row));
        return {
        data: proyectos,
        total,
        pagina,
        limite,
        };

        }
        
        
    async actualizarProyecto(idProyecto:string, datosProyecto:IProyecto):Promise<IProyecto | null>{
        const mapeoColumnas: { [key in keyof IProyecto]?: string } = {
        nombreProyecto: "nombre_proyecto",
        tipoProyecto: "tipo_proyecto",
        fechaInicio: "fecha_inicio",
        fechaFin: "fecha_fin",
        estadoProyecto: "estado_proyecto",

        };

        const columnasActualizar = Object.keys(datosProyecto)
        .map((key) => mapeoColumnas[key as keyof IProyecto])
        .filter(Boolean);

        if(columnasActualizar.length === 0){
        return this.obtenerProyectoPorId(idProyecto);
    }

    const setClause = columnasActualizar.map((col, i) => `${col}=$${i + 1}`).join(", ");

    const parametros = Object.values(datosProyecto).map((val) => val ?? null);
    parametros.push(idProyecto);

        const query=
        `UPDATE proyectos
        SET ${setClause} 
        WHERE idproyecto =$${parametros.length}
        RETURNING *`;

        const result = await ejecutarConsulta(query, parametros);
        if (result.rows.length === 0) {
        return null;
    }
        return this.mapearProyecto(result.rows[0]);
    }

    async eliminarProyecto(idproyecto:string):Promise<void>{
        await ejecutarConsulta("DELETE FROM proyectos WHERE idproyecto = $1", [idproyecto]);
    }
}