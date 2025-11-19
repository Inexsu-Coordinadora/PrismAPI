import request from "supertest";
import { app } from "../../../src/core/presentacion/app";
import { NotFoundError } from "../../../src/common/errores/AppError";


// MOCK: Simulamos el Servicio para controlar sus fallos
jest.mock("../../../src/core/aplicacion/casos-uso/servicios/GestionTareasServicio", () => {
return {
    GestionTareasServicio: jest.fn().mockImplementation(() => ({
      // Simulamos el método crearTareaEnProyecto
    crearTareaEnProyecto: jest
        .fn()
        .mockImplementation((idProyecto, tarea) => {
        if (idProyecto === "proyecto-inexistente") {
            throw new NotFoundError("El proyecto no existe");
        }
          return "nueva-tarea-id-123"; // Caso éxito simulado
        }),
    })),
};
});

describe("Pruebas de Integración - Gestión Tareas (Manejo de Errores)", () => {
beforeAll(async () => {
    await app.ready(); // Esperamos a que Fastify cargue plugins y rutas
});

afterAll(async () => {
    await app.close();
});

  //* CASO 1: Validación de Zod (Debe devolver 400)
test("POST /api/proyectos/:id/tareas - Debe devolver 400 si faltan datos (Zod)", async () => {
    const response = await request(app.server)
    .post("/api/proyectos/123/tareas")
    .send({
        //* Enviamos un body vacío para provocar el error
    });

    //* Verificamos que el Manejador de Errores interceptó el ZodError
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("mensaje", "Error de validación");
    expect(response.body).toHaveProperty("detalles"); //* Nuestro manejador agrega 'detalles'
});

  //* CASO 2: Error de Negocio / No Encontrado (Debe devolver 404)
test("POST /api/proyectos/:id/tareas - Debe devolver 404 si el servicio lanza NotFoundError", async () => {
    const response = await request(app.server)
      .post("/api/proyectos/proyecto-inexistente/tareas") // Usamos el ID que configuramos en el mock para fallar
    .send({
        tituloTarea: "Tarea válida",
        descripcionTarea: "Descripción válida",
        estadoTarea: "pendiente",


        // Agrega aquí los campos obligatorios mínimos de tu CrearTareaServicioDTO
        // para que pase la validación de Zod y llegue al servicio
    });

    // Verificamos que el controlador dejó pasar el error y el Manejador global respondió 404
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
    mensaje: "El proyecto no existe",
    });
});
});
