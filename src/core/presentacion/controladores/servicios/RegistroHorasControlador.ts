//usa Zod para validar y mapear a camelCase
import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";

// interfaz de la capa de aplicación (qué puede hacer el servicio)
import { IRegistroHorasServicio } from "../../../aplicacion/interfaces/servicios/IRegistroHorasServicio";

// esquema + DTO (validación de entrada con Zod)
import {
  CrearRegistroHorasEsquema,
  RegistroHorasDTO,
} from "../../esquemas/servicios/registroHorasEsquema";

/**
 * Controlador para el servicio de Registro y control de horas.
 * Aquí validamos la forma de los datos de entrada (Zod) y mapeamos nombres
 * snake_case -> camelCase para la capa de aplicación.
 *
 * OjO:
 * - fecha_registro ya llega como Date gracias al esquema Zod (transform)
 * - horas_trabajadas llega como number (parseado y redondeado en el esquema)
 */
export class RegistroHorasControlador {
  constructor(private registroHorasServicio: IRegistroHorasServicio) {}

  //--------------------------------- METODO GET ---------------------------------//
  /**
   * Lista los registros de horas.
   * Permite filtrar por id_consultor y/o id_proyecto vía query params:
   */
  listarRegistrosHoras = async (
    request: FastifyRequest<{
      Querystring: { id_consultor?: string; id_proyecto?: string };
    }>,
    reply: FastifyReply
  ) => {
    try {
      const { id_consultor, id_proyecto } = request.query;

      const registros = await this.registroHorasServicio.listarRegistrosHoras(
        id_consultor,
        id_proyecto
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
  /**
   * Obtiene un registro de horas por su identificador.
   */
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
  /**
   * Crea un nuevo registro de horas.
   */
  crearRegistroHoras = async (
    request: FastifyRequest<{ Body: RegistroHorasDTO }>,
    reply: FastifyReply
  ) => {
    try {
      // 1) Validamos la entrada con Zod (usa snake_case tal como viene del cliente)
      const datosValidados = CrearRegistroHorasEsquema.parse(request.body);

      // 2) Mapeamos a camelCase para la capa de aplicación
      const datosParaServicio = {
        idConsultor: datosValidados.id_consultor,
        idProyecto: datosValidados.id_proyecto,
        fechaRegistro: datosValidados.fecha_registro,       //  ya es Date
        horasTrabajadas: datosValidados.horas_trabajadas,   // ya es number
        descripcionActividad: datosValidados.descripcion_actividad.trim(),
      };

      // 3) Llamamos al servicio de aplicación (reglas de negocio)
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
  /**
   * Elimina un registro de horas por id.
   */
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
