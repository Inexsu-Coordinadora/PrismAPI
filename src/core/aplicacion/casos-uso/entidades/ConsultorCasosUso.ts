import { IConsultor } from "../../../dominio/entidades/IConsultor";
import { IConsultorRepositorio} from "../../../dominio/repositorio/entidades/IConsultorRepositorio";
import { ConsultorDTO, ActualizarConsultorDTO } from "../../../presentacion/esquemas/entidades/consultorEsquema";
import { IConsultorCasosUso } from "../../interfaces/entidades/IConsultorCasosUso";

export class ConsultorCasosUso implements IConsultorCasosUso {
    constructor(private consultorRepositorio: IConsultorRepositorio) {}  

    async obtenerConsultores(limite?: number): Promise<IConsultor[]> {
        return await this.consultorRepositorio.listarConsultores(limite);
    }

    async obtenerConsultorPorId(idConsultor: string): Promise<IConsultor | null> {
        return this.consultorRepositorio.obtenerConsultorPorId(idConsultor);
    }
    
    /**Convertimos el DTO (request de la API) al modelo de dominio.
     * Decisión de diseño:
     * - La capa de aplicación es la responsable de traducir formatos externos a los modelos internos del dominio.
     */
    async crearConsultor(datosConsultor: ConsultorDTO): Promise<IConsultor> {
        const datosDominio: IConsultor = {
            nombreConsultor: datosConsultor.nombreConsultor,
            especialidadConsultor: datosConsultor.especialidadConsultor,
            disponibilidadConsultor: datosConsultor.disponibilidadConsultor,
            emailConsultor: datosConsultor.emailConsultor,
            telefonoConsultor: datosConsultor.telefonoConsultor ?? null,
        };
        const consultorCreado =  await this.consultorRepositorio.crearConsultor(datosDominio);
        return consultorCreado;
    }

    async actualizarConsultor(idConsultor: string, consultor: ActualizarConsultorDTO): Promise<IConsultor | null> {
        const datosDominio: Partial<IConsultor> = {};

        if (consultor.nombreConsultor !== undefined)
            datosDominio.nombreConsultor = consultor.nombreConsultor;

        if (consultor.especialidadConsultor !== undefined)
            datosDominio.especialidadConsultor = consultor.especialidadConsultor;

        if (consultor.disponibilidadConsultor !== undefined)
            datosDominio.disponibilidadConsultor = consultor.disponibilidadConsultor;

        if (consultor.emailConsultor !== undefined)
            datosDominio.emailConsultor = consultor.emailConsultor;

        if (consultor.telefonoConsultor !== undefined)
            datosDominio.telefonoConsultor = consultor.telefonoConsultor;

        const consultorActualizado = await this.consultorRepositorio.actualizarConsultor(idConsultor, datosDominio);
        return consultorActualizado;
    }

    async eliminarConsultor(idConsultor: string): Promise<void> {
        return await this.consultorRepositorio.eliminarConsultor(idConsultor);
    }
}