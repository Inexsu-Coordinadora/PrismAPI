// Interfaz con los metodos que la capa infraestructura debe implementar para interactuar con BD
// usa para registrar horas

import {IRegistroHoras} from "../../servicios/IRegistroHoras";

export interface IRegistroHorasRepositorio {

    // Inserta un nuevo registro de horas en la base de datos
    // retorna el registro creado
    crearParteHora(datosRegistroHoras: IRegistroHoras): Promise<IRegistroHoras>;
    
    //Listar todos los registros de horas existentes
    listarPartesHoras(
        idConsultor: string, 
        idProyecto: string): 
        Promise<IRegistroHoras[]>;

    //Obtener un parte de horas por su ID
    obtenerParteHoraPorId(idRegistroHoras: string): Promise<IRegistroHoras | null>;

    //Eliminar un parte de horas por su ID
    eliminarParteHora(idRegistroHoras: string): Promise<void>;
}   