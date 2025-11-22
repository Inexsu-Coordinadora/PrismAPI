import request from "supertest";
import { app } from "../../../src/core/presentacion/app"; 

//* --- 1. CONFIGURACIÓN DEL MOCK (Simulamos el Servicio) ---
jest.mock("../../../src/core/aplicacion/casos-uso/entidades/TareaCasosUso", () => {
return {
    TareasCasosUso: jest.fn().mockImplementation(() => ({
    
      //* CREAR TAREA
    crearTarea: jest.fn().mockImplementation((tarea) => {
        return "nueva-id-123";
    }),

    //* LISTAR TAREAS
    listarTareas: jest.fn().mockResolvedValue([
      { idTarea: "t-1", tituloTarea: "Tarea 1", estadoTarea: "pendiente" },
      { idTarea: "t-2", tituloTarea: "Tarea 2", estadoTarea: "pendiente" }
    ]),

    //* OBTENER TAREA POR ID
    obtenerTareaPorId: jest.fn().mockImplementation((id) => { 
      if (id === "id-inexistente") {
        return null;
      } 
        return { idTarea: id, tituloTarea: "Tarea 1", estadoTarea: "pendiente" };
    }),

    //* ACTUALIZAR TAREA
    actualizarTarea: jest.fn().mockImplementation((id, tareaActualizada) => {
      if (id === "id-inexistente") {
        return null;
      }
      return { idTarea: id, ...tareaActualizada };
    }),

    //* ELIMINAR TAREA
    eliminarTarea: jest.fn().mockResolvedValue(undefined)
    })),
};
});

describe("Pruebas de Integración - API Tareas (Entidad)", () => {

beforeAll(async () => {
    await app.ready();
});

afterAll(async () => {
    await app.close();
});

//* ---------------------------- TESTS CREAR TAREA (POST) ----------------------------//

//* ------------------ TEST 1: CAMINO FELIZ ------------------//
test("POST /api/tareas - Debe crear una tarea correctamente (201)", async () => {
    const response = await request(app.server)
    .post("/api/tareas")
    .send({
        tituloTarea: "Tarea válida",
        descripcionTarea: "Descripción válida",
        estadoTarea: "pendiente",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("idNuevaTarea", "nueva-id-123");
});

//* ------------------ TEST 2: ERROR 400 - Validación (Zod) ------------------//
test("POST /api/tareas - Debe devolver 400 si faltan datos obligatorios", async () => {
    const response = await request(app.server)
    .post("/api/tareas")
    .send({}); //* Enviamos un body vacío para provocar el error


    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("mensaje", "Error de validación");
    expect(response.body).toHaveProperty("detalles");
});



//* ---------------------------- TESTS LISTAR TAREAS (GET) ----------------------------//
//* ------------------ TEST 3: CAMINO FELIZ ------------------//
test("GET /api/tareas - 200 Debe retornar la lista de tareas", async () => {
    const response = await request(app.server).get("/api/tareas");
    
    expect(response.status).toBe(200);
    expect(response.body.tareas).toHaveLength(2);
    expect(response.body.total).toBe(2);
  });


//* ----------------------------TESTS  OBTENER TAREA POR ID (GET) ----------------------------//  
  //* ------------------ TEST 4: CAMINO FELIZ ------------------//
  test("GET /api/tareas/:id - 200 Debe devolver la tarea encontrada", async () => {
    const response = await request(app.server).get("/api/tareas/t-1");
    
    expect(response.status).toBe(200);
    expect(response.body.tarea).toHaveProperty("tituloTarea", "Tarea 1");
  });

  //* ------------------ TEST 5: ERROR 404 - Tarea no encontrada ------------------//
test("GET /api/tareas/:id - Debe devolver 404 si la tarea no existe", async () => {
    const response = await request(app.server).get("/api/tareas/id-inexistente");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ mensaje: "Tarea no encontrada"});
});

//* ---------------------------- TESTS ACTUALIZAR TAREA (PUT)----------------------------//
  //* ------------------ TEST 6: CAMINO FELIZ ------------------//
  test("PUT /api/tareas/:id - 200 Debe actualizar la tarea correctamente", async () => {
    const response = await request(app.server)
      .put("/api/tareas/t-1")
      .send({
        tituloTarea: "Título Editado",
        estadoTarea: "en-progreso"
      });

    expect(response.status).toBe(200);
    expect(response.body.tareaActualizada).toHaveProperty("tituloTarea", "Título Editado");
  });

  //* ------------------ TEST 7: ERROR 404 - Tarea no encontrada ------------------//
  test("PUT /api/tareas/:id - 404 Debe devolver error si la tarea a actualizar no existe", async () => {
    const response = await request(app.server)
      .put("/api/tareas/id-inexistente")
      .send({
        tituloTarea: "Intento Fallido"
      });

    expect(response.status).toBe(404);
    expect(response.body.mensaje).toBe("Tarea no encontrada para actualizar");
  });

//* ---------------------------- TESTS ELIMINAR TAREA (DELETE) ----------------------------//
//* ------------------ TEST 8: CAMINO FELIZ ------------------//
test("DELETE /api/tareas/:id - 200 Debe eliminar la tarea correctamente", async () => {
    const response = await request(app.server).delete("/api/tareas/t-1");
    
    expect(response.status).toBe(200);
    expect(response.body.mensaje).toMatch(/eliminada correctamente/);
  });
//* ------------------ TEST 9: ERROR 404 - Eliminar tarea inexistente ------------------//
  test("DELETE /api/tareas/:id - 404 Debe devolver error si la tarea a eliminar no existe", async () => {
    const response = await request(app.server).delete("/api/tareas/id-inexistente");
    
    expect(response.status).toBe(404);
 
    expect(response.body.mensaje).toMatch(/Tarea no encontrada/);
  });
});