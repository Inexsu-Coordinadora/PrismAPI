import { IConsultor} from "../IConsultor";
import { ConsultorDTO } from "../../presentacion/esquemas/consultorEsquema";

export interface IConsultorRepositorio {
    crearConsultor(datosConsultor: ConsultorDTO): Promise<IConsultor>;
    listarConsultores(limite?: number, pagina?: number): Promise<IConsultor[]>;
    obtenerConsultorPorId(idConsultor: string): Promise<IConsultor | null>;
    actualizarConsultor(idConsultor: string, datosConsultor: Partial<IConsultor>): Promise<IConsultor | null>;
    eliminarConsultor(idConsultor: string): Promise<void>;
}