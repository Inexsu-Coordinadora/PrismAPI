import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { IRegistroHorasServicio } from "../../../aplicacion/interfaces/servicios/IRegistroHorasServicio";
import {CrearRegistroHorasEsquema,RegistroHorasDTO,} from "../../esquemas/servicios/registroHorasEsquema";
import { IRegistroHoras } from "../../../dominio/servicios/IRegistroHoras";

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
    try {
      const { idConsultor, idProyecto } = request.query;

      const registros = await this.registroHorasServicio.listarRegistrosHoras(
        idConsultor,
        idProyecto
      );

      return reply.code(200).send({
        mensaje: "Registros de horas encontrados correctamente",
        registros,
        totalRegistros: registros.length,
      });
    } catch (error) {
      return reply.code(500).send({
        mensaje: "Error al listar los registros de horas",
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  //--------------------------------- METODO GET BY ID ---------------------------------//
  obtenerRegistroHoraPorId = async (
    request: FastifyRequest<{ Params: { idRegistro: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { idRegistro } = request.params;

      const registro = await this.registroHorasServicio.obtenerRegistroHorasPorId(
        idRegistro
      );

      if (!registro) {
        return reply.code(404).send({
          mensaje: "Registro de horas no encontrado",
        });
      }

      return reply.code(200).send({
        mensaje: "Registro de horas encontrado correctamente",
        registro,
      });
    } catch (error) {
      return reply.code(500).send({
        mensaje: "Error al obtener el registro de horas",
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  //--------------------------------- METODO POST ---------------------------------//
  crearRegistroHoras = async (
    request: FastifyRequest<{ Body: RegistroHorasDTO }>,
    reply: FastifyReply
  ) => {
    try {
      
      const datosValidados = CrearRegistroHorasEsquema.parse(request.body);

      const datosParaServicio: IRegistroHoras = {
        idRegistroHoras: undefined, // lo genera la BD
        idConsultor: datosValidados.id_consultor,
        idProyecto: datosValidados.id_proyecto,
        fechaRegistro: datosValidados.fecha_registro,       // ya es Date
        horasTrabajadas: datosValidados.horas_trabajadas,   // ya es number
        descripcionActividad: datosValidados.descripcion_actividad.trim(),
      };

      const registroCreado =
        await this.registroHorasServicio.crearRegistroHoras(datosParaServicio);

      return reply.code(201).send({
        mensaje: "El registro de horas se creó correctamente",
        registro: registroCreado,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.code(400).send({
          mensaje: "Error en los datos para registrar horas",
          error: error.issues[0]?.message || "Error de validación",
        });
      }

      return reply.code(500).send({
        mensaje: "Error al crear el registro de horas",
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  //--------------------------------- METODO DELETE ---------------------------------//
  eliminarRegistroHoras = async (
    request: FastifyRequest<{ Params: { idRegistro: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { idRegistro } = request.params;

      await this.registroHorasServicio.eliminarRegistroHoras(idRegistro);

      return reply.code(200).send({
        mensaje: "Registro de horas eliminado correctamente",
      });
    } catch (error) {
      return reply.code(500).send({
        mensaje: "Error al eliminar el registro de horas",
        error: error instanceof Error ? error.message : error,
      });
    }
  };
}
