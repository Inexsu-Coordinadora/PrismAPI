import { ITarea } from "../../../dominio/entidades/ITarea";
import { IProyecto } from "../../../dominio/entidades/IProyecto";
import { IGestionTareasServicio } from "../../interfaces/servicios/IGestionTareasServicio";
import { CrearTareaServicioDTO, ActualizarTareaServicioDTO,} from "../../../presentacion/esquemas/servicios/gestionTareasEsquema";

//* Importamos los CONTRATOS de los REPOSITORIOS
import { ITareaRepositorio } from "../../../dominio/repositorio/entidades/ITareasRepositorio";
import { IProyectoRepositorio } from "../../../dominio/repositorio/entidades/IProyectoRepositorio";
import { IConsultorRepositorio } from "../../../dominio/repositorio/entidades/IConsultorRepositorio";
import { IAsignacionConsultorProyectoRepositorio } from "../../../dominio/repositorio/servicios/IAsignacionConsultorProyectoRepositorio";


//*Este es el "Cerebro" del S4. Implementa la lógica de negocio compleja que conecta Tareas, Proyectos y Consultores.
export class GestionTareasServicio implements IGestionTareasServicio{
    constructor(
        //* Inyección de Dependencias: Este servicio es un "coordinador". En su constructor, recibe las herramientas (repositorios) que necesita para trabajar.
        private readonly tareaRepositorio: ITareaRepositorio,
        private readonly proyectoRepositorio: IProyectoRepositorio,
        private readonly consultorRepositorio: IConsultorRepositorio,
        private readonly asignacionRepositorio: IAsignacionConsultorProyectoRepositorio,

    ) {} 

    //* ---------------------- MÉTODOS PÚBLICOS (El "Qué")  ----------------------// 

    async crearTareaEnProyecto(idProyecto: string, datosTarea: CrearTareaServicioDTO): Promise<string> {
        
        //* ---------------------- 1. Validaciones  ----------------------// 
        const proyecto = await this.validarProyecto(idProyecto);
        await this.validarConsultor(datosTarea.idConsultorAsignado);
        await this.validarReglasDeNegocio(datosTarea, proyecto);
        await this.validarConsultorEnProyecto(datosTarea.idConsultorAsignado, idProyecto);
        
        //* ---------------------- 2. Ejecución  ----------------------// 
        const datosParaCrear: ITarea = { ...datosTarea,  idProyecto: idProyecto,};
        const idNuevaTarea = await this.tareaRepositorio.crearTarea(datosParaCrear);
        return idNuevaTarea;
    }


    async obtenerTareasPorProyecto(idProyecto: string): Promise<ITarea[]> {
        await this.validarProyecto(idProyecto);
        return await this.tareaRepositorio.obtenerTareasPorProyecto(idProyecto);
    }


    async obtenerTareaDeProyectoPorId(idTarea: string, idProyecto: string): Promise<ITarea | null> {
        const tarea = await this.validarTareaEnProyecto(idTarea, idProyecto);
        return tarea;
    }


    async actualizarTareaEnProyecto(idTarea: string, idProyecto: string, datosTarea: ActualizarTareaServicioDTO): Promise<ITarea | null> {
        
        //* ---------------------- 1. Validaciones  ----------------------// 
        const tareaActual = await this.validarTareaEnProyecto(idTarea, idProyecto); //* 1°. Validar que la tarea/proyecto existen (reutilizamos helper S4)
        const proyecto = await this.validarProyecto(idProyecto); //* 2°. Obtener el proyecto existe (para validar fechas)
        await this.validarConsultor(datosTarea.idConsultorAsignado); //* 3° Validar consultor (si se está cambiando)
        await this.validarConsultorEnProyecto(datosTarea.idConsultorAsignado, idProyecto);

        
        //* 4° Validar fecha límite (si se está cambiando) (reutilizamos helper)
        if (datosTarea.fechaLimiteTarea) { 
            this.validarFechaLimite(datosTarea.fechaLimiteTarea, proyecto);
        }

        //* 5° Validación S4: No se puede completar una tarea ya completada
        if (datosTarea.estadoTarea === 'completada' && tareaActual.estadoTarea === 'completada') {
            throw new Error("La tarea ya se encuentra completada.");
        }

        //* 6° Si todo pasa, actualizamos la tarea
        const tareaActualizada = await this.tareaRepositorio.actualizarTarea(idTarea, datosTarea as Partial<ITarea>);
        return tareaActualizada;
    }


