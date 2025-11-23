/**
 * Pruebas de INTEGRACIÓN de la API de Registro de Horas.
 *
 * Capas que se prueban juntas:
 * - Fastify (app real, sin app global)
 * - Enrutador (registroHorasEnrutador)
 * - Controlador (RegistroHorasControlador)
 * - Servicio (MOCK de RegistroHorasServicio con lógica en memoria)
 */

import Fastify, { FastifyInstance } from "fastify";
import request from "supertest";
import { AppError, ConflictError, NotFoundError, ValidationError} from "../../../src/common/errores/AppError";
import { describe, beforeAll, afterAll, beforeEach, test, expect, jest } from "@jest/globals";
import { IRegistroHoras } from "../../../src/core/dominio/servicios/IRegistroHoras";
import { construirRegistroHorasEnrutador } from "../../../src/core/presentacion/rutas/servicios/registroHorasEnrutador";

let registrosMemoria: IRegistroHoras[] = [
  {
    idRegistroHoras: "r1",
    idProyecto: "p1",
    idConsultor: "c1",
    fechaRegistro: new Date("2025-01-10"),
    horasTrabajadas: 8,
    descripcionActividad: "Automatización inicial",
  },
  {
    idRegistroHoras: "r2",
    idProyecto: "p2",
    idConsultor: "c2",
    fechaRegistro: new Date("2025-01-11"),
    horasTrabajadas: 4,
    descripcionActividad: "Soporte",
  },
];

jest.mock(
  "../../../src/core/presentacion/esquemas/servicios/registroHorasEsquema",
  () => {
    return {
      CrearRegistroHorasEsquema: {
        parse: (body: any) => body,
      },

      RegistroHorasDTO: {} as any,
    };
  }
);

jest.mock(
  "../../../src/core/aplicacion/casos-uso/servicios/RegistroHorasServicio",
  () => {
    class RegistroHorasServicioMock {
      async listarRegistrosHoras(
        idConsultor?: string,
        idProyecto?: string
      ): Promise<IRegistroHoras[]> {

        if (idConsultor === "error-validacion") {
          throw new ValidationError("Filtros inválidos para listar registros");
        }
        return registrosMemoria.filter((r) => {
          if (idConsultor && r.idConsultor !== idConsultor) return false;
          if (idProyecto && r.idProyecto !== idProyecto) return false;
          return true;
        });
      }

      async obtenerRegistroHorasPorId(
        idRegistro: string
      ): Promise<IRegistroHoras | null> {
        if (idRegistro === "lanzar-notfound") {
          throw new NotFoundError("Registro no encontrado (AppError)");
        }
        return (
          registrosMemoria.find((r) => r.idRegistroHoras === idRegistro) ??
          null
        );
      }

      async crearRegistroHoras(
        datos: IRegistroHoras
      ): Promise<IRegistroHoras> {
        if (datos.descripcionActividad === "DUPLICADO") {
          throw new ConflictError("Ya existe un registro con esos datos");
        }

        const nuevo: IRegistroHoras = {
          ...datos,
          idRegistroHoras: "r-nuevo",
        };
        registrosMemoria.push(nuevo);
        return nuevo;
      }

      async eliminarRegistroHoras(idRegistro: string): Promise<void> {
        registrosMemoria = registrosMemoria.filter(
          (r) => r.idRegistroHoras !== idRegistro
        );
      }
    }

    return { RegistroHorasServicio: RegistroHorasServicioMock };
  }
);

