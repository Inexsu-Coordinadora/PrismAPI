import { ProyectoConConsultoresDTO } from "../../../presentacion/esquemas/servicios/consultaProyectoEsquema";
import {  ConsultarProyectosPorClienteRepositorio} from "../../../infraestructura/postgres/repositorios/servicios/ConsultaProyectoRepository";
import { IConsultaProyectosPorClienteServicio } from "../../interfaces/servicios/IConsultaProyectoServicio";
import { FiltrosConsultaProyectos } from "../../../presentacion/esquemas/servicios/consultaProyectoEsquema";
import { NotFoundError, ValidationError } from "../../../../common/errores/AppError"; 

export class ConsultarProyectosPorClienteServicio implements IConsultaProyectosPorClienteServicio {
  constructor(
    private readonly repositorio: ConsultarProyectosPorClienteRepositorio
  ) {}

  async consultarProyectosPorClienteServicio(
    idCliente: string,
    filtros?: FiltrosConsultaProyectos
  ): Promise<ProyectoConConsultoresDTO[]> {

    const clienteExiste = await this.repositorio.existeCliente(idCliente);

    if (!clienteExiste) {
     
      throw new NotFoundError("Cliente no encontrado");
    }

    if (
      filtros?.fechaInicioProyecto &&
      filtros?.fechaFinProyecto &&
      filtros.fechaInicioProyecto > filtros.fechaFinProyecto
    ) {
     
      throw new ValidationError(
        "El rango de fechas es inválido: la fecha de inicio no puede ser mayor que la fecha de fin"
      );
    }

    const proyectos = await this.repositorio.obtenerProyectosPorCliente(
      idCliente,
      filtros
    );

    return proyectos;
  }
}