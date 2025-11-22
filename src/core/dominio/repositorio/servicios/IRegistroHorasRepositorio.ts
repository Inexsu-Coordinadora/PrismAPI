// Interfaz con los metodos que la capa infraestructura debe implementar para interactuar con BD
// usa para registrar horas

import {IRegistroHoras} from "../../servicios/IRegistroHoras";

export interface IRegistroHorasRepositorio {

    crearParteHora(datosRegistroHoras: IRegistroHoras): Promise<IRegistroHoras>;
    
    listarPartesHoras(
        idConsultor: string, 
        idProyecto: string): 
        Promise<IRegistroHoras[]>;

    obtenerParteHoraPorId(idRegistroHoras: string): Promise<IRegistroHoras | null>;

    eliminarParteHora(idRegistroHoras: string): Promise<void>;
}   