describe("Pruebas de integración - API RegistroHoras (/registrar-horas)", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    app.setErrorHandler((error, request, reply) => {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          mensaje: error.message,
        });
      }

        request.log.error(error);
        return reply.status(500).send({
        mensaje: "Error interno del servidor",
      });
    });

    await construirRegistroHorasEnrutador(app);
    await app.ready();

  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    registrosMemoria = [
      {
        idRegistroHoras: "r1",
        idProyecto: "p1",
        idConsultor: "c1",
        fechaRegistro: new Date("2025-01-10"),
        horasTrabajadas: 8,
        descripcionActividad: "Automatización inicial",
      },
      {
        idRegistroHoras: "r2",
        idProyecto: "p2",
        idConsultor: "c2",
        fechaRegistro: new Date("2025-01-11"),
        horasTrabajadas: 4,
        descripcionActividad: "Soporte",
      },
    ];
  });

  /**------------------------------------ TEST 1 ------------------------------------ */
  test("GET /registrar-horas - retorna todos los registros", async () => {
    const response = await request(app.server).get("/registrar-horas");

    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe(
      "Registros de horas encontrados correctamente"
    );
    expect(Array.isArray(response.body.registros)).toBe(true);
    expect(response.body.totalRegistros).toBe(
      response.body.registros.length
    );

    expect(response.body.registros).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          idRegistroHoras: "r1",
          idProyecto: "p1",
          idConsultor: "c1",
        }),
      ])
    );
  });

  /**------------------------------------ TEST 2 ------------------------------------ */
  test("GET /registrar-horas/:idRegistro - retorna un registro existente", async () => {
    const response = await request(app.server).get("/registrar-horas/r1");

    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe(
      "Registro de horas encontrado correctamente"
    );

    expect(response.body.registro).toEqual(
      expect.objectContaining({
        idRegistroHoras: "r1",
        idProyecto: "p1",
        idConsultor: "c1",
        horasTrabajadas: 8,
      })
    );
  });

  /**------------------------------------ TEST 3 ------------------------------------ */
  test("GET /registrar-horas/:idRegistro - retorna 404 si no existe", async () => {
    const response = await request(app.server).get(
      "/registrar-horas/no-existe"
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      mensaje: "Registro de horas no encontrado",
    });
  });

  /**------------------------------------ TEST 4 ------------------------------------ */
  test("POST /registrar-horas - crea un registro correctamente", async () => {
    const body = {
      id_consultor: "11111111-1111-1111-1111-111111111111",
      id_proyecto:  "22222222-2222-2222-2222-222222222222",
      fecha_registro: "2025-01-15", // "YYYY-MM-DD" -> Date.parse OK
      horas_trabajadas: 6,          // number válido
      descripcion_actividad: "Soporte en producción",
    };

    const response = await request(app.server)
      .post("/registrar-horas")
      .send(body);

    expect(response.status).toBe(201);
    expect(response.body.mensaje).toBe(
      "El registro de horas se creó correctamente"
    );

    expect(response.body.registro).toEqual(
      expect.objectContaining({
        idRegistroHoras: "r-nuevo",
        idConsultor: "11111111-1111-1111-1111-111111111111",
        idProyecto: "22222222-2222-2222-2222-222222222222",
        horasTrabajadas: 6,
        descripcionActividad: "Soporte en producción",
      })
    );
  });

  /**------------------------------------ TEST 5 ------------------------------------ */
  test("DELETE /registrar-horas/:idRegistro - elimina un registro", async () => {
    const response = await request(app.server).delete(
      "/registrar-horas/r2"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      mensaje: "Registro de horas eliminado correctamente",
    });

    const responseGet = await request(app.server).get("/registrar-horas");

    expect(responseGet.body.registros).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({ idRegistroHoras: "r2" }),
      ])
    );
  });
/**------------------------------------ TEST 6 ------------------------------------ */
  test("GET /registrar-horas con filtros inválidos - servicio lanza ValidationError y la API responde 400", async () => {
    const response = await request(app.server).get(
      "/registrar-horas?idConsultor=error-validacion"
    );
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      mensaje: "Filtros inválidos para listar registros",
    });
  });
/**------------------------------------ TEST 7 ------------------------------------ */
  test("GET /registrar-horas/:idRegistro - cuando el servicio lanza NotFoundError se responde 404 con mensaje de dominio", async () => {
    const response = await request(app.server).get(
      "/registrar-horas/lanzar-notfound"
    );
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      mensaje: "Registro no encontrado (AppError)",
    });
  });
/**------------------------------------ TEST 8  ------------------------------------ */
  test("POST /registrar-horas - cuando ya existe un registro el servicio lanza ConflictError y la API responde 409", async () => {
    const body = {
      id_consultor: "11111111-1111-1111-1111-111111111111",
      id_proyecto: "22222222-2222-2222-2222-222222222222",
      fecha_registro: "2025-01-15",
      horas_trabajadas: 4,
      descripcion_actividad: "DUPLICADO",
    };
    const response = await request(app.server)
      .post("/registrar-horas")
      .send(body);
    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      mensaje: "Ya existe un registro con esos datos",
    });
  });
});