import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { IRegistroHorasServicio } from "../../../aplicacion/interfaces/servicios/IRegistroHorasServicio";
import {CrearRegistroHorasEsquema,RegistroHorasDTO,} from "../../esquemas/servicios/registroHorasEsquema";
import { IRegistroHoras } from "../../../dominio/servicios/IRegistroHoras";
import { HttpStatus } from "../../../../common/errores/statusCode";

/** Controlador para el servicio de Registro y control de horas.*/
export class RegistroHorasControlador {
  constructor(private registroHorasServicio: IRegistroHorasServicio) {}

  //--------------------------------- METODO GET ---------------------------------//
  listarRegistrosHoras = async (
    request: FastifyRequest<{
      Querystring: { idConsultor?: string; idProyecto?: string }
    }>,
    reply: FastifyReply
  ) => {
      const { idConsultor, idProyecto } = request.query;

      const registros = await this.registroHorasServicio.listarRegistrosHoras(
        idConsultor,
        idProyecto
      );

      return reply.code(HttpStatus.EXITO).send({
        mensaje: "Registros de horas encontrados correctamente",
        registros,
        totalRegistros: registros.length,
      });
  };

  //--------------------------------- METODO GET BY ID ---------------------------------//
  obtenerRegistroHoraPorId = async (
    request: FastifyRequest<{ Params: { idRegistro: string } }>,
    reply: FastifyReply
  ) => {
      const { idRegistro } = request.params;

      const registro = await this.registroHorasServicio.obtenerRegistroHorasPorId(
        idRegistro
      );

      if (!registro) {
        return reply.code(HttpStatus.NO_ENCONTRADO).send({
          mensaje: "Registro de horas no encontrado",
        });
      }

      return reply.code(HttpStatus.EXITO).send({
        mensaje: "Registro de horas encontrado correctamente",
        registro,
      });
  };

  //--------------------------------- METODO POST ---------------------------------//
  crearRegistroHoras = async (
    request: FastifyRequest<{ Body: RegistroHorasDTO }>,
    reply: FastifyReply
  ) => {
      const datosValidados = CrearRegistroHorasEsquema.parse(request.body);

      const datosParaServicio: IRegistroHoras = {
        idRegistroHoras: undefined, 
        idConsultor: datosValidados.id_consultor,
        idProyecto: datosValidados.id_proyecto,
        fechaRegistro: datosValidados.fecha_registro,     
        horasTrabajadas: datosValidados.horas_trabajadas,  
        descripcionActividad: datosValidados.descripcion_actividad.trim(),
      };

      const registroCreado =
        await this.registroHorasServicio.crearRegistroHoras(datosParaServicio);

      return reply.code(HttpStatus.CREADO).send({
        mensaje: "El registro de horas se creó correctamente",
        registro: registroCreado,
      });
    };

  //--------------------------------- METODO DELETE ---------------------------------//
  eliminarRegistroHoras = async (
    request: FastifyRequest<{ Params: { idRegistro: string } }>,
    reply: FastifyReply
  ) => {
      const { idRegistro } = request.params;

      await this.registroHorasServicio.eliminarRegistroHoras(idRegistro);

      return reply.code(HttpStatus.EXITO).send({
        mensaje: "Registro de horas eliminado correctamente",
      });
  };
}
