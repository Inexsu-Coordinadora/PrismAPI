import Fastify, { FastifyInstance } from "fastify";
import request from "supertest";
import { construirConsultorEnrutador } from "../../../src/core/presentacion/rutas/entidades/consultorEnrutador";
import { IConsultor, DisponibilidadConsultor } from "../../../src/core/dominio/entidades/IConsultor";

const listarConsultoresMock = jest.fn<Promise<IConsultor[]>, any[]>();
const obtenerConsultorPorIdMock = jest.fn<Promise<IConsultor | null>, any[]>();
const crearConsultorMock = jest.fn<Promise<IConsultor>, any[]>();
const actualizarConsultorMock = jest.fn<Promise<IConsultor | null>, any[]>();
const eliminarConsultorMock = jest.fn<Promise<void>, any[]>();

jest.mock(
  "../../../src/core/infraestructura/postgres/repositorios/entidades/ConsultorRepository",
  () => {
    return {
      ConsultorRepository: jest.fn().mockImplementation(() => ({
        listarConsultores: listarConsultoresMock,
        obtenerConsultorPorId: obtenerConsultorPorIdMock,
        crearConsultor: crearConsultorMock,
        actualizarConsultor: actualizarConsultorMock,
        eliminarConsultor: eliminarConsultorMock,
      })),
    };
  }
);

describe("Pruebas de integración - API de Consultores", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await construirConsultorEnrutador(app);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    listarConsultoresMock.mockReset();
    obtenerConsultorPorIdMock.mockReset();
    crearConsultorMock.mockReset();
    actualizarConsultorMock.mockReset();
    eliminarConsultorMock.mockReset();
  });

/**------------------------------------ TEST 1 ------------------------------------ */
  test("GET /consultores - retorna todos los consultores simulados", async () => {
    const consultoresSimulados: IConsultor[] = [
      {
        idConsultor: "c1",
        nombreConsultor: "Ana Pérez",
        especialidadConsultor: "Tester",
        disponibilidadConsultor: DisponibilidadConsultor.DISPONIBLE,
        emailConsultor: "ana@mail.com",
        telefonoConsultor: "3000000001",
      },
      {
        idConsultor: "c2",
        nombreConsultor: "Juan Gómez",
        especialidadConsultor: "Backend",
        disponibilidadConsultor: DisponibilidadConsultor.OCUPADO,
        emailConsultor: "juan@mail.com",
        telefonoConsultor: "3000000002",
      },
    ];

    listarConsultoresMock.mockResolvedValue(consultoresSimulados);

    const response = await request(app.server).get("/consultores");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      mensaje: "Consultores encontrados correctamente",
      consultores: consultoresSimulados,
      totalConsultores: consultoresSimulados.length,
    });

    expect(listarConsultoresMock).toHaveBeenCalledWith(undefined);
  });

/**------------------------------------ TEST 2 ------------------------------------ */
  test("GET /consultores/:idConsultor - retorna un consultor existente", async () => {
    const consultorSimulado: IConsultor = {
      idConsultor: "c1",
      nombreConsultor: "Ana Pérez",
      especialidadConsultor: "Tester",
      disponibilidadConsultor: DisponibilidadConsultor.DISPONIBLE,
      emailConsultor: "ana@mail.com",
      telefonoConsultor: "3000000001",
    };

    obtenerConsultorPorIdMock.mockResolvedValue(consultorSimulado);

    const response = await request(app.server).get("/consultores/c1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      mensaje: "Consultor encontrado correctamente",
      consultor: consultorSimulado,
    });

    expect(obtenerConsultorPorIdMock).toHaveBeenCalledWith("c1");
  });

/**------------------------------------ TEST 3 ------------------------------------ */
  test("GET /consultores/:idConsultor - retorna 404 si el consultor no existe", async () => {
    obtenerConsultorPorIdMock.mockResolvedValue(null);

    const response = await request(app.server).get("/consultores/no-existe");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      mensaje: "Consultor no encontrado",
    });

    expect(obtenerConsultorPorIdMock).toHaveBeenCalledWith("no-existe");
  });

/**------------------------------------ TEST 4 ------------------------------------ */
  test("POST /consultores - crea un consultor correctamente", async () => {
    // Body que enviaría el cliente a la API
    const bodyPeticion = {
      nombreConsultor: "Nuevo Consultor",
      especialidadConsultor: "Tester",
      disponibilidadConsultor: DisponibilidadConsultor.DISPONIBLE,
      emailConsultor: "nuevo@mail.com",
      telefonoConsultor: "3000000000",
    };

    const consultorCreado: IConsultor = {
      idConsultor: "c-nuevo",
      ...bodyPeticion,
    };

    crearConsultorMock.mockResolvedValue(consultorCreado);

    const response = await request(app.server)
      .post("/consultores")
      .send(bodyPeticion);
    
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      mensaje: "El consultor se creo correctamente",
      idConsultor: consultorCreado,
    });

    expect(crearConsultorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nombreConsultor: bodyPeticion.nombreConsultor,
        emailConsultor: bodyPeticion.emailConsultor,
      })
    );
  });

/**------------------------------------ TEST 5 ------------------------------------ */
  test("PUT /consultores/:idConsultor - actualiza un consultor existente", async () => {
    const id = "c1";

    const bodyActualizacion = {
      nombreConsultor: "Nombre Actualizado",
      emailConsultor: "actualizado@mail.com",
    };

    const consultorActualizado: IConsultor = {
      idConsultor: id,
      nombreConsultor: "Nombre Actualizado",
      especialidadConsultor: "Tester",
      disponibilidadConsultor: DisponibilidadConsultor.DISPONIBLE,
      emailConsultor: "actualizado@mail.com",
      telefonoConsultor: "3000000001",
    };

    actualizarConsultorMock.mockResolvedValue(consultorActualizado);

    const response = await request(app.server)
      .put(`/consultores/${id}`)
      .send(bodyActualizacion);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      mensaje: "Consultor actualizado correctamente",
      consultorActualizado,
    });

    expect(actualizarConsultorMock).toHaveBeenCalledWith(
      id,
      expect.objectContaining(bodyActualizacion)
    );
  });

/**------------------------------------ TEST 6 ------------------------------------ */
  test("PUT /consultores/:idConsultor - retorna 404 si el consultor no existe", async () => {
    const id = "no-existe";

    actualizarConsultorMock.mockResolvedValue(null);

    const response = await request(app.server)
      .put(`/consultores/${id}`)
      .send({ nombreConsultor: "Nuevo Nombre" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      mensaje: "Consultor no encontrado para actualizar",
    });

    expect(actualizarConsultorMock).toHaveBeenCalledWith(
      id,
      expect.any(Object)
    );
  });

/**------------------------------------ TEST 7 ------------------------------------ */
  test("DELETE /consultores/:idConsultor - elimina un consultor (no valida existencia)", async () => {
    const id = "c1";

    eliminarConsultorMock.mockResolvedValue();

    const response = await request(app.server).delete(`/consultores/${id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      mensaje: "Consultor eliminado correctamente",
    });

    expect(eliminarConsultorMock).toHaveBeenCalledWith(id);
  });
});
