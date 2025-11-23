/**
 * Pruebas de INTEGRACIÓN de la API de Registro de Horas.
 *
 * Capas que se prueban juntas:
 * - Fastify (app real, sin app global)
 * - Enrutador (registroHorasEnrutador)
 * - Controlador (RegistroHorasControlador)
 * - Servicio (MOCK de RegistroHorasServicio con lógica en memoria)
 *
 * Capas que NO se tocan:
 * - PostgreSQL (repositorios reales)
 */

import Fastify, { FastifyInstance } from "fastify";
import request from "supertest";
import { AppError, ConflictError, NotFoundError, ValidationError} from "../../../src/common/errores/AppError";
import { describe, beforeAll, afterAll, beforeEach, test, expect, jest } from "@jest/globals";
// Dominio: tipo de Registro de Horas
import { IRegistroHoras } from "../../../src/core/dominio/servicios/IRegistroHoras";
// Enrutador real de Registro de Horas
import { construirRegistroHorasEnrutador } from "../../../src/core/presentacion/rutas/servicios/registroHorasEnrutador";

/**
 * 1️⃣ Base de datos en memoria para los tests de integración
 *
 * Esta lista reemplaza a la BD real. El MOCK de RegistroHorasServicio
 * leerá y escribirá sobre este array.
 */
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

/**
 * 2️⃣ MOCK de la clase RegistroHorasServicio
 *
 * En lugar de usar la implementación que va a PostgreSQL,
 * reemplazamos la clase por una versión que trabaja sobre `registrosMemoria`.
 *
 * IMPORTANTE:
 * - El nombre del archivo en el jest.mock debe coincidir con el import
 *   que se usa dentro de `registroHorasEnrutador.ts`.
 *   (desde este test, la ruta suele ser "../../../src/core/aplicacion/casos-uso/servicios/RegistroHorasServicio")
 */
//Mock del esquema Zod para evitar ZodError en integración
jest.mock(
  "../../../src/core/presentacion/esquemas/servicios/registroHorasEsquema",
  () => {
    return {
      // Simulamos solo el método parse que usa el controlador
      CrearRegistroHorasEsquema: {
        parse: (body: any) => body, // devolvemos el body tal cual, sin validar
      },
      // El tipo RegistroHorasDTO solo existe en tiempo de compilación,
      // aquí basta con exportar cualquier cosa
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
        // Caso especial para probar ValidationError a nivel API:
        // si el idConsultor es "error-validacion", el servicio lanza ValidationError.
        if (idConsultor === "error-validacion") {
          throw new ValidationError("Filtros inválidos para listar registros");
        }
        // Filtramos en memoria según los parámetros (igual que haría el repo)
        return registrosMemoria.filter((r) => {
          if (idConsultor && r.idConsultor !== idConsultor) return false;
          if (idProyecto && r.idProyecto !== idProyecto) return false;
          return true;
        });
      }

      async obtenerRegistroHorasPorId(
        idRegistro: string
      ): Promise<IRegistroHoras | null> {
        // Caso especial: probamos NotFoundError de dominio
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
        // Caso especial: probamos ConflictError de dominio
        if (datos.descripcionActividad === "DUPLICADO") {
          throw new ConflictError("Ya existe un registro con esos datos");
        }
        // Simulamos que el servicio genera un nuevo id
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
    // Exportamos la clase con el mismo nombre que el módulo real
    return { RegistroHorasServicio: RegistroHorasServicioMock };
  }
);

describe("Pruebas de integración - API RegistroHoras (/registrar-horas)", () => {
  let app: FastifyInstance;

  /**
   * 3️⃣ beforeAll: crear app Fastify y registrar el enrutador REAL
   *
   * Aquí NO usamos la app global, sino una nueva instancia solo para estos tests.
   * El enrutador, al importarse, utilizará la clase RegistroHorasServicio
   * que ya fue reemplazada por nuestro MOCK.
   */
  beforeAll(async () => {
    app = Fastify({ logger: false });

    // Manejador de errores alineado con AppError:
    // si el servicio lanza ValidationError/NotFoundError/ConflictError,
    // la API responde con el statusCode correcto y un mensaje claro.
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

    // Registramos el enrutador de Registro de Horas sobre esta app
    await construirRegistroHorasEnrutador(app);
    await app.ready();

    // Si necesitas depurar rutas:
    // console.log(app.printRoutes());
  });

  /**
   * 4️⃣ afterAll: cerrar la app al terminar los tests
   */
  afterAll(async () => {
    await app.close();
  });

  /**
   * 5️⃣ beforeEach: reiniciar la "BD en memoria" antes de cada test
   *
   * Esto garantiza que cada test empiece con el mismo estado
   * y que no se contaminen los resultados entre pruebas.
   */
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

    // 1) Código HTTP correcto
    expect(response.status).toBe(200);
    // 2) Mensaje y estructura según RegistroHorasControlador.listarRegistrosHoras
    expect(response.body.mensaje).toBe(
      "Registros de horas encontrados correctamente"
    );
    expect(Array.isArray(response.body.registros)).toBe(true);
    expect(response.body.totalRegistros).toBe(
      response.body.registros.length
    );

    // 3) Verificar que incluye el registro r1
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

    // El controlador devuelve { mensaje, registro }
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
    /**
     * MUY IMPORTANTE:
     * El body DEBE cumplir el esquema Zod `CrearRegistroHorasEsquema`,
     * que espera claves en snake_case:
     *  - id_consultor (UUID string)
     *  - id_proyecto  (UUID string)
     *  - fecha_registro (string parseable por Date.parse)
     *  - horas_trabajadas (string o number)
     *  - descripcion_actividad (string no vacía)
     */
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

    // Si llegas a tener problemas, descomenta esto para ver el error:
    // console.log("STATUS POST:", response.status);
    // console.log("BODY POST:", response.body);

    // Código HTTP esperado según HttpStatus.CREADO (201)
    expect(response.status).toBe(201);
    expect(response.body.mensaje).toBe(
      "El registro de horas se creó correctamente"
    );

    // El controlador devuelve { mensaje, registro }
    expect(response.body.registro).toEqual(
      expect.objectContaining({
        idRegistroHoras: "r-nuevo", // lo pone el MOCK del servicio
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

    // Opcional: comprobar que ya no está en la "BD en memoria"
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
      descripcion_actividad: "DUPLICADO", // trigger del ConflictError en el mock
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