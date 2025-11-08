import { IProyecto } from "../../dominio/entidades/IProyecto";

export interface ResultadoProyectos {
  data: IProyecto[];
  total: number;
  pagina: number;
  limite: number;
}