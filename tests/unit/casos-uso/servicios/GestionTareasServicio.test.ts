import {
  CrearTareaServicioDTO,
  ActualizarTareaServicioDTO,
} from "../../../../src/core/presentacion/esquemas/servicios/gestionTareasEsquema";
import { GestionTareasServicio } from "../../../../src/core/aplicacion/casos-uso/servicios/GestionTareasServicio";

import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../../../src/common/errores/AppError";

describe("Pruebas unitarias GestionTareasServicio", () => {
  let TareaRepoMock: any;
  let ProyectoRepoMock: any;
  let ConsultorRepoMock: any;
  let AsignacionRepoMock: any;

  let servicio: GestionTareasServicio;

  beforeEach(() => {
    TareaRepoMock = {
      crearTarea: jest.fn(),
      obtenerTareasPorProyecto: jest.fn(),
      obtenerTareaDeProyectoPorId: jest.fn(),
      actualizarTarea: jest.fn(),
      eliminarTarea: jest.fn(),
      buscarPorTituloYProyecto: jest.fn(),
    };

    ProyectoRepoMock = {
      obtenerProyectoPorId: jest.fn(),
    };

    ConsultorRepoMock = {
      obtenerConsultorPorId: jest.fn(),
    };

    AsignacionRepoMock = {
      obtenerAsignacionExistente: jest.fn(),
    };

    servicio = new GestionTareasServicio(
      TareaRepoMock,
      ProyectoRepoMock,
      ConsultorRepoMock,
      AsignacionRepoMock
    );
  });

  //* ---------------------------- TESTS CREAR TAREA ----------------------------//

  //* ------------------ TEST 1: CAMINO FELIZ ------------------//
  test("Crear Tarea - Debe retornar el ID si todo es válido", async () => {
    //* A. PREPARAR DATOS (ARRANGE)
    const idProyecto = "proyecto-1";
    const datosTarea: CrearTareaServicioDTO = {
      tituloTarea: "Tarea Simple",
      descripcionTarea: "Prueba",
      fechaLimiteTarea: new Date(),
      estadoTarea: "pendiente",
      idConsultorAsignado: "consultor-1",
    };

    //* 1. El proyecto existe
    ProyectoRepoMock.obtenerProyectoPorId.mockResolvedValue({
      idProyecto: "proyecto-1",
    });
    //* 2. El consultor existe
    ConsultorRepoMock.obtenerConsultorPorId.mockResolvedValue({
      idConsultor: "consultor-1",
    });
    //* 3. No hay tarea duplicada (retorna null)
    TareaRepoMock.buscarPorTituloYProyecto.mockResolvedValue(null);
    //* 4. El consultor sí está asignado al proyecto
    AsignacionRepoMock.obtenerAsignacionExistente.mockResolvedValue({
      idAsignacion: "asig-1",
    });
    //* 5. El repositorio crea la tarea y devuelve un ID
    TareaRepoMock.crearTarea.mockResolvedValue("nueva-id-123");

    //* B. EJECUTAR (ACT)
    const resultado = await servicio.crearTareaEnProyecto(
      idProyecto,
      datosTarea
    );

    //* C. VALIDAR (ASSERT)
    expect(TareaRepoMock.crearTarea).toHaveBeenCalled(); //* Se llamó a crear?
    expect(resultado).toBe("nueva-id-123"); //* ¿Devolvió el ID correcto?
  });

  //* ------------------ TEST 2: ERROR (Proyecto no existe) ------------------//
  test("Crear Tarea - Debe fallar si el proyecto no existe", async () => {
    //* A. PREPARAR
    //* Programamos que el repositorio diga "null" (no encontró proyecto)
    ProyectoRepoMock.obtenerProyectoPorId.mockResolvedValue(null);

    const datosTarea: CrearTareaServicioDTO = {
      tituloTarea: "Tarea para fallar por proyecto que no existe",
      estadoTarea: "pendiente",
    };
    //* B. EJECUTAR Y VALIDAR (Error y que NO se llamó a crearTarea)
    await expect(
      servicio.crearTareaEnProyecto("id-proyecto-falso", datosTarea)
    ).rejects.toThrow(NotFoundError);
    expect(TareaRepoMock.crearTarea).not.toHaveBeenCalled();
  });

  //* ------------------ TEST 3: ERROR (Consultor no asignado) ------------------//
  test("Crear Tarea - Debe fallar si el consultor no está en el proyecto", async () => {
    //* A. PREPARAR
    ProyectoRepoMock.obtenerProyectoPorId.mockResolvedValue({
      idProyecto: "proyecto-1",
    });
    ConsultorRepoMock.obtenerConsultorPorId.mockResolvedValue({
      idConsultor: "consultor-1",
    });
    TareaRepoMock.buscarPorTituloYProyecto.mockResolvedValue(null);
    //* Aquí está la clave: El repo de asignación dice no hay asignación "null"
    AsignacionRepoMock.obtenerAsignacionExistente.mockResolvedValue(null);

    const datosTarea = {
      tituloTarea: "Tarea para fallar por consultor no asignado",
      estadoTarea: "pendiente",
      idProyecto: "proyecto-1",
      idConsultorAsignado: "consultor-1",
    } as any;

    //* B. EJECUTAR Y VALIDAR
    await expect(
      servicio.crearTareaEnProyecto("proyecto-1", datosTarea)
    ).rejects.toThrow(/no está asignado/);
  });

  //* ------------------ TEST 4: ERROR (Fecha fuera de rango) ------------------//
  test("Crear Tarea - Debe fallar si la fecha límite está fuera de rango", async () => {
    //* A. PREPARAR
    //* 1. El proyecto termina en 2023
    ProyectoRepoMock.obtenerProyectoPorId.mockResolvedValue({
      idProyecto: "proyecto-1",
      fechaFinProyecto: new Date("2023-12-31"),
    });
    ConsultorRepoMock.obtenerConsultorPorId.mockResolvedValue({
      idConsultor: "consultor-1",
    });
    AsignacionRepoMock.obtenerAsignacionExistente.mockResolvedValue({
      idAsignacion: "asig-1",
    });

    //* 2. Intentamos crear una tarea para 2025
    const datosTarea: CrearTareaServicioDTO = {
      tituloTarea: "Tarea Tardía",
      fechaLimiteTarea: new Date("2025-01-01"),
      estadoTarea: "pendiente",
      idConsultorAsignado: "consultor-1",
    };

    //* B. EJECUTAR Y VALIDAR
    await expect(
      servicio.crearTareaEnProyecto("proyecto-1", datosTarea)
    ).rejects.toThrow(ValidationError);
  });

  //* ------------------ TEST 5: ERROR (Tarea duplicada) ------------------//
  test("Crear Tarea - Debe fallar si ya existe una tarea con el mismo título", async () => {
    ProyectoRepoMock.obtenerProyectoPorId.mockResolvedValue({
      idProyecto: "proyecto-1",
    });
    ConsultorRepoMock.obtenerConsultorPorId.mockResolvedValue({
      idConsultor: "consultor-1",
    });
    AsignacionRepoMock.obtenerAsignacionExistente.mockResolvedValue({
      idAsignacion: "asig-1",
    });
    TareaRepoMock.buscarPorTituloYProyecto.mockResolvedValue({
      idTarea: "tarea-vieja-id",
    });

    const datosTarea: CrearTareaServicioDTO = {
      tituloTarea: "Tarea duplicada",
      estadoTarea: "pendiente",
      idConsultorAsignado: "consultor-1",
    };

    //* B. EJECUTAR Y VALIDAR
    await expect(
      servicio.crearTareaEnProyecto("proyecto-1", datosTarea)
    ).rejects.toThrow(ConflictError);
  });



  //* ---------------------------- TESTS ACTUALIZAR TAREA ----------------------------//
  
  //* ------------------ TEST 6: CAMINO FELIZ  ------------------//
    test("Actualizar Tarea - Debe actualizar la tarea si los datos y reglas son correctos", async () => {
    //* A. PREPARAR
    const idTarea = "t-1";
    const idProyecto = "p-1";

    //* Simulamos la tarea actual en BD (Estado 'pendiente')
    const tareaActual = { 
        idTarea, 
        idProyecto, 
        tituloTarea: "Viejo Título", 
        estadoTarea: "pendiente" 
    };
    TareaRepoMock.obtenerTareaDeProyectoPorId.mockResolvedValue(tareaActual);
    
    //* Simulamos el proyecto  
    ProyectoRepoMock.obtenerProyectoPorId.mockResolvedValue({ idProyecto});

    //* Datos para actualizar
    const datosActualizar: ActualizarTareaServicioDTO = { 
        tituloTarea: "Nuevo Título", 
        estadoTarea: "en-progreso" 
    };

    const tareaActualizada = { ...tareaActual, ...datosActualizar };
    TareaRepoMock.actualizarTarea.mockResolvedValue(tareaActualizada);  
    
    //* B. EJECUTAR
    const resultado = await servicio.actualizarTareaEnProyecto(idTarea, idProyecto, datosActualizar);
    
    //* C. VALIDAR  
    expect (TareaRepoMock.actualizarTarea).toHaveBeenCalledWith(idTarea, datosActualizar);
    expect(resultado).toEqual(tareaActualizada);
   });
  
  //* ------------------ TEST 7: ERROR (Regla de Negocio) ------------------//
  test("Actualizar Tarea - Debe fallar si se intenta completar una tarea ya completada", async () => {
    //* A. PREPARAR
    TareaRepoMock.obtenerTareaDeProyectoPorId.mockResolvedValue({
      idTarea: "t-1",
      estadoTarea: "completada",
      idProyecto: "p-1",
    });

    ProyectoRepoMock.obtenerProyectoPorId.mockResolvedValue({
      idProyecto: "p-1",
    });

    const datosActualizar: ActualizarTareaServicioDTO = {
      estadoTarea: "completada",
    };

    //* B. EJECUTAR Y VALIDAR
    await expect(
      servicio.actualizarTareaEnProyecto("t-1", "p-1", datosActualizar)
    ).rejects.toThrow(ConflictError);
  });



  //* ---------------------------- TESTS OBTENER TAREAS POR PROYECTO  ----------------------------//
  //* ------------------ TEST 8 : CAMINO FELIZ ------------------//
  test("Listar Tareas - Debe llamar al repositorio", async () => {
    ProyectoRepoMock.obtenerProyectoPorId.mockResolvedValue({
      idProyecto: "p-1",
    });
    TareaRepoMock.obtenerTareasPorProyecto.mockResolvedValue([]); //* Devuelve lista vacía

    await servicio.obtenerTareasPorProyecto("p-1");

    expect(TareaRepoMock.obtenerTareasPorProyecto).toHaveBeenCalledWith("p-1");
  });

  //* ------------------ TEST 9: ERROR (Proyecto no existe) ------------------//
  test("Listar Tareas - Debe lanzar NotFoundError si el proyecto no existe", async () => {
    //* A. PREPARAR
    //* Simulamos que el proyecto NO existe
    ProyectoRepoMock.obtenerProyectoPorId.mockResolvedValue(null);

    //* B. EJECUTAR Y VALIDAR
    await expect(
      servicio.obtenerTareasPorProyecto("proyecto-inexistente")
    ).rejects.toThrow(NotFoundError);
  });



  //* ---------------------------- TESTS OBTENER TAREAS DE PROYECTO POR ID ----------------------------//
  //* ------------------ TEST 10: CAMINO FELIZ ------------------//
  test("Obtener Tarea por ID - Debe retornar la tarea si existe en el proyecto", async () => {
    //* A. PREPARAR
    const datosTarea = {
      idTarea: "t-1",
      idProyecto: "p-1",
      tituloTarea: "Tarea Encontrada",
    };
    //* El repositorio encuentra la tarea
    TareaRepoMock.obtenerTareaDeProyectoPorId.mockResolvedValue(datosTarea);

    //* B. EJECUTAR
    const resultado = await servicio.obtenerTareaDeProyectoPorId("t-1", "p-1");
    //* C. VALIDAR
    expect(TareaRepoMock.obtenerTareaDeProyectoPorId).toHaveBeenCalledWith(
      "t-1",
      "p-1"
    );
    expect(resultado).toEqual(datosTarea);
  });

  //* ------------------ TEST 11: ERROR (Tarea no encontrada) ------------------//
  test("Obtener Tarea por ID - Debe lanzar NotFoundError si la tarea no existe o no es del proyecto", async () => {
    //* A. PREPARAR
    //* El repositorio no encuentra nada -> null
    TareaRepoMock.obtenerTareaDeProyectoPorId.mockResolvedValue(null);

    //* B. EJECUTAR Y VALIDAR
    await expect(
      servicio.obtenerTareaDeProyectoPorId(
        "tarea-inexistente",
        "proyecto-inexistente"
      )
    ).rejects.toThrow(NotFoundError);
  });



  //* ---------------------------- TESTS ELIMINAR TAREA DE PROYECTO  ----------------------------//
  //* ------------------ TEST 12: CAMINO FELIZ ------------------//
  test("Eliminar Tarea - Debe verificar existencia y eliminar", async () => {
    //* A. PREPARAR
    //* Simulamos que la tarea SÍ existe (para que no lance NotFoundError)
    TareaRepoMock.obtenerTareaDeProyectoPorId.mockResolvedValue({
      idTarea: "t-1",
      idProyecto: "p-1",
    });

    //* B. EJECUTAR
    await servicio.eliminarTareaDeProyecto("t-1", "p-1");

    //* C. VALIDAR
    expect(TareaRepoMock.eliminarTarea).toHaveBeenCalledWith("t-1");
  });

  //* ------------------ TEST 13: ERROR (Tarea no existe) ------------------//
  test("Eliminar Tarea - Debe lanzar NotFoundError si la tarea no existe", async () => {
    //* A. PREPARAR
    //* Simulamos que la tarea NO se encuentra (o no pertenece al proyecto)
    TareaRepoMock.obtenerTareaDeProyectoPorId.mockResolvedValue(null);

    //* B. EJECUTAR Y VALIDAR
    await expect(
      servicio.eliminarTareaDeProyecto("t-fantasma", "p-1")
    ).rejects.toThrow(NotFoundError);
    //* Validar que NO se llamó al método de Eliminar
    expect(TareaRepoMock.eliminarTarea).not.toHaveBeenCalled();
  });
});
