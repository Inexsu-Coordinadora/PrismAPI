import { Pool } from "pg";
//import { configuration } from "../../../common/configuracion";
import { getConfig } from "../../../common/configuracion";

let pool: Pool;

function getPool() {
    if (!pool) {
        // 1. LLAMAMOS A LA FUNCIÓN
        const configuration = getConfig();
        
        console.log("***** INICIALIZANDO POOL DE CONEXIÓN *****");
        console.log("Conectando a DB:", configuration.baseDatos.nombreDb);
        
        // 2. Usamos la configuración fresca
        pool = new Pool({
            host: configuration.baseDatos.host,
            user: configuration.baseDatos.usuario,
            database: configuration.baseDatos.nombreDb,
            port: configuration.baseDatos.puerto,
            password: configuration.baseDatos.contrasena,
        });
    }
    return pool;
}

export async function ejecutarConsulta(
  consulta: string,
  parametros?: Array<number | string | null>
) {
  const poolConexion = getPool();
  
  // (Este log ya no es necesario o puedes modificarlo)
  // console.log('cons', getConfig()) 

  return await poolConexion.query(consulta, parametros);
}