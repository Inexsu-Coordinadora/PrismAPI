import { IProyectoRepositorio } from "../../../../dominio/repositorio/entidades/IProyectoRepositorio";
import { ejecutarConsulta } from '../../ClientePostgres';
import { IProyecto } from "../../../../dominio/entidades/IProyecto";
import { ProyectoQueryParams } from "../../../../dominio/tipos/proyecto/ProyectoQueryParams";


    type PartesConsulta = {
    columnasSQL: string[];
    parametros: (string | number | null)[];
    placeholders: string[]; 
    setClauses: string[];   
};


export class ProyectoRepository implements IProyectoRepositorio {

    async crearProyecto(datosProyecto: IProyecto): Promise<string>{
        const {nombreProyecto, tipoProyecto, fechaInicioProyecto, fechaFinProyecto, estadoProyecto} = datosProyecto;

        const fechaInicioStr = fechaInicioProyecto instanceof Date ? fechaInicioProyecto.toISOString().split('T')[0] : (fechaInicioProyecto ?? null);
        const fechaFinStr = fechaFinProyecto instanceof Date ? fechaFinProyecto.toISOString().split('T')[0] : (fechaFinProyecto ?? null);
        
        const query = 
        `INSERT INTO proyectos (nombre_proyecto, tipo_proyecto, fecha_inicio_proyecto, fecha_fin_proyecto, estado_proyecto)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING * --aquí Postgress genera el id automáticamente`;

        const parametros: (string | null)[] = [nombreProyecto, tipoProyecto ?? null, fechaInicioStr ?? null, fechaFinStr ?? null, estadoProyecto]
        const respuesta = await ejecutarConsulta(query, parametros);
        return respuesta.rows[0].id_proyecto;
    }

    async obtenerProyectoPorId (idProyecto:string): Promise<IProyecto | null>{
        const query = "SELECT * FROM proyectos WHERE id_proyecto = $1";
        const result = await ejecutarConsulta(query, [idProyecto]);

        if (result.rows.length=== 0){
            return null;
        }
        return this.mapearProyecto(result.rows[0]);
    }

