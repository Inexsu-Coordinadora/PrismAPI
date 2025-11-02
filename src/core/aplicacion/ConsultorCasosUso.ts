import { Pool } from "pg";
import { IConsultor } from "../dominio/IConsultor";
import { IConsultorRepositorio} from "../dominio/repositorio/IConsultorRepositorio";

export class ConsultorCasosUso {
    constructor(private consultorRepositorio: IConsultorRepositorio) {}

    async obtenerConsultores(limite?: number): Promise<IConsultor[]> {
        return await this.consultorRepositorio.listarConsultores(limite);
    }

    async obtenerConsultorPorId(idConsultor: string): Promise<IConsultor | null> {
        const consultorObtenido = await this.consultorRepositorio.obtenerConsultorPorId(idConsultor);
        return consultorObtenido;
    }
 
    async crearConsultor(datosConsultor: IConsultor, conexion: Pool): Promise<IConsultor> {
        const idNuevoConsultor = await this.consultorRepositorio.crearConsultor(datosConsultor, conexion);
        return idNuevoConsultor;
    }

    async actualizarConsultor(idConsultor: string, datosConsultor: Partial<IConsultor>): Promise<IConsultor | null> {
        const consultorActualizado = await this.consultorRepositorio.actualizarConsultor(idConsultor, datosConsultor);
        return consultorActualizado;
    }

    async eliminarConsultor(idConsultor: string): Promise<void> {
        return await this.consultorRepositorio.eliminarConsultor(idConsultor);
    }
}