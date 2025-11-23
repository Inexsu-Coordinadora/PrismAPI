/**
 * Test unitarios para el servicio RegistroHorasServicio.
 * Objetivo:
 * - Probar la lógica de negocio de registrar horas y listarlas.
 * - Validar reglas como "horasTrabajadas > 0".
 * - NO tocar base de datos: el repositorio es mockeado.
 */

import { describe, test, beforeEach, expect, jest } from "@jest/globals";
import type { Mocked } from "jest-mock";
import { RegistroHorasServicio } from "../../../../src/core/aplicacion/casos-uso/servicios/RegistroHorasServicio";
import { IRegistroHorasRepositorio } from "../../../../src/core/dominio/repositorio/servicios/IRegistroHorasRepositorio";
import { IConsultorRepositorio } from "../../../../src/core/dominio/repositorio/entidades/IConsultorRepositorio";
import { IProyectoRepositorio } from "../../../../src/core/dominio/repositorio/entidades/IProyectoRepositorio";
import { IAsignacionConsultorProyectoRepositorio } from "../../../../src/core/dominio/repositorio/servicios/IAsignacionConsultorProyectoRepositorio";
import { IRegistroHoras } from "../../../../src/core/dominio/servicios/IRegistroHoras";
import { ValidationError, NotFoundError, ConflictError } from "../../../../src/common/errores/AppError";

