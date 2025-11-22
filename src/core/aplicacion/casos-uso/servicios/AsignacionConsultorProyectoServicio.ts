import { IAsignacionConsultorProyecto } from "../../../dominio/servicios/IAsignacionConsultorProyecto";
import { IAsignacionConsultorProyectoRepositorio } from "../../../dominio/repositorio/servicios/IAsignacionConsultorProyectoRepositorio";
import { AsignacionConsultorProyectoDTO, ActualizarAsignacionConsultorProyectoEsquema, ActualizarAsignacionConsultorproyectoDTO } from "../../../presentacion/esquemas/servicios/asignacionConsultorProyectoEsquema";
import { GestionAsignacionConsultor } from "../../gestion-servicio/GestionAsignacionConsultor";
import { IAsignacionConsultorProyectoServicio } from "../../interfaces/servicios/IAsignacionConsultorProyectoServicio";
import { NotFoundError } from "../../../../common/errores/AppError";

import { NotFoundError } from "../../../../common/errores/AppError";


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
    
    return asignacionObtenida;
}

async obtenerAsignacionPorConsultor(idConsultor:string): Promise<IAsignacionConsultorProyecto[]>{
    const asignacionObtenidaConsultor = await this.asignacionesRepositorio.obtenerAsignacionPorConsultor(idConsultor);
    
    return asignacionObtenidaConsultor;
}

async obtenerAsignacionPorProyecto(idProyecto:string):Promise<IAsignacionConsultorProyecto[]>{
    const asignacionObtenidaProyecto = await this.asignacionesRepositorio.obtenerAsignacionPorProyecto(idProyecto);
    
    return asignacionObtenidaProyecto;
}

async obtenerAsignacionExistente(idConsultor:string, idProyecto:string, rolConsultor:string | null ):Promise<IAsignacionConsultorProyecto | null>{
    const asignacionExistente = await this.asignacionesRepositorio.obtenerAsignacionExistente(idConsultor, idProyecto, rolConsultor);
    
    return asignacionExistente;
}

async obtenerDedicacionConsultor(idConsultor:string, fechaInicioAsignacion:Date, fechaFinAsignacion:Date |null):Promise<number>{
    const dedicacionExistente = await this.asignacionesRepositorio.obtenerDedicacionConsultor(idConsultor, fechaInicioAsignacion, fechaFinAsignacion);

    return dedicacionExistente;
}

async actualizarAsignacion(idAsignacion:string, datosActualizacion: ActualizarAsignacionConsultorproyectoDTO): Promise<IAsignacionConsultorProyecto | null>{

    const asignacionExistente = await this.asignacionesRepositorio.obtenerAsignacionPorId(idAsignacion);

    if(!asignacionExistente){
        throw new NotFoundError ("Asignación no encontrada");
    }

    // const datosCompletosParaValidar: AsignacionConsultorProyectoDTO = {
    // idConsultor: (datosActualizacion.idConsultor ?? asignacionExistente.idConsultor) as string,
    // idProyecto: (datosActualizacion.idProyecto ?? asignacionExistente.idProyecto) as string,
    //     rolConsultor: datosActualizacion.rolConsultor !== undefined 
    //         ? datosActualizacion.rolConsultor 
    //         : asignacionExistente.rolConsultor,
    //     porcentajeDedicacion: datosActualizacion.porcentajeDedicacion !== undefined
    //         ? datosActualizacion.porcentajeDedicacion 
    //         : asignacionExistente.porcentajeDedicacion,
    //     fechaInicioAsignacion: datosActualizacion.fechaInicioAsignacion ?? asignacionExistente.fechaInicioAsignacion,
    //     fechaFinAsignacion: datosActualizacion.fechaFinAsignacion !== undefined
    //         ? datosActualizacion.fechaFinAsignacion 
    //         : asignacionExistente.fechaFinAsignacion,        
    // } as AsignacionConsultorProyectoDTO;
    const datosCompletosParaValidar = {
        ...asignacionExistente,
        ...datosActualizacion
    };

//     await this.validador.validarAsignacion(datosCompletosParaValidar, idAsignacion);

//     const asignacionActualizada = await this.asignacionesRepositorio.actualizarAsignacion(idAsignacion, datosActualizacion as Record<string, any>);
//     return asignacionActualizada;
// }
await this.validador.validarAsignacion(datosCompletosParaValidar as AsignacionConsultorProyectoDTO, idAsignacion);
    
    const asignacionActualizada = await this.asignacionesRepositorio.actualizarAsignacion(
        idAsignacion, 
        datosActualizacion as Partial<IAsignacionConsultorProyecto>
    );
    
    return asignacionActualizada;
}

async eliminarAsignacion(idAsignacion:string): Promise<void>{
    await this.asignacionesRepositorio.eliminarAsignacion(idAsignacion);
}
    
}

