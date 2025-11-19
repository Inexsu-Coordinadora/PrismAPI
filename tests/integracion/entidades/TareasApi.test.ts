import request from "supertest";
import { app } from "../../../src/core/presentacion/app";

//* 1. MOCK del Servicio (ITareasCasosUso)
jest.mock("../../../src/core/aplicacion/casos-uso/entidades/TareaCasosUso", () => {
return {
    TareasCasosUso: jest.fn().mockImplementation(() => ({
    
      //* Simulamos 'crearTarea'
    crearTarea: jest.fn().mockImplementation((tarea) => {
        return "nueva-id-123"; //* Simula éxito devolviendo un ID
    }),

      //* Simulamos 'obtenerTareaPorId'
    obtenerTareaPorId: jest.fn().mockImplementation((id) => {
        if (id === "id-inexistente") {
          return null; //* Simulamos que no encontró nada (el controlador lanzará el error)
        }
        return { idTarea: id, tituloTarea: "Tarea Test", descripcionTarea: "Descripción" }; //* Simula éxito
    }),

      //*  agregar mocks para listar, actualizar y eliminar 
    })),
};
});

describe("Pruebas de Integración - API Tareas", () => {

beforeAll(async () => {
    await app.ready();
});

afterAll(async () => {
    await app.close();
});

  //* --- CASO 1: CREAR (Happy Path) ---
test("POST /api/tareas - Debe crear una tarea correctamente (201)", async () => {
    const response = await request(app.server)
    .post("/api/tareas")
    .send({
        // DATOS VÁLIDOS (Ajusta según tu TareaDTO real)
        tituloTarea: "Comprar leche",
        descripcionTarea: "Ir al supermercado",
        estadoTarea: "pendiente",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("idNuevaTarea", "nueva-id-123");
});

  //* --- CASO 2: VALIDACIÓN (Error 400) ---
test("POST /api/tareas - Debe devolver 400 si faltan datos obligatorios", async () => {
    const response = await request(app.server)
    .post("/api/tareas")
    .send({
        //* Enviamos un objeto vacío para que Zod falle
    });

    //* Verificamos que el Manejador Global atrapó el error de Zod
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("mensaje", "Error de validación");
    expect(response.body).toHaveProperty("detalles");
});

  //* --- CASO 3: NO ENCONTRADO (Error 404) ---
test("GET /api/tareas/:id - Debe devolver 404 si la tarea no existe", async () => {
    // Usamos el ID que configuramos en el mock para devolver null
    const response = await request(app.server).get("/api/tareas/id-inexistente");

    //* Verificamos que el controlador lanzó 'throw new NotFoundError' 
    //* y el Manejador Global respondió con 404
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
    mensaje: "Tarea no encontrada",
    });
});
});