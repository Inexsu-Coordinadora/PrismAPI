import { IConsultor} from "../../entidades/IConsultor";

export interface IConsultorRepositorio {
    crearConsultor(datosConsultor: IConsultor): Promise<IConsultor>;
    listarConsultores(limite?: number, pagina?: number): Promise<IConsultor[]>;
    obtenerConsultorPorId(idConsultor: string): Promise<IConsultor | null>;
    actualizarConsultor(idConsultor: string, datosConsultor: Partial<IConsultor>): Promise<IConsultor | null>;
    eliminarConsultor(idConsultor: string): Promise<void>;
}