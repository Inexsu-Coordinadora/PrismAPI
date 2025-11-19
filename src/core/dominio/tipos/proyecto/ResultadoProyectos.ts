import { IProyecto } from "../../entidades/IProyecto";

export interface ResultadoProyectos {
  data: IProyecto[];
  total: number;
  pagina: number;
  limite: number;
}