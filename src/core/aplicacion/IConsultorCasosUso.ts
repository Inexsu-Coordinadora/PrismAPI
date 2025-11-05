import { IConsultor} from "../dominio/IConsultor";
import { ConsultorDTO, ActualizarConsultorDTO} from "../presentacion/esquemas/consultorEsquema";

export interface IConsultorCasosUso {
    obtenerConsultores(limite?: number): Promise<IConsultor[]>;
    obtenerConsultorPorId(idConsultor: string): Promise<IConsultor | null>;
    crearConsultor(consultor: ConsultorDTO): Promise<IConsultor>;
    actualizarConsultor(idConsultor: string, consultor: ActualizarConsultorDTO): Promise<IConsultor | null>;
    eliminarConsultor(idConsultor: string): Promise<void>;
}