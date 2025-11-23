import {
  ProyectoConConsultoresDTO,
  FiltrosConsultaProyectos,
} from "../../../../src/core/presentacion/esquemas/servicios/consultaProyectoEsquema";
import { ConsultarProyectosPorClienteServicio } from "../../../../src/core/aplicacion/casos-uso/servicios/ConsultaProyectoServicio";
import {
  NotFoundError,
  ValidationError,
} from "../../../../src/common/errores/AppError";

describe("Pruebas unitarias ConsultaProyectoServicio", () => {
  let ConsultaProyectoRepoMock: any;
  let servicio: ConsultarProyectosPorClienteServicio;

  beforeEach(() => {
    //* Crear el mock del repositorio con todos sus métodos
    ConsultaProyectoRepoMock = {
      obtenerProyectosPorCliente: jest.fn(),
      existeCliente: jest.fn(),
    };

    //* Crear la instancia del servicio con el repositorio mockeado
    servicio = new ConsultarProyectosPorClienteServicio(
      ConsultaProyectoRepoMock
    );
  });

  //* ---------------------------- TESTS CONSULTAR PROYECTOS SIN FILTROS ----------------------------//

  //* ------------------ TEST 1: CAMINO FELIZ ------------------//
  test("Consultar Proyectos - Debe retornar proyectos sin filtros si el cliente existe", async () => {
    //* A. PREPARAR DATOS (ARRANGE)
    const idCliente = "550e8400-e29b-41d4-a716-446655440000";

    const proyectosMock: ProyectoConConsultoresDTO[] = [
      {
        codigoProyecto: "proj-001",
        nombreProyecto: "Proyecto Alpha",
        estadoProyecto: "activo",
        fechaInicioProyecto: "2024-01-15T00:00:00.000Z",
        fechaFinProyecto: "2024-12-31T00:00:00.000Z",
        consultores: [
          { nombre: "Juan Pérez", rol: "Tech Lead" },
          { nombre: "María García", rol: "Developer" },
        ],
      },
      {
        codigoProyecto: "proj-002",
        nombreProyecto: "Proyecto Beta",
        estadoProyecto: "pendiente",
        fechaInicioProyecto: "2024-03-01T00:00:00.000Z",
        fechaFinProyecto: null,
        consultores: [],
      },
    ];

    //* 1. El cliente existe
    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(true);
    //* 2. El repositorio retorna los proyectos
    ConsultaProyectoRepoMock.obtenerProyectosPorCliente.mockResolvedValue(
      proyectosMock
    );

    //* B. EJECUTAR (ACT)
    const resultado =
      await servicio.consultarProyectosPorClienteServicio(idCliente);

    //* C. VALIDAR (ASSERT)
    expect(ConsultaProyectoRepoMock.existeCliente).toHaveBeenCalledWith(
      idCliente
    );
    expect(
      ConsultaProyectoRepoMock.obtenerProyectosPorCliente
    ).toHaveBeenCalledWith(idCliente, undefined);
    expect(resultado).toEqual(proyectosMock);
    expect(resultado).toHaveLength(2);
  });

  //* ------------------ TEST 2: ERROR (Cliente no existe) ------------------//
  test("Consultar Proyectos - Debe lanzar NotFoundError si el cliente no existe", async () => {
    //* A. PREPARAR
    const idClienteInexistente = "999e8400-e29b-41d4-a716-446655440099";
    //* Simulamos que el cliente NO existe
    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(false);

    //* B. EJECUTAR Y VALIDAR
    await expect(
      servicio.consultarProyectosPorClienteServicio(idClienteInexistente)
    ).rejects.toThrow(NotFoundError);
    await expect(
      servicio.consultarProyectosPorClienteServicio(idClienteInexistente)
    ).rejects.toThrow("Cliente no encontrado");

    //* Verificar que NO se llamó al método de obtener proyectos
    expect(
      ConsultaProyectoRepoMock.obtenerProyectosPorCliente
    ).not.toHaveBeenCalled();
  });

  //* ---------------------------- TESTS CONSULTAR PROYECTOS CON FILTRO DE ESTADO ----------------------------//

  //* ------------------ TEST 3: CAMINO FELIZ ------------------//
  test("Consultar Proyectos - Debe retornar proyectos filtrados por estado 'activo'", async () => {
    //* A. PREPARAR
    const idCliente = "550e8400-e29b-41d4-a716-446655440000";
    const filtros: FiltrosConsultaProyectos = {
      estadoProyecto: "activo",
    };

    const proyectosMock: ProyectoConConsultoresDTO[] = [
      {
        codigoProyecto: "proj-001",
        nombreProyecto: "Proyecto Alpha",
        estadoProyecto: "activo",
        fechaInicioProyecto: "2024-01-15T00:00:00.000Z",
        fechaFinProyecto: "2024-12-31T00:00:00.000Z",
        consultores: [{ nombre: "Juan Pérez", rol: "Tech Lead" }],
      },
    ];

    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(true);
    ConsultaProyectoRepoMock.obtenerProyectosPorCliente.mockResolvedValue(
      proyectosMock
    );

    //* B. EJECUTAR
    const resultado = await servicio.consultarProyectosPorClienteServicio(
      idCliente,
      filtros
    );

    //* C. VALIDAR
    expect(
      ConsultaProyectoRepoMock.obtenerProyectosPorCliente
    ).toHaveBeenCalledWith(idCliente, filtros);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].estadoProyecto).toBe("activo");
  });

  //* ------------------ TEST 4: CAMINO FELIZ ------------------//
  test("Consultar Proyectos - Debe retornar proyectos filtrados por estado 'finalizado'", async () => {
    //* A. PREPARAR
    const idCliente = "550e8400-e29b-41d4-a716-446655440000";
    const filtros: FiltrosConsultaProyectos = {
      estadoProyecto: "finalizado",
    };

    const proyectosMock: ProyectoConConsultoresDTO[] = [
      {
        codigoProyecto: "proj-003",
        nombreProyecto: "Proyecto Legacy",
        estadoProyecto: "finalizado",
        fechaInicioProyecto: "2023-01-01T00:00:00.000Z",
        fechaFinProyecto: "2023-12-31T00:00:00.000Z",
        consultores: [{ nombre: "Pedro López", rol: "PM" }],
      },
    ];

    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(true);
    ConsultaProyectoRepoMock.obtenerProyectosPorCliente.mockResolvedValue(
      proyectosMock
    );

    //* B. EJECUTAR
    const resultado = await servicio.consultarProyectosPorClienteServicio(
      idCliente,
      filtros
    );

    //* C. VALIDAR
    expect(resultado[0].estadoProyecto).toBe("finalizado");
  });

  //* ---------------------------- TESTS CONSULTAR PROYECTOS CON FILTRO DE FECHA INICIO ----------------------------//

  //* ------------------ TEST 5: CAMINO FELIZ ------------------//
  test("Consultar Proyectos - Debe retornar proyectos filtrados por fecha de inicio", async () => {
    //* A. PREPARAR
    const idCliente = "550e8400-e29b-41d4-a716-446655440000";
    const filtros: FiltrosConsultaProyectos = {
      fechaInicioProyecto: "2024-01-01",
    };

    const proyectosMock: ProyectoConConsultoresDTO[] = [
      {
        codigoProyecto: "proj-001",
        nombreProyecto: "Proyecto Reciente",
        estadoProyecto: "activo",
        fechaInicioProyecto: "2024-06-15T00:00:00.000Z",
        fechaFinProyecto: null,
        consultores: [],
      },
    ];

    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(true);
    ConsultaProyectoRepoMock.obtenerProyectosPorCliente.mockResolvedValue(
      proyectosMock
    );

    //* B. EJECUTAR
    const resultado = await servicio.consultarProyectosPorClienteServicio(
      idCliente,
      filtros
    );

    //* C. VALIDAR
    expect(
      ConsultaProyectoRepoMock.obtenerProyectosPorCliente
    ).toHaveBeenCalledWith(idCliente, filtros);
    expect(resultado).toEqual(proyectosMock);
  });

  //* ---------------------------- TESTS CONSULTAR PROYECTOS CON FILTRO DE FECHA FIN ----------------------------//

  //* ------------------ TEST 6: CAMINO FELIZ ------------------//
  test("Consultar Proyectos - Debe retornar proyectos filtrados por fecha de fin", async () => {
    //* A. PREPARAR
    const idCliente = "550e8400-e29b-41d4-a716-446655440000";
    const filtros: FiltrosConsultaProyectos = {
      fechaFinProyecto: "2024-12-31",
    };

    const proyectosMock: ProyectoConConsultoresDTO[] = [
      {
        codigoProyecto: "proj-001",
        nombreProyecto: "Proyecto a Finalizar",
        estadoProyecto: "activo",
        fechaInicioProyecto: "2024-01-01T00:00:00.000Z",
        fechaFinProyecto: "2024-11-30T00:00:00.000Z",
        consultores: [{ nombre: "Ana López", rol: "PM" }],
      },
    ];

    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(true);
    ConsultaProyectoRepoMock.obtenerProyectosPorCliente.mockResolvedValue(
      proyectosMock
    );

    //* B. EJECUTAR
    const resultado = await servicio.consultarProyectosPorClienteServicio(
      idCliente,
      filtros
    );

    //* C. VALIDAR
    expect(resultado).toHaveLength(1);
    expect(resultado[0].fechaFinProyecto).toBe("2024-11-30T00:00:00.000Z");
  });

  //* ---------------------------- TESTS CONSULTAR PROYECTOS CON TODOS LOS FILTROS ----------------------------//

  //* ------------------ TEST 7: CAMINO FELIZ ------------------//
  test("Consultar Proyectos - Debe retornar proyectos con todos los filtros aplicados", async () => {
    //* A. PREPARAR
    const idCliente = "550e8400-e29b-41d4-a716-446655440000";
    const filtros: FiltrosConsultaProyectos = {
      estadoProyecto: "activo",
      fechaInicioProyecto: "2024-01-01",
      fechaFinProyecto: "2024-12-31",
    };

    const proyectosMock: ProyectoConConsultoresDTO[] = [
      {
        codigoProyecto: "proj-001",
        nombreProyecto: "Proyecto Completo",
        estadoProyecto: "activo",
        fechaInicioProyecto: "2024-06-01T00:00:00.000Z",
        fechaFinProyecto: "2024-11-30T00:00:00.000Z",
        consultores: [
          { nombre: "Carlos Ruiz", rol: "Architect" },
          { nombre: "Laura Martínez", rol: "QA" },
        ],
      },
    ];

    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(true);
    ConsultaProyectoRepoMock.obtenerProyectosPorCliente.mockResolvedValue(
      proyectosMock
    );

    //* B. EJECUTAR
    const resultado = await servicio.consultarProyectosPorClienteServicio(
      idCliente,
      filtros
    );

    //* C. VALIDAR
    expect(ConsultaProyectoRepoMock.existeCliente).toHaveBeenCalledWith(
      idCliente
    );
    expect(
      ConsultaProyectoRepoMock.obtenerProyectosPorCliente
    ).toHaveBeenCalledWith(idCliente, filtros);
    expect(resultado).toEqual(proyectosMock);
    expect(resultado[0].consultores).toHaveLength(2);
  });

  //* ---------------------------- TESTS VALIDACIÓN DE RANGO DE FECHAS ----------------------------//

  //* ------------------ TEST 8: ERROR (Fecha inicio mayor que fecha fin) ------------------//
  test("Consultar Proyectos - Debe lanzar ValidationError si fecha inicio > fecha fin", async () => {
    //* A. PREPARAR
    const idCliente = "550e8400-e29b-41d4-a716-446655440000";
    const filtros: FiltrosConsultaProyectos = {
      fechaInicioProyecto: "2024-12-31", //* Fecha MAYOR
      fechaFinProyecto: "2024-01-01", //* Fecha MENOR
    };

    //* El cliente existe, pero los filtros son inválidos
    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(true);

    //* B. EJECUTAR Y VALIDAR
    await expect(
      servicio.consultarProyectosPorClienteServicio(idCliente, filtros)
    ).rejects.toThrow(ValidationError);
    await expect(
      servicio.consultarProyectosPorClienteServicio(idCliente, filtros)
    ).rejects.toThrow(/rango de fechas es inválido/);

    //* Verificar que NO se llamó al método de obtener proyectos
    expect(
      ConsultaProyectoRepoMock.obtenerProyectosPorCliente
    ).not.toHaveBeenCalled();
  });

  //* ---------------------------- TESTS CONSULTAR PROYECTOS SIN CONSULTORES ----------------------------//

  //* ------------------ TEST 9: CAMINO FELIZ ------------------//
  test("Consultar Proyectos - Debe retornar proyectos sin consultores asignados", async () => {
    //* A. PREPARAR
    const idCliente = "550e8400-e29b-41d4-a716-446655440000";

    const proyectosMock: ProyectoConConsultoresDTO[] = [
      {
        codigoProyecto: "proj-solo",
        nombreProyecto: "Proyecto Sin Consultores",
        estadoProyecto: "pendiente",
        fechaInicioProyecto: "2024-05-01T00:00:00.000Z",
        fechaFinProyecto: null,
        consultores: [], //* Array vacío
      },
    ];

    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(true);
    ConsultaProyectoRepoMock.obtenerProyectosPorCliente.mockResolvedValue(
      proyectosMock
    );

    //* B. EJECUTAR
    const resultado =
      await servicio.consultarProyectosPorClienteServicio(idCliente);

    //* C. VALIDAR
    expect(resultado).toHaveLength(1);
    expect(resultado[0].consultores).toHaveLength(0);
    expect(resultado[0].consultores).toEqual([]);
  });

  //* ---------------------------- TESTS CONSULTAR PROYECTOS CON MÚLTIPLES CONSULTORES ----------------------------//

  //* ------------------ TEST 10: CAMINO FELIZ ------------------//
  test("Consultar Proyectos - Debe retornar proyectos con múltiples consultores", async () => {
    //* A. PREPARAR
    const idCliente = "550e8400-e29b-41d4-a716-446655440000";

    const proyectosMock: ProyectoConConsultoresDTO[] = [
      {
        codigoProyecto: "proj-team",
        nombreProyecto: "Proyecto con Equipo Grande",
        estadoProyecto: "activo",
        fechaInicioProyecto: "2024-01-01T00:00:00.000Z",
        fechaFinProyecto: "2024-12-31T00:00:00.000Z",
        consultores: [
          { nombre: "Consultor 1", rol: "Tech Lead" },
          { nombre: "Consultor 2", rol: "Developer" },
          { nombre: "Consultor 3", rol: "QA" },
          { nombre: "Consultor 4", rol: "DevOps" },
        ],
      },
    ];

    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(true);
    ConsultaProyectoRepoMock.obtenerProyectosPorCliente.mockResolvedValue(
      proyectosMock
    );

    //* B. EJECUTAR
    const resultado =
      await servicio.consultarProyectosPorClienteServicio(idCliente);

    //* C. VALIDAR
    expect(resultado[0].consultores).toHaveLength(4);
    expect(resultado[0].consultores[0].nombre).toBe("Consultor 1");
    expect(resultado[0].consultores[3].rol).toBe("DevOps");
  });

  //* ---------------------------- TESTS CONSULTAR PROYECTOS CON CONSULTORES SIN ROL ----------------------------//

  //* ------------------ TEST 11: CAMINO FELIZ ------------------//
  test("Consultar Proyectos - Debe retornar consultores con rol null si no tienen rol asignado", async () => {
    //* A. PREPARAR
    const idCliente = "550e8400-e29b-41d4-a716-446655440000";

    const proyectosMock: ProyectoConConsultoresDTO[] = [
      {
        codigoProyecto: "proj-sin-roles",
        nombreProyecto: "Proyecto con Consultores sin Rol",
        estadoProyecto: "activo",
        fechaInicioProyecto: "2024-01-01T00:00:00.000Z",
        fechaFinProyecto: null,
        consultores: [
          { nombre: "Consultor A", rol: null }, //* Sin rol
          { nombre: "Consultor B", rol: "Developer" }, //* Con rol
        ],
      },
    ];

    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(true);
    ConsultaProyectoRepoMock.obtenerProyectosPorCliente.mockResolvedValue(
      proyectosMock
    );

    //* B. EJECUTAR
    const resultado =
      await servicio.consultarProyectosPorClienteServicio(idCliente);

    //* C. VALIDAR
    expect(resultado[0].consultores[0].rol).toBeNull();
    expect(resultado[0].consultores[1].rol).toBe("Developer");
  });

  //* ---------------------------- TESTS CLIENTE SIN PROYECTOS ----------------------------//

  //* ------------------ TEST 12: CAMINO FELIZ ------------------//
  test("Consultar Proyectos - Debe retornar array vacío si el cliente no tiene proyectos", async () => {
    //* A. PREPARAR
    const idCliente = "550e8400-e29b-41d4-a716-446655440000";

    //* Cliente existe pero no tiene proyectos
    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(true);
    ConsultaProyectoRepoMock.obtenerProyectosPorCliente.mockResolvedValue([]);

    //* B. EJECUTAR
    const resultado =
      await servicio.consultarProyectosPorClienteServicio(idCliente);

    //* C. VALIDAR
    expect(resultado).toEqual([]);
    expect(resultado).toHaveLength(0);
    expect(
      ConsultaProyectoRepoMock.obtenerProyectosPorCliente
    ).toHaveBeenCalled();
  });
});