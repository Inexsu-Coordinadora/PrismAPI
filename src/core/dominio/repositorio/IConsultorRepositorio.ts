import { IConsultor} from "../IConsultor";
import {Pool} from "pg";

export interface IConsultorRepositorio {
    crearConsultor(datosConsultor: IConsultor, conexion: Pool): Promise<IConsultor>;
    listarConsultores(limite?: number, pagina?: number): Promise<IConsultor[]>;
    obtenerConsultorPorId(idConsultor: string): Promise<IConsultor | null>;
    actualizarConsultor(idConsultor: string, datosConsultor: Partial<IConsultor>): Promise<IConsultor | null>;
    eliminarConsultor(id: string): Promise<void>;
}