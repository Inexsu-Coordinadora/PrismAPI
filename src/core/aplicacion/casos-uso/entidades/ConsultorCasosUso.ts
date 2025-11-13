import { IConsultor } from "../../../dominio/entidades/IConsultor";
import { IConsultorRepositorio} from "../../../dominio/repositorio/entidades/IConsultorRepositorio";
import { ConsultorDTO, ActualizarConsultorDTO } from "../../../presentacion/esquemas/entidades/consultorEsquema";
import { IConsultorCasosUso} from "../../interfaces/entidades/IConsultorCasosUso";

export class ConsultorCasosUso implements IConsultorCasosUso {
    constructor(private consultorRepositorio: IConsultorRepositorio) {}    // Inyección de dependencia

    async obtenerConsultores(limite?: number): Promise<IConsultor[]> {
        return await this.consultorRepositorio.listarConsultores(limite);
    }

    async obtenerConsultorPorId(idConsultor: string): Promise<IConsultor | null> {
        return this.consultorRepositorio.obtenerConsultorPorId(idConsultor);
    }
 
    async crearConsultor(datosConsultor: ConsultorDTO): Promise<IConsultor> {
        const idNuevoConsultor = await this.consultorRepositorio.crearConsultor(datosConsultor);
        return idNuevoConsultor;
    }

    async actualizarConsultor(idConsultor: string, consultor: ActualizarConsultorDTO): Promise<IConsultor | null> {
        const consultorActualizado = await this.consultorRepositorio.actualizarConsultor(idConsultor, consultor as Partial<IConsultor>);
        return consultorActualizado;
    }

    async eliminarConsultor(idConsultor: string): Promise<void> {
        return await this.consultorRepositorio.eliminarConsultor(idConsultor);
    }
}