describe("Pruebas unitarias - RegistroHorasServicio", () => {
    let registroHorasRepoMock: Mocked<IRegistroHorasRepositorio>;
    let consultorRepoMock: Mocked<IConsultorRepositorio>;
    let proyectoRepoMock: Mocked<IProyectoRepositorio>;
    let asignacionRepoMock: Mocked<IAsignacionConsultorProyectoRepositorio>;
    let registroHorasServicio: RegistroHorasServicio;

    beforeEach(() => {
        registroHorasRepoMock = {
            crearParteHora: jest.fn(),
            listarPartesHoras: jest.fn(),
            obtenerParteHoraPorId: jest.fn(),
            eliminarParteHora: jest.fn(),
        };
        consultorRepoMock = {
            crearConsultor: jest.fn(),
            listarConsultores: jest.fn(),
            obtenerConsultorPorId: jest.fn(),
            actualizarConsultor: jest.fn(),
            eliminarConsultor: jest.fn(),
        };

        proyectoRepoMock = {
            crearProyecto: jest.fn(),
            obtenerProyectoPorId: jest.fn(),
            obtenerProyectos: jest.fn(),
            actualizarProyecto: jest.fn(),
            eliminarProyecto: jest.fn(),
        };

        asignacionRepoMock = {
            asignarConsultorProyecto: jest.fn(),
            obtenerAsignacionPorId: jest.fn(),
            obtenerAsignacionPorConsultor: jest.fn(),
            obtenerAsignacionPorProyecto: jest.fn(),
            obtenerAsignacionExistente: jest.fn(),
            obtenerDedicacionConsultor: jest.fn(),
            actualizarAsignacion: jest.fn(),
            eliminarAsignacion: jest.fn(),
        };

        registroHorasServicio = new RegistroHorasServicio(
            registroHorasRepoMock,
            consultorRepoMock,
            proyectoRepoMock,
            asignacionRepoMock
        );
    });
    
/**------------------------------------ TEST 1  ------------------------------------ */
  test("listarRegistrosHoras - retorna todos los registros sin filtros", async () => {
    const registrosSimulados: IRegistroHoras[] = [
      {
        idRegistroHoras: "r1",
        idProyecto: "p1",
        idConsultor: "c1",
        fechaRegistro: new Date("2025-01-01"),
        horasTrabajadas: 8,
        descripcionActividad: "Análisis",
      },
      {
        idRegistroHoras: "r2",
        idProyecto: "p2",
        idConsultor: "c2",
        fechaRegistro: new Date("2025-01-02"),
        horasTrabajadas: 4,
        descripcionActividad: "Pruebas",
      },
    ];

    registroHorasRepoMock.listarPartesHoras.mockResolvedValue(registrosSimulados);

    const resultado = await registroHorasServicio.listarRegistrosHoras();

    expect(registroHorasRepoMock.listarPartesHoras).toHaveBeenCalledWith(
      undefined as any,
      undefined as any
    );

    expect(resultado).toEqual(registrosSimulados);
  });

/**------------------------------------ TEST 2  ------------------------------------ */
  test("listarRegistrosHoras - filtra por idConsultor e idProyecto", async () => {
    const registrosSimulados: IRegistroHoras[] = [
      {
        idRegistroHoras: "r1",
        idProyecto: "p1",
        idConsultor: "c1",
        fechaRegistro: new Date("2025-01-01"),
        horasTrabajadas: 8,
        descripcionActividad: "Automatización",
      },
    ];

    registroHorasRepoMock.listarPartesHoras.mockResolvedValue(registrosSimulados);

    const resultado = await registroHorasServicio.listarRegistrosHoras("c1", "p1");
    // Regla: la capa de aplicación reenvía los filtros tal cual al repositorio
    expect(registroHorasRepoMock.listarPartesHoras).toHaveBeenCalledWith("c1", "p1");
    expect(resultado).toEqual(registrosSimulados);
  });

/**------------------------------------ TEST 3  ------------------------------------ */
test("crearRegistroHoras - crea registro cuando todo es válido", async () => {  // FLUJO FELIZ
    const datosEntrada: IRegistroHoras = {
      idProyecto: "p1",
      idConsultor: "c1",
      fechaRegistro: new Date("2025-01-10"),
      horasTrabajadas: 8,
      descripcionActividad: "Automatización",
    };
    /**------------------------------------ 3.1  ------------------------------------ */
    //El consultor existe
    consultorRepoMock.obtenerConsultorPorId.mockResolvedValue({
      idConsultor: "c1",
      nombreConsultor: "Ana",
      especialidadConsultor: "Tester",
      disponibilidadConsultor: "disponible" as any,
      emailConsultor: "ana@mail.com",
      telefonoConsultor: "3000000000",
    });
    /**------------------------------------ 3.2  ------------------------------------ */
    //El proyecto existe
    proyectoRepoMock.obtenerProyectoPorId.mockResolvedValue({
      idProyecto: "p1",
      nombreProyecto: "Proyecto X",
      tipoProyecto: "null",
      fechaInicioProyecto: new Date("2025-01-01"),
      fechaFinProyecto: null,
      estadoProyecto: "activo" as any,
      idCliente: "null",
    });
    /**------------------------------------ 3.3  ------------------------------------ */
    //Existe asignación del consultor al proyecto
    asignacionRepoMock.obtenerAsignacionExistente.mockResolvedValue({
      idAsignacion: "a1",
      idConsultor: "c1",
      idProyecto: "p1",
      fechaInicioAsignacion: new Date("2025-01-01"),
      fechaFinAsignacion: new Date("2025-01-31"),
    } as any);
    /**------------------------------------ 3.4  ------------------------------------ */
    //No hay duplicados
    registroHorasRepoMock.listarPartesHoras.mockResolvedValue([]);
    
    const registroCreado: IRegistroHoras = {
      idRegistroHoras: "r1",
      ...datosEntrada,
    };
    registroHorasRepoMock.crearParteHora.mockResolvedValue(registroCreado);

    const resultado = await registroHorasServicio.crearRegistroHoras(datosEntrada);

    expect(registroHorasRepoMock.crearParteHora).toHaveBeenCalledWith(
      expect.objectContaining({
        idConsultor: "c1",
        idProyecto: "p1",
        horasTrabajadas: 8,
      })
    );

    expect(resultado).toEqual(registroCreado);
  });

/**------------------------------------ TEST 4  ------------------------------------ */
  test("crearRegistroHoras - lanza ValidationError si horasTrabajadas <= 0", async () => {
    const datosEntrada: IRegistroHoras = {
      idProyecto: "p1",
      idConsultor: "c1",
      fechaRegistro: new Date("2025-01-10"),
      horasTrabajadas: 0,
      descripcionActividad: "Algo",
    };

    consultorRepoMock.obtenerConsultorPorId.mockResolvedValue({} as any);
    proyectoRepoMock.obtenerProyectoPorId.mockResolvedValue({} as any);

    asignacionRepoMock.obtenerAsignacionExistente.mockResolvedValue({} as any);
    registroHorasRepoMock.listarPartesHoras.mockResolvedValue([]);

    await expect(
      registroHorasServicio.crearRegistroHoras(datosEntrada)
    ).rejects.toBeInstanceOf(ValidationError);
  });

/**------------------------------------ TEST 5  ------------------------------------ */
  test("crearRegistroHoras - lanza ConflictError si ya existe un registro idéntico", async () => {
    const fecha = new Date("2025-01-10");

    const datosEntrada: IRegistroHoras = {
      idProyecto: "p1",
      idConsultor: "c1",
      fechaRegistro: fecha,
      horasTrabajadas: 4,
      descripcionActividad: "Soporte",
    };

    consultorRepoMock.obtenerConsultorPorId.mockResolvedValue({} as any);
    proyectoRepoMock.obtenerProyectoPorId.mockResolvedValue({} as any);

    asignacionRepoMock.obtenerAsignacionExistente.mockResolvedValue({
      fechaInicioAsignacion: new Date("2025-01-01"),
      fechaFinAsignacion: new Date("2025-01-31"),
    } as any);

    registroHorasRepoMock.listarPartesHoras.mockResolvedValue([
      {
        idRegistroHoras: "existente",
        idProyecto: "p1",
        idConsultor: "c1",
        fechaRegistro: new Date("2025-01-10"),
        horasTrabajadas: 4,
        descripcionActividad: "Soporte",
      },
    ]);

    await expect(
      registroHorasServicio.crearRegistroHoras(datosEntrada)
    ).rejects.toBeInstanceOf(ConflictError);
  });

/**------------------------------------ TEST 6  ------------------------------------ */
  test("crearRegistroHoras - lanza NotFoundError si el consultor no existe", async () => {
    const datosEntrada: IRegistroHoras = {
      idProyecto: "p1",
      idConsultor: "c-inexistente",
      fechaRegistro: new Date("2025-01-10"),
      horasTrabajadas: 8,
      descripcionActividad: "Algo",
    };

    consultorRepoMock.obtenerConsultorPorId.mockResolvedValue(null);

    await expect(
        registroHorasServicio.crearRegistroHoras(datosEntrada)
    ).rejects.toBeInstanceOf(NotFoundError);
  });

/**------------------------------------ TEST 7  ------------------------------------ */
  test("crearRegistroHoras - lanza NotFoundError si el proyecto no existe", async () => {
    const datosEntrada: IRegistroHoras = {
      idProyecto: "p-inexistente",
      idConsultor: "c1",
      fechaRegistro: new Date("2025-01-10"),
      horasTrabajadas: 8,
      descripcionActividad: "Algo",
    };

    consultorRepoMock.obtenerConsultorPorId.mockResolvedValue({} as any);
    proyectoRepoMock.obtenerProyectoPorId.mockResolvedValue(null);

    await expect(
      registroHorasServicio.crearRegistroHoras(datosEntrada)
    ).rejects.toBeInstanceOf(NotFoundError);
  });

/**------------------------------------ TEST 8  ------------------------------------ */
  test("crearRegistroHoras - lanza ValidationError si el consultor no está asignado al proyecto", async () => {
    const datosEntrada: IRegistroHoras = {
      idProyecto: "p1",
      idConsultor: "c1",
      fechaRegistro: new Date("2025-01-10"),
      horasTrabajadas: 8,
      descripcionActividad: "Algo",
    };

    consultorRepoMock.obtenerConsultorPorId.mockResolvedValue({} as any);
    proyectoRepoMock.obtenerProyectoPorId.mockResolvedValue({} as any);

    asignacionRepoMock.obtenerAsignacionExistente.mockResolvedValue(null);

    await expect(
      registroHorasServicio.crearRegistroHoras(datosEntrada)
    ).rejects.toBeInstanceOf(ValidationError);
  });

/**------------------------------------ TEST 9  ------------------------------------ */
  test("crearRegistroHoras - lanza ValidationError si la fecha es anterior al inicio de la asignación", async () => {
    const datosEntrada: IRegistroHoras = {
      idProyecto: "p1",
      idConsultor: "c1",
      fechaRegistro: new Date("2025-01-05"), // antes del 10
      horasTrabajadas: 8,
      descripcionActividad: "Algo",
    };

    consultorRepoMock.obtenerConsultorPorId.mockResolvedValue({} as any);
    proyectoRepoMock.obtenerProyectoPorId.mockResolvedValue({} as any);

    asignacionRepoMock.obtenerAsignacionExistente.mockResolvedValue({
      fechaInicioAsignacion: new Date("2025-01-10"),
      fechaFinAsignacion: new Date("2025-01-20"),
    } as any);

    registroHorasRepoMock.listarPartesHoras.mockResolvedValue([]);

    await expect(
      registroHorasServicio.crearRegistroHoras(datosEntrada)
    ).rejects.toBeInstanceOf(ValidationError);
  });
  
/**------------------------------------ TEST 10  ------------------------------------ */
  test("crearRegistroHoras - lanza ValidationError si la fecha es posterior al fin de la asignación", async () => {
    const datosEntrada: IRegistroHoras = {
      idProyecto: "p1",
      idConsultor: "c1",
      fechaRegistro: new Date("2025-01-25"),
      horasTrabajadas: 8,
      descripcionActividad: "Algo",
    };

    consultorRepoMock.obtenerConsultorPorId.mockResolvedValue({} as any);
    proyectoRepoMock.obtenerProyectoPorId.mockResolvedValue({} as any);

    asignacionRepoMock.obtenerAsignacionExistente.mockResolvedValue({
      fechaInicioAsignacion: new Date("2025-01-10"),
      fechaFinAsignacion: new Date("2025-01-20"),
    } as any);

    registroHorasRepoMock.listarPartesHoras.mockResolvedValue([]);

    await expect(
      registroHorasServicio.crearRegistroHoras(datosEntrada)
    ).rejects.toBeInstanceOf(ValidationError);
  });

/**------------------------------------ TEST 11  ------------------------------------ */
  test("crearRegistroHoras - lanza ValidationError si horasTrabajadas > 24", async () => {
    const datosEntrada: IRegistroHoras = {
      idProyecto: "p1",
      idConsultor: "c1",
      fechaRegistro: new Date("2025-01-10"),
      horasTrabajadas: 25,
      descripcionActividad: "Algo",
    };

    consultorRepoMock.obtenerConsultorPorId.mockResolvedValue({} as any);
    proyectoRepoMock.obtenerProyectoPorId.mockResolvedValue({} as any);
    asignacionRepoMock.obtenerAsignacionExistente.mockResolvedValue({
      fechaInicioAsignacion: new Date("2025-01-01"),
      fechaFinAsignacion: new Date("2025-01-31"),
    } as any);

    registroHorasRepoMock.listarPartesHoras.mockResolvedValue([]);

    await expect(
      registroHorasServicio.crearRegistroHoras(datosEntrada)
    ).rejects.toBeInstanceOf(ValidationError);
  });

/**------------------------------------ TEST 12  ------------------------------------ */
  test("obtenerRegistroHorasPorId - retorna registro cuando existe", async () => {
    const registro: IRegistroHoras = {
      idRegistroHoras: "r1",
      idProyecto: "p1",
      idConsultor: "c1",
      fechaRegistro: new Date("2025-01-10"),
      horasTrabajadas: 8,
      descripcionActividad: "Algo",
    };

    registroHorasRepoMock.obtenerParteHoraPorId.mockResolvedValue(registro);

    const resultado = await registroHorasServicio.obtenerRegistroHorasPorId("r1");

    expect(registroHorasRepoMock.obtenerParteHoraPorId).toHaveBeenCalledWith("r1");
    expect(resultado).toEqual(registro);
  });

/**------------------------------------ TEST 13  ------------------------------------ */
  test("obtenerRegistroHorasPorId - retorna null cuando no existe", async () => {
    registroHorasRepoMock.obtenerParteHoraPorId.mockResolvedValue(null);

    const resultado = await registroHorasServicio.obtenerRegistroHorasPorId(
      "no-existe"
    );

    expect(registroHorasRepoMock.obtenerParteHoraPorId).toHaveBeenCalledWith(
      "no-existe"
    );
    expect(resultado).toBeNull();
  });

/**------------------------------------ TEST 14  ------------------------------------ */
  test("eliminarRegistroHoras - delega en el repositorio", async () => {
    registroHorasRepoMock.eliminarParteHora.mockResolvedValue();

    await registroHorasServicio.eliminarRegistroHoras("r1");

    expect(registroHorasRepoMock.eliminarParteHora).toHaveBeenCalledWith("r1");
  })
});
