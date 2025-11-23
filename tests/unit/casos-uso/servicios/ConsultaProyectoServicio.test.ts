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
    
    ConsultaProyectoRepoMock = {
      obtenerProyectosPorCliente: jest.fn(),
      existeCliente: jest.fn(),
    };


    servicio = new ConsultarProyectosPorClienteServicio(
      ConsultaProyectoRepoMock
    );
  });

  
  test("Consultar Proyectos - Debe retornar proyectos sin filtros si el cliente existe", async () => {
    
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

    
    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(true);
    
    ConsultaProyectoRepoMock.obtenerProyectosPorCliente.mockResolvedValue(
      proyectosMock
    );

   
    const resultado =
      await servicio.consultarProyectosPorClienteServicio(idCliente);

  
    expect(ConsultaProyectoRepoMock.existeCliente).toHaveBeenCalledWith(
      idCliente
    );
    expect(
      ConsultaProyectoRepoMock.obtenerProyectosPorCliente
    ).toHaveBeenCalledWith(idCliente, undefined);
    expect(resultado).toEqual(proyectosMock);
    expect(resultado).toHaveLength(2);
  });

  
  test("Consultar Proyectos - Debe lanzar NotFoundError si el cliente no existe", async () => {
  
    const idClienteInexistente = "999e8400-e29b-41d4-a716-446655440099";
    
    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(false);

    await expect(
      servicio.consultarProyectosPorClienteServicio(idClienteInexistente)
    ).rejects.toThrow(NotFoundError);
    await expect(
      servicio.consultarProyectosPorClienteServicio(idClienteInexistente)
    ).rejects.toThrow("Cliente no encontrado");

    
    expect(
      ConsultaProyectoRepoMock.obtenerProyectosPorCliente
    ).not.toHaveBeenCalled();
  });

  
  test("Consultar Proyectos - Debe retornar proyectos filtrados por estado 'activo'", async () => {
    
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

    const resultado = await servicio.consultarProyectosPorClienteServicio(
      idCliente,
      filtros
    );

    expect(
      ConsultaProyectoRepoMock.obtenerProyectosPorCliente
    ).toHaveBeenCalledWith(idCliente, filtros);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].estadoProyecto).toBe("activo");
  });

  test("Consultar Proyectos - Debe retornar proyectos filtrados por estado 'finalizado'", async () => {

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

    const resultado = await servicio.consultarProyectosPorClienteServicio(
      idCliente,
      filtros
    );

    expect(resultado[0].estadoProyecto).toBe("finalizado");
  });

  
  test("Consultar Proyectos - Debe retornar proyectos filtrados por fecha de inicio", async () => {
   
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

 
    const resultado = await servicio.consultarProyectosPorClienteServicio(
      idCliente,
      filtros
    );


    expect(
      ConsultaProyectoRepoMock.obtenerProyectosPorCliente
    ).toHaveBeenCalledWith(idCliente, filtros);
    expect(resultado).toEqual(proyectosMock);
  });

  
  test("Consultar Proyectos - Debe retornar proyectos filtrados por fecha de fin", async () => {
 
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

   
    const resultado = await servicio.consultarProyectosPorClienteServicio(
      idCliente,
      filtros
    );

    expect(resultado).toHaveLength(1);
    expect(resultado[0].fechaFinProyecto).toBe("2024-11-30T00:00:00.000Z");
  });


  test("Consultar Proyectos - Debe retornar proyectos con todos los filtros aplicados", async () => {
  
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

    const resultado = await servicio.consultarProyectosPorClienteServicio(
      idCliente,
      filtros
    );

    expect(ConsultaProyectoRepoMock.existeCliente).toHaveBeenCalledWith(
      idCliente
    );
    expect(
      ConsultaProyectoRepoMock.obtenerProyectosPorCliente
    ).toHaveBeenCalledWith(idCliente, filtros);
    expect(resultado).toEqual(proyectosMock);
    expect(resultado[0].consultores).toHaveLength(2);
  });

  
  test("Consultar Proyectos - Debe lanzar ValidationError si fecha inicio > fecha fin", async () => {
    
    const idCliente = "550e8400-e29b-41d4-a716-446655440000";
    const filtros: FiltrosConsultaProyectos = {
      fechaInicioProyecto: "2024-12-31", 
      fechaFinProyecto: "2024-01-01", 
    };

    
    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(true);

    
    await expect(
      servicio.consultarProyectosPorClienteServicio(idCliente, filtros)
    ).rejects.toThrow(ValidationError);
    await expect(
      servicio.consultarProyectosPorClienteServicio(idCliente, filtros)
    ).rejects.toThrow(/rango de fechas es inválido/);

    
    expect(
      ConsultaProyectoRepoMock.obtenerProyectosPorCliente
    ).not.toHaveBeenCalled();
  });

  
  test("Consultar Proyectos - Debe retornar proyectos sin consultores asignados", async () => {
   
    const idCliente = "550e8400-e29b-41d4-a716-446655440000";

    const proyectosMock: ProyectoConConsultoresDTO[] = [
      {
        codigoProyecto: "proj-solo",
        nombreProyecto: "Proyecto Sin Consultores",
        estadoProyecto: "pendiente",
        fechaInicioProyecto: "2024-05-01T00:00:00.000Z",
        fechaFinProyecto: null,
        consultores: [], 
      },
    ];

    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(true);
    ConsultaProyectoRepoMock.obtenerProyectosPorCliente.mockResolvedValue(
      proyectosMock
    );

    const resultado =
      await servicio.consultarProyectosPorClienteServicio(idCliente);

    
    expect(resultado).toHaveLength(1);
    expect(resultado[0].consultores).toHaveLength(0);
    expect(resultado[0].consultores).toEqual([]);
  });

  
  test("Consultar Proyectos - Debe retornar proyectos con múltiples consultores", async () => {
    
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

    const resultado =
      await servicio.consultarProyectosPorClienteServicio(idCliente);

    
    expect(resultado[0].consultores).toHaveLength(4);
    expect(resultado[0].consultores[0].nombre).toBe("Consultor 1");
    expect(resultado[0].consultores[3].rol).toBe("DevOps");
  });

  
  test("Consultar Proyectos - Debe retornar consultores con rol null si no tienen rol asignado", async () => {
   
    const idCliente = "550e8400-e29b-41d4-a716-446655440000";

    const proyectosMock: ProyectoConConsultoresDTO[] = [
      {
        codigoProyecto: "proj-sin-roles",
        nombreProyecto: "Proyecto con Consultores sin Rol",
        estadoProyecto: "activo",
        fechaInicioProyecto: "2024-01-01T00:00:00.000Z",
        fechaFinProyecto: null,
        consultores: [
          { nombre: "Consultor A", rol: null }, 
          { nombre: "Consultor B", rol: "Developer" }, 
        ],
      },
    ];

    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(true);
    ConsultaProyectoRepoMock.obtenerProyectosPorCliente.mockResolvedValue(
      proyectosMock
    );

    
    const resultado =
      await servicio.consultarProyectosPorClienteServicio(idCliente);

   
    expect(resultado[0].consultores[0].rol).toBeNull();
    expect(resultado[0].consultores[1].rol).toBe("Developer");
  });

  
  test("Consultar Proyectos - Debe retornar array vacío si el cliente no tiene proyectos", async () => {
   
    const idCliente = "550e8400-e29b-41d4-a716-446655440000";

    
    ConsultaProyectoRepoMock.existeCliente.mockResolvedValue(true);
    ConsultaProyectoRepoMock.obtenerProyectosPorCliente.mockResolvedValue([]);

    const resultado =
      await servicio.consultarProyectosPorClienteServicio(idCliente);

   
    expect(resultado).toEqual([]);
    expect(resultado).toHaveLength(0);
    expect(
      ConsultaProyectoRepoMock.obtenerProyectosPorCliente
    ).toHaveBeenCalled();
  });
});