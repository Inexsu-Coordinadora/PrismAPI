import { IAsignacionConsultorProyecto } from "../../../dominio/servicios/IAsignacionConsultorProyecto";
import { IAsignacionConsultorProyectoRepositorio } from "../../../dominio/repositorio/servicios/IAsignacionConsultorProyectoRepositorio";
import { IConsultorRepositorio } from "../../../dominio/repositorio/entidades/IConsultorRepositorio";
import { IProyectoRepositorio } from "../../../dominio/repositorio/entidades/IProyectoRepositorio";
import { AsignacionConsultorProyectoDTO } from "../../../presentacion/esquemas/servicios/asignacionConsultorProyectoEsquema";


export class  AsignacionConsultorProyectoServicio{
constructor(
private asignacionesRepositorio: IAsignacionConsultorProyectoRepositorio,
private consultorRepositorio: IConsultorRepositorio,
private proyectoRepositorio: IProyectoRepositorio
){}

async asignarConsultorProyecto(datosAsignacion: AsignacionConsultorProyectoDTO){

    const { idConsultor, idProyecto, fechaInicioAsignacion, fechaFinAsignacion, porcentajeDedicacion, rolConsultor } = datosAsignacion;

    //validar si existe el consultor
    const consultor = await this.consultorRepositorio.obtenerConsultorPorId(idConsultor);
    if (!consultor){
        throw new Error ("El consultor no existe.");
    }

    //validar si existe proyecto
    const proyecto = await this.proyectoRepositorio.obtenerProyectoPorId(idProyecto);
    if(!proyecto){
        throw new Error("El proyecto no existe.");
    }

    //validar asignación duplicada
    const asignacionExistente = await this.asignacionesRepositorio.obtenerAsignacionExistente(
        idConsultor,
        idProyecto,
        rolConsultor ?? null
    );
    if (asignacionExistente){
        throw new Error ("Ya existe una asignación de este consultor a este proyecto.");
    }

    //validar fechas    
    if (fechaFinAsignacion && fechaFinAsignacion < fechaInicioAsignacion) {
        throw new Error("La fecha fin debe ser posterior o igual a la fecha de inicio.");
    }

    // validar dedicación total
    const dedicacion = porcentajeDedicacion ?? 0; // Si es null/undefined, usa 0
    const dedicacionConsultor = await this.asignacionesRepositorio.obtenerDedicacionConsultor(datosAsignacion.idConsultor, fechaInicioAsignacion, fechaFinAsignacion);

    if (dedicacionConsultor + dedicacion > 100) {
            throw new Error(`La dedicación total excede el 100%. Actualmente tiene ${dedicacionConsultor}% asignado.`);
        }

    //creamos la asignación después de validar
    return await this.asignacionesRepositorio.asignarConsultorProyecto(datosAsignacion);
}

async obtenerAsignacionPorId(idAsignacion:string): Promise<IAsignacionConsultorProyecto | null>{
    const asignacionObtenida = await this.asignacionesRepositorio.obtenerAsignacionPorId(idAsignacion);
    console.log(asignacionObtenida);
    return asignacionObtenida;
}

async obtenerAsignacionPorConsultor(idConsultor:string): Promise<IAsignacionConsultorProyecto[]>{
    const asignacionObtenidaConsultor = await this.asignacionesRepositorio.obtenerAsignacionPorConsultor(idConsultor);
    console.log(asignacionObtenidaConsultor);
    return asignacionObtenidaConsultor;
}

async obtenerAsignacionPorProyecto(idProyecto:string):Promise<IAsignacionConsultorProyecto[]>{
    const asignacionObtenidaProyecto = await this.asignacionesRepositorio.obtenerAsignacionPorProyecto(idProyecto);
    console.log(asignacionObtenidaProyecto);
    return asignacionObtenidaProyecto;
}

async obtenerAsignacionExistente(idConsultor:string, idProyecto:string, rolConsultor:string | null ):Promise<IAsignacionConsultorProyecto | null>{
    const asignacionExistente = await this.asignacionesRepositorio.obtenerAsignacionExistente(idConsultor, idProyecto, rolConsultor);
    console.log('Asignación existente:', asignacionExistente);
    return asignacionExistente;
}

async obtenerDedicacionExistente(idConsultor:string, fechaInicioAsignacion:Date, fechaFinAsignacion:Date |null):Promise<number>{
    const dedicacionExistente = await this.asignacionesRepositorio.obtenerDedicacionConsultor(idConsultor, fechaInicioAsignacion, fechaFinAsignacion);
    console.log(dedicacionExistente);
    return dedicacionExistente;
}

async actualizarAsignacion(idAsignacion:string, datosAsignacion: AsignacionConsultorProyectoDTO): Promise<IAsignacionConsultorProyecto>{
    const asignacionExistente = await this.asignacionesRepositorio.obtenerAsignacionPorId(idAsignacion);

    if(!asignacionExistente){
        throw new Error("Asignación no encontrada");;
    }

    const asignacionActualizada = await this.asignacionesRepositorio.actualizarAsignacion(idAsignacion, datosAsignacion);
    return asignacionActualizada;
}

async eliminarAsignacion(idAsignacion:string): Promise<void>{
    await this.asignacionesRepositorio.eliminarAsignacion(idAsignacion);
}
    
}