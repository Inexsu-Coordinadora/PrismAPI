import { IConsultorRepositorio } from "../../dominio/repositorio/entidades/IConsultorRepositorio";
import { IProyectoRepositorio } from "../../dominio/repositorio/entidades/IProyectoRepositorio";
import { IAsignacionConsultorProyectoRepositorio } from "../../dominio/repositorio/servicios/IAsignacionConsultorProyectoRepositorio";
import { AsignacionConsultorProyectoDTO } from "../../presentacion/esquemas/servicios/asignacionConsultorProyectoEsquema";
import { IProyecto } from "../../dominio/entidades/IProyecto";

export class GestionAsignacionConsultor {

    constructor(
        private readonly consultorRepo: IConsultorRepositorio,
        private readonly proyectoRepo : IProyectoRepositorio,
        private readonly asignacionRepo: IAsignacionConsultorProyectoRepositorio,        
    ){}


    //MÉTODO PÚBLICO

    async validarAsignacion(datosAsignacion: AsignacionConsultorProyectoDTO, idAsignacionExcluir?:string): Promise<void>{
        await this.validarExistenciaConsultor(datosAsignacion.idConsultor);
        const proyecto =  await this.validarExistenciaProyecto(datosAsignacion.idProyecto);
        await this.validarDuplicidad(datosAsignacion, idAsignacionExcluir);
        this.validarFechas(datosAsignacion.fechaInicioAsignacion, datosAsignacion.fechaFinAsignacion);
        this.validarEstadoYFechas(datosAsignacion, proyecto);
        this.validarFechasDentroProyecto(datosAsignacion, proyecto);
        await this.validarDedicacion(datosAsignacion);
    }

    // MÉTODOS PRIVADOS (validaciones específicas)
    private async validarExistenciaConsultor(idConsultor:string):Promise<void>{
        const consultor = await this.consultorRepo.obtenerConsultorPorId(idConsultor);
        if (!consultor){
        throw new Error (`El consultor con idConsultor: ${idConsultor} no existe.`);
    }
    }

    private async validarExistenciaProyecto(idProyecto:string):Promise<IProyecto>{
        const proyecto = await this.proyectoRepo.obtenerProyectoPorId(idProyecto);
        if(!proyecto){
        throw new Error(`El proyecto con idProyecto: ${idProyecto} no existe.`);
    }
        return proyecto;
    }

    private async validarDuplicidad (datosAsignacion: AsignacionConsultorProyectoDTO, idAsignacionExcluir?:string){
        const asignacionExistente = await this.asignacionRepo.obtenerAsignacionExistente(
            datosAsignacion.idConsultor,
            datosAsignacion.idProyecto,
            datosAsignacion.rolConsultor ?? null
        );
        //Excluir asignación actual si se proporciona
        if (asignacionExistente){
            //si se está excluyendo una asignación y es la misma, permitir
            if(idAsignacionExcluir && asignacionExistente.idAsignacion === idAsignacionExcluir){
                return; // es la misma que se está editando, está permitido
            }
            throw new Error ("Ya existe una asignación de este consultor a este proyecto.");
        }
    }

    private validarFechas(fechaInicioAsignacion: Date, fechaFinAsignacion: Date | null ):void{
        if (fechaFinAsignacion && fechaFinAsignacion < fechaInicioAsignacion) {
        throw new Error("La fecha fin debe ser posterior o igual a la fecha de inicio.");
    }
    }

    private validarEstadoYFechas(datosAsignacion: AsignacionConsultorProyectoDTO, proyecto:IProyecto):void {
        

        //Rechazar proyectos finalizados
        if(proyecto.estadoProyecto === 'finalizado'){
            throw new Error("No se puede asignar consultores a un proyecto finalizado");
        }

        //Para proyectos activos, validar fechas
        if(proyecto.estadoProyecto === 'activo'){
            this.validarFechasDentroProyecto(datosAsignacion, proyecto);
        }

        //Para pendientes se asigna libremente
    }

    private validarFechasDentroProyecto(datosAsignacion: AsignacionConsultorProyectoDTO, proyecto: IProyecto): void{
        const {fechaInicioAsignacion, fechaFinAsignacion} = datosAsignacion;
        const {fechaInicioProyecto, fechaFinProyecto, nombreProyecto} = proyecto;

        if (!fechaInicioProyecto) {
        throw new Error("El proyecto no tiene fecha de inicio definida");
    }

        if (fechaInicioAsignacion < fechaInicioProyecto){
            throw new Error("La fecha de inicio de asignación no puede ser anterior a la fecha de inicio del proyecto");
        }
        if (fechaFinProyecto && fechaFinAsignacion && fechaFinAsignacion>fechaFinProyecto){
            throw new Error("La fecha de fin de la asignación, no puede ser posterior a la fecha de finalización del proyecto ");
        }
    }

    
    private async validarDedicacion(datosAsignacion: AsignacionConsultorProyectoDTO){
        const dedicacionConsultor = await this.asignacionRepo.obtenerDedicacionConsultor(
            datosAsignacion.idConsultor,
            datosAsignacion.fechaInicioAsignacion,
            datosAsignacion.fechaFinAsignacion,        
            
        );

    

        const totalDedicacion = dedicacionConsultor + (datosAsignacion.porcentajeDedicacion ?? 0);
        if (totalDedicacion > 100) {
            throw new Error(`La dedicación total excede el 100%. Actualmente tiene ${dedicacionConsultor}% asignado.` + `Nueva: ${datosAsignacion.porcentajeDedicacion}%, Total: ${totalDedicacion}`);
            
        }
    }
}

    

