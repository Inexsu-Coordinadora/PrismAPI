import { IAsignacionConsultorProyecto } from "../../../dominio/servicios/IAsignacionConsultorProyecto";
import { IAsignacionConsultorProyectoRepositorio } from "../../../dominio/repositorio/servicios/IAsignacionConsultorProyectoRepositorio";
import { AsignacionConsultorProyectoDTO } from "../../../presentacion/esquemas/servicios/asignacionConsultorProyectoEsquema";
import { GestionAsignacionConsultor } from "../../gestion-servicio/GestionAsignacionConsultor";
import { IAsignacionConsultorProyectoServicio } from "../../interfaces/servicios/IAsignacionConsultorProyectoServicio";


export class  AsignacionConsultorProyectoServicio implements IAsignacionConsultorProyectoServicio{
constructor(
private readonly asignacionesRepositorio: IAsignacionConsultorProyectoRepositorio,
private readonly validador: GestionAsignacionConsultor
){}

async asignarConsultorProyecto(datosAsignacion: AsignacionConsultorProyectoDTO){

    await this.validador.validarAsignacion(datosAsignacion);    

    //creamos la asignación después de validar
    const asignacion = await this.asignacionesRepositorio.asignarConsultorProyecto(datosAsignacion);
    return {
        mensaje: "Consultor asignado exitosamente al proyecto",
        asignacion
    };
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

async obtenerDedicacionConsultor(idConsultor:string, fechaInicioAsignacion:Date, fechaFinAsignacion:Date |null):Promise<number>{
    const dedicacionExistente = await this.asignacionesRepositorio.obtenerDedicacionConsultor(idConsultor, fechaInicioAsignacion, fechaFinAsignacion);
    console.log(dedicacionExistente);
    return dedicacionExistente;
}

async actualizarAsignacion(idAsignacion:string, datosAsignacion: AsignacionConsultorProyectoDTO): Promise<IAsignacionConsultorProyecto>{
    const asignacionExistente = await this.asignacionesRepositorio.obtenerAsignacionPorId(idAsignacion);

    if(!asignacionExistente){
        throw new Error("Asignación no encontrada");;
    }

    //usar el validador pasando el Id excluir
    await this.validador.validarAsignacion(datosAsignacion, idAsignacion);
    const asignacionActualizada = await this.asignacionesRepositorio.actualizarAsignacion(idAsignacion, datosAsignacion);
    return asignacionActualizada;
}

async eliminarAsignacion(idAsignacion:string): Promise<void>{
    await this.asignacionesRepositorio.eliminarAsignacion(idAsignacion);
}
    
}