    async eliminarTareaDeProyecto(idTarea: string, idProyecto: string): Promise<void> {
        await this.validarTareaEnProyecto(idTarea, idProyecto);
        await this.tareaRepositorio.eliminarTarea(idTarea); 
    }

    //* ---------------------- HELPERS PRIVADOS (El "Cómo")  ----------------------// 

    //* HELPER 1: Valida que el proyecto exista y lo devuelve.
    private async validarProyecto(idProyecto: string): Promise<IProyecto> {
        const proyecto = await this.proyectoRepositorio.obtenerProyectoPorId(idProyecto);
        if (!proyecto) {
            throw new Error(`Proyecto no encontrado con ID: ${idProyecto}`);
        }
        return proyecto;
    }


    //* HELPER 2: Valida que el consultor exista (si se proporciona uno).
    private async validarConsultor(idConsultor?: string | null): Promise<void> {
        if (!idConsultor) {return;} //* Es opcional, si no viene, no se valida nada!
        
        const consultor = await this.consultorRepositorio.obtenerConsultorPorId(idConsultor);
        if (!consultor) {
            throw new Error(`Consultor asignado no encontrado con ID: ${idConsultor}`);
        }
    }

    //* HELPER 3:Valida las reglas de negocio (fechas, duplicados) antes de crear la tarea.
    private async validarReglasDeNegocio(datosTarea: CrearTareaServicioDTO, proyecto: IProyecto): Promise<void> {
        
        //* 1. Validar Fecha Límite
        this.validarFechaLimite(datosTarea.fechaLimiteTarea, proyecto);

        //* 2. Validar Duplicidad
        const tareaExistente = await this.tareaRepositorio.buscarPorTituloYProyecto(
            datosTarea.tituloTarea, 
            proyecto.idProyecto! //* Sabemos que idProyecto no es null aquí
        );
        if (tareaExistente) {
            throw new Error(`Ya existe una tarea con el título '${datosTarea.tituloTarea}' en este proyecto.`);
        }
    }

    //* HELPER 4: Validar Fecha Límite
        private validarFechaLimite(fechaLimiteTarea: Date | null, proyecto: IProyecto) {
        if (!fechaLimiteTarea) {return; }//* Si no hay fecha límite, no se valida nada!
        if (proyecto.fechaInicioProyecto && fechaLimiteTarea < proyecto.fechaInicioProyecto) { 
            throw new Error(`La fecha límite (${fechaLimiteTarea.toISOString().split('T')[0]}) no puede ser anterior a la fecha de inicio del proyecto (${proyecto.fechaInicioProyecto.toISOString().split('T')[0]}).`);
        }
        if (proyecto.fechaFinProyecto && fechaLimiteTarea > proyecto.fechaFinProyecto) { 
            throw new Error(`La fecha límite (${fechaLimiteTarea.toISOString().split('T')[0]}) no puede ser posterior a la fecha de fin del proyecto (${proyecto.fechaFinProyecto.toISOString().split('T')[0]}).`);
        }
        }

    //* HELPER 5: Valida que una Tarea exista Y pertenezca a un Proyecto.
    private async validarTareaEnProyecto(idTarea: string, idProyecto: string): Promise<ITarea> {
        const tarea = await this.tareaRepositorio.obtenerTareaDeProyectoPorId(idTarea, idProyecto);
        if (!tarea) {
            //* Este error se reutiliza en GET, PUT y DELETE
            throw new Error(`Tarea no encontrada con ID: ${idTarea} en el proyecto: ${idProyecto}`);
        }
        return tarea;
    }

    //* HELPER 6: Valida que un consultor esté asignado a un Proyecto.
    private async validarConsultorEnProyecto(idConsultorAsignado: string | null | undefined,idProyecto: string): Promise<void> {
        if(idConsultorAsignado){
            const asignacion = await this.asignacionRepositorio.obtenerAsignacionExistente(idConsultorAsignado, idProyecto, null);
        if (!asignacion){
                throw new Error (`El consultor ${idConsultorAsignado} no está asignado a este proyecto.`);
            } 
        }
    }

}