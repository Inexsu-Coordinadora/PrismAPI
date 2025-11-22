import { TareasCasosUso } from "../../../../src/core/aplicacion/casos-uso/entidades/TareaCasosUso";
import { TareaDTO } from "../../../../src/core/presentacion/esquemas/entidades/tareaEsquema";

describe("Pruebas Unitarias - TareasCasosUso (Entidad)", () => {
    let mockRepo: any;
    let servicio: TareasCasosUso;

    beforeEach(() => {  
        mockRepo = {
            crearTarea: jest.fn(),
            listarTareas: jest.fn(),
            obtenerTareaPorId: jest.fn(),
            actualizarTarea: jest.fn(),
            eliminarTarea: jest.fn(),
            };

        servicio = new TareasCasosUso(mockRepo);

        });

        //* ------------------ TEST 1: CREAR TAREA ------------------//
        test("crearTarea - Debe llamar al repositorio y devolver el ID", async () => {
             //* A. PREPARAR DATOS (ARRANGE)
            const datosTarea: TareaDTO = {
                tituloTarea: "Tarea 1",
                estadoTarea: "pendiente",
                descripcionTarea: "Descripción de la tarea"
            };
            mockRepo.crearTarea.mockResolvedValue("id-nuevo-123")

            //* B. EJECUTAR (ACT)
            const resultado = await servicio.crearTarea(datosTarea);

            //* C. VALIDAR (ASSERT)
            expect(mockRepo.crearTarea).toHaveBeenCalledWith(datosTarea);
            expect(resultado).toBe("id-nuevo-123"); 
    });

    //* ------------------ TEST 2: LISTAR TAREAS ------------------//
    test("obtenerTareas - Debe llamar al repositorio y devolver una lista de tareas", async () => {
        //* A. PREPARAR DATOS (ARRANGE) 
        const listaSimulada = [{ idTarea: "1", tituloTarea: "T1" }, { idTarea: "2", tituloTarea: "T2" }];
        mockRepo.listarTareas.mockResolvedValue(listaSimulada);
         //* B. EJECUTAR (ACT)
         const resultado = await servicio.listarTareas(10);
         //* C. VALIDAR (ASSERT)    
        expect(mockRepo.listarTareas).toHaveBeenCalledWith(10);
        expect(resultado).toEqual(listaSimulada);
  });


  //* ------------------ TEST 3: OBTENER TAREA POR ID  (Tarea encontrada)------------------//
  test("obtenerTareaPorId - Debe llamar al repositorio y devolver una tarea", async () => {
    //* A. PREPARAR DATOS (ARRANGE) 
    const tareaSimulada = { idTarea: "t-1", tituloTarea: "Titulo de la tarea" };
    mockRepo.obtenerTareaPorId.mockResolvedValue(tareaSimulada);
     //* B. EJECUTAR (ACT)  
     const resultado = await servicio.obtenerTareaPorId("t-1");
     //* C. VALIDAR (ASSERT)
     expect(mockRepo.obtenerTareaPorId).toHaveBeenCalledWith("t-1");
     expect(resultado).toEqual(tareaSimulada);  
}); 

//* ------------------ TEST 4: OBTENER TAREA POR ID  (Tarea NO encontrada)------------------//
test("obtenerTareaPorId - Debe devolver null si no existe", async () => {
    //* A. PREPARAR DATOS (ARRANGE) 
    mockRepo.obtenerTareaPorId.mockResolvedValue(null); 
    //* B. EJECUTAR (ACT)
    const resultado = await servicio.obtenerTareaPorId("id-fantasma");
    //* C. VALIDAR (ASSERT)
    expect(mockRepo.obtenerTareaPorId).toHaveBeenCalledWith("id-fantasma");
    expect(resultado).toBeNull();   
  });

  //* ------------------ TEST 5: ELIMINAR TAREA ------------------//
  test("eliminarTarea - Debe llamar al método eliminar del repositorio", async () => {
    //* A. PREPARAR DATOS (ARRANGE) 
    mockRepo.eliminarTarea.mockResolvedValue(undefined);
    //* B. EJECUTAR (ACT)
    await servicio.eliminarTarea("id-tarea-123");
    //* C. VALIDAR (ASSERT)
    expect(mockRepo.eliminarTarea).toHaveBeenCalledWith("id-tarea-123");    
  });
  });