    async obtenerProyectos(params: ProyectoQueryParams):Promise<{ data: IProyecto[]; total: number; pagina: number; limite: number }>{
        let query = " FROM proyectos WHERE 1=1";        
        const values: (string | number | null)[] = [];
        let parametroConsulta = 1;

        //Buscar por nombre del proyecto
        if(params.nombre){
        query += ` AND nombre_proyecto ILIKE $${parametroConsulta}`;
        values.push(`%${params.nombre}%`);
        parametroConsulta++;
        }

        //Buscar por estado del proyecto
        if (params.estado) {
        query += ` AND estado_proyecto = $${parametroConsulta}`;
        values.push(params.estado);
        parametroConsulta++;
        }

        //Buscar qué proyectos se inicializaron después de una fecha establecida
        if (params.fechaInicioDesde) {
        const fechaDesde = params.fechaInicioDesde instanceof Date
        ? params.fechaInicioDesde.toISOString().split('T')[0]
        : params.fechaInicioDesde;
        query += ` AND fecha_inicio_proyecto >= $${parametroConsulta}`;
        if(fechaDesde!== undefined){
        values.push(fechaDesde)};
        parametroConsulta++;
        }

        //Buscar qué proyectos se inicializaron hasta una fecha establecida
        if (params.fechaInicioHasta) {
            const fechaHasta = params.fechaInicioHasta instanceof Date
            ? params.fechaInicioHasta.toISOString().split('T')[0]
            : params.fechaInicioHasta;
            query += ` AND fecha_inicio_proyecto <= $${parametroConsulta}`;
            values.push(fechaHasta ?? null);
            parametroConsulta++;
        }

        //Consulta de todos los proyectos sin ordenar
        const countQuery = "SELECT COUNT(*) as total" + query; 
        const countResult = await ejecutarConsulta(countQuery, values.slice(0, parametroConsulta - 1)); 
        const total = parseInt(countResult.rows[0].total, 10);
        
        //Nombre de los campos que el usuario puede emplear para ordenar
        const columnasOrdenables: Record<string, string> = {
        nombreProyecto: "nombre_proyecto",
        fechaInicioProyecto: "fecha_inicio_proyecto",
        estadoProyecto: "estado_proyecto",
        };

        if (params.ordenarPor) {
        const columnaOrden = columnasOrdenables[params.ordenarPor];
        if (!columnaOrden) {
            throw new Error("Campo de ordenamiento inválido");
        }
        const orden = params.ordenarOrden === "desc" ? "DESC" : "ASC";
        query += ` ORDER BY ${columnaOrden} ${orden}`;
    }

        
        const limite = params.limite ?? 10;
        const pagina = params.pagina && params.pagina > 0 ? params.pagina : 1;
        const offset = (pagina - 1) * limite;

        if (offset >= total && total > 0) {
        return {
            data: [],
            total,
            pagina,
            limite,
        };
    }

        const dataQuery = "SELECT *" + query + ` LIMIT $${parametroConsulta} OFFSET $${parametroConsulta + 1}`;
        values.push(limite, offset);

    
        const result = await ejecutarConsulta(dataQuery, values);
        const proyectos = result.rows.map(row => this.mapearProyecto(row));

        return {
        data: proyectos,
        total,
        pagina,
        limite,
        };

    }
        
        
    async actualizarProyecto(idProyecto:string, datosProyecto:Partial<IProyecto>):Promise<IProyecto | null>{
        const { parametros, setClauses } = this.construirPartesConsulta(datosProyecto);
    
    if (setClauses.length === 0) {
        return await this.obtenerProyectoPorId(idProyecto);
    }

    const setClause = setClauses.join(", ");
    parametros.push(idProyecto);

    const query = `
        UPDATE proyectos
        SET ${setClause}
        WHERE id_proyecto = $${parametros.length}
        RETURNING *
    `;

    const result = await ejecutarConsulta(query, parametros);
    if (result.rows.length === 0) {
        return null;
    }
    
    return this.mapearProyecto(result.rows[0]);
}

    async eliminarProyecto(idproyecto:string):Promise<void>{
        await ejecutarConsulta("DELETE FROM proyectos WHERE id_proyecto = $1", [idproyecto]);
    }


    //Helpers
    //mapeador que traduce los nombres de las bases de datos (snake_case) a los nombres de nuestro proyecto (camelcase)
    private mapearProyecto(fila:any):IProyecto{

        return{
            idProyecto: fila.id_proyecto,
            nombreProyecto: fila.nombre_proyecto,
            tipoProyecto: fila.tipo_proyecto ,
            fechaInicioProyecto: fila.fecha_inicio_proyecto ? new Date(fila.fecha_inicio_proyecto) : null,
            fechaFinProyecto: fila.fecha_fin_proyecto ? new Date(fila.fecha_fin_proyecto): null,
            estadoProyecto:fila.estado_proyecto
        }
    }

    private readonly mapeoColumnas: { [key in keyof Partial<IProyecto>]?: string } = {
        nombreProyecto: "nombre_proyecto",
        tipoProyecto: "tipo_proyecto", 
        fechaInicioProyecto: "fecha_inicio_proyecto",
        fechaFinProyecto: "fecha_fin_proyecto",
        estadoProyecto: "estado_proyecto"
    };

    private construirPartesConsulta(
            datos: Partial<IProyecto>, 
            inicioIndex = 1
        ): PartesConsulta {
            
            const columnasSQL: string[] = [];
            const parametros: (string | number | null)[] = [];
            const placeholders: string[] = [];
            const setClauses: string[] = [];
            let parametroIndex = inicioIndex;
    
            for (const key of Object.keys(datos)) {
                const jsKey = key as keyof IProyecto;
                const dbColumna = this.mapeoColumnas[jsKey]; 
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
