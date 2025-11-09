import { ITarea } from "../../../dominio/entidades/ITarea";
import { IProyecto } from "../../../dominio/entidades/IProyecto";
import { IGestionTareasServicio } from "../../interfaces/servicios/IGestionTareasServicio";
import { CrearTareaServicioDTO, ActualizarTareaServicioDTO,} from "../../../presentacion/esquemas/servicios/gestionTareasEsquema";

//* Importamos los CONTRATOS de los REPOSITORIOS
import { ITareaRepositorio } from "../../../dominio/repositorio/entidades/ITareasRepositorio";
import { IProyectoRepositorio } from "../../../dominio/repositorio/entidades/IProyectoRepositorio";
import { IConsultorRepositorio } from "../../../dominio/repositorio/entidades/IConsultorRepositorio";
//TODO: import { IAsignacionRepositorio } from "../../dominio/repositorio/IAsignacionRepositorio";

//*Este es el "Cerebro" del S4. Implementa la lógica de negocio compleja que conecta Tareas, Proyectos y Consultores.
export class GestionTareasServicio implements IGestionTareasServicio{
    constructor(
        //* Inyección de Dependencias: Este servicio es un "coordinador". En su constructor, recibe las herramientas (repositorios) que necesita para trabajar.
        private readonly tareaRepositorio: ITareaRepositorio,
        private readonly proyectoRepositorio: IProyectoRepositorio,
        private readonly consultorRepositorio: IConsultorRepositorio,
        // TODO: private asignacionRepositorio: IAsignacionRepositorio 
    ) {

    } 
    async crearTareaEnProyecto(idProyecto: string, datosTarea: CrearTareaServicioDTO): Promise<string> {
        
        //* --------- 1. Validación: Proyecto existe ---------// 

        const proyecto = await this.proyectoRepositorio.obtenerProyectoPorId(idProyecto);
        if (!proyecto) {
            throw new Error(`Proyecto no encontrado con ID: ${idProyecto}`);
        }

        //* --------- 2. Validación: Consultor existe (si se asigna) ---------//
        if (datosTarea.idConsultorAsignado) {
            const consultorExiste = await this.consultorRepositorio.obtenerConsultorPorId(datosTarea.idConsultorAsignado);
            if (!consultorExiste) {
                throw new Error(`Consultor no encontrado con ID: ${datosTarea.idConsultorAsignado}`);
            }
        

                //* --------- 2.1. Validación: Consultor asignado al proyecto (S1) ---------//
                //TODO: Esta  la validación depende del Servicio 1
                // const asignacion = await this.asignacionRepositorio.obtenerAsignacion(idProyecto,datosTarea.idConsultorAsignado);
                    // if (!asignacion) {
                    //    throw new Error(`El consultor no está asignado a este proyecto.`);
                    // }
        }

        //* --------- 3. Validación: Fecha límite coherente ---------//
        //* Extraemos esta lógica a un método privado(Helper) para mantener la limpieza.
        this.validarFechaLimite(datosTarea.fechaLimiteTarea, proyecto);

        //* --------- 4. Validación: Duplicidad de Tarea (Nombre) ---------//
        const tareaExistente = await this.tareaRepositorio.buscarPorTituloYProyecto(
            datosTarea.tituloTarea, 
            idProyecto
        );
        if (tareaExistente) {
            throw new Error(`Ya existe una tarea con el título '${datosTarea.tituloTarea}' en este proyecto.`);
        } 
        
        throw new Error("Method not implemented.");
    }
    
    async obtenerTareasPorProyecto(idProyecto: string): Promise<ITarea[]> {
        throw new Error("Method not implemented.");
    }
    async obtenerTareaDeProyectoPorId(idTarea: string, idProyecto: string): Promise<ITarea | null> {
        throw new Error("Method not implemented.");
    }
    async actualizarTareaEnProyecto(idTarea: string, idProyecto: string, datosTarea: ActualizarTareaServicioDTO): Promise<ITarea | null> {
        throw new Error("Method not implemented.");
    }
    async eliminarTareaDeProyecto(idTarea: string, idProyecto: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    //* --------- Métodos Privados (Helpers)---------//

        private validarFechaLimite(fechaLimiteTarea: Date | null, proyecto: IProyecto) {
            // Si no hay fecha límite, no hay nada que validar
        if (!fechaLimiteTarea) {
            return;
        }

        //
        if (proyecto.fechaInicio && fechaLimiteTarea < proyecto.fechaInicio) { //TODO cambiar .fechaInicio por .fechaInicioProyecto 
            throw new Error(`La fecha límite (${fechaLimiteTarea.toISOString().split('T')[0]}) no puede ser anterior a la fecha de inicio del proyecto (${proyecto.fechaInicio.toISOString().split('T')[0]}).`);
        }
        
        //
        if (proyecto.fechaFin && fechaLimiteTarea > proyecto.fechaFin) { //TODO cambiar .fechaFin por .fechaFinProyecto
            throw new Error(`La fecha límite (${fechaLimiteTarea.toISOString().split('T')[0]}) no puede ser posterior a la fecha de fin del proyecto (${proyecto.fechaFin.toISOString().split('T')[0]}).`);
        }
        }

}

    
