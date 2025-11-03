import { IProyecto } from "../../dominio/IProyecto";

export interface ResultadoProyectos {
  data: IProyecto[];
  total: number;
  pagina: number;
  limite: number;
}