import { ProyectoConConsultoresDTO } from "../../../presentacion/esquemas/servicios/consultaProyectoEsquema";
// import { FiltrosConsultaProyectos } from "../../../infraestructura/postgres/repositorios/servicios/ConsultaProyectoRepository";
import { FiltrosConsultaProyectos } from "../../../presentacion/esquemas/servicios/consultaProyectoEsquema";

export interface IConsultaProyectosPorClienteServicio {

  consultarProyectosPorClienteServicio(
    idCliente: string,
    filtros?: FiltrosConsultaProyectos
  ): Promise<ProyectoConConsultoresDTO[]>;
}