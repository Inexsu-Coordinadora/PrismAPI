import request from "supertest";
import { app } from "../../../src/core/presentacion/app";
import { ConflictError, NotFoundError } from "../../../src/common/errores/AppError";


//* --- 1. CONFIGURACIÓN DEL MOCK (Simulamos el Servicio) ---
jest.mock("../../../src/core/aplicacion/casos-uso/servicios/GestionTareasServicio", () => {
return {
    GestionTareasServicio: jest.fn().mockImplementation(() => ({
     
     
      //* CREAR: Simula éxito o error de proyecto inexistente
    crearTareaEnProyecto: jest
        .fn()
        .mockImplementation((idProyecto, tarea) => {
        if (idProyecto === "proyecto-inexistente") {
            throw new NotFoundError("El proyecto no existe");
        }
          return "nueva-tarea-id-123";
        }),

        //* LISTAR: Simula devolver una lista fija
        obtenerTareasPorProyecto: jest.fn().mockResolvedValue([
        { idTarea: "t-1", tituloTarea: "Tarea 1", descripcionTarea: "Descripción 1", estadoTarea: "pendiente" },
        { idTarea: "t-2", tituloTarea: "Tarea 2", descripcionTarea: "Descripción 2", estadoTarea: "en-progreso"}
        ]),

        //* OBTENER POR ID: Simula éxito o error 404
        obtenerTareaDeProyectoPorId: jest.fn().mockImplementation((idTarea, idProyecto) => {
        if (idTarea === "t-inexistente") {
            throw new NotFoundError("Tarea no encontrada");
        }
        return { id: idTarea,  idProyecto, titulo: "Tarea encontrada"};
        }),

        //* ACTUALIZAR: Simula éxito o conflicto (regla de negocio)
        actualizarTareaEnProyecto: jest.fn().mockImplementation((idTarea, idProyecto, datosTarea) => {
          if (idTarea === "tarea-ya-completada" && datosTarea.estadoTarea === "completada"){
            throw new ConflictError("La tarea ya se encuentra completada.");
          }
          if (idTarea === "t-fantasma"){
            throw new NotFoundError("Tarea no encontrada");
          }
          return  { id: idTarea, ...datosTarea };
         }),

         //* ELIMINAR: Simula éxito o error
         eliminarTareaDeProyecto: jest.fn().mockImplementation((idTarea) => { 
          if (idTarea === "t-inexistente"){
            throw new NotFoundError("Tarea no encontrada");
          }
          return; //* <- void (éxito)
          }),
    })),
};
});

describe("Pruebas de Integración - API Gestión Tareas", () => {
beforeAll(async () => {
    await app.ready();
});

afterAll(async () => {
    await app.close();
});

//* ---------------------------- TESTS CREAR TAREA (POST) ----------------------------//

//* ------------------ TEST 1: CAMINO FELIZ ------------------//
test("POST /api/proyectos/:idProy/tareas - 201 Tarea creada exitosamente", async () => { 
    const response = await request(app.server)
    .post("/api/proyectos/proy-1/tareas")
    .send({
        tituloTarea: "Tarea válida",
        descripcionTarea: "Descripción válida",
        estadoTarea: "pendiente",
    });
    expect(response.status).toBe(201); 
    expect(response.body).toHaveProperty("idNuevaTarea", "nueva-tarea-id-123");
  });

//* ------------------ TEST 2: ERROR 400 - Validación (Zod) ------------------//
test("POST /api/proyectos/:idProy/tareas - 400 Error de Validación (Zod)", async () => {
    const response = await request(app.server)
    .post("/api/proyectos/proy-1/tareas")
    .send({}); //* Enviamos un body vacío para provocar el error
    expect(response.status).toBe(400);
    expect(response.body.mensaje).toBe("Error de validación");
    expect(response.body).toHaveProperty("detalles");
  });

  //* ------------------ TEST 3: ERROR 404 - Proyecto no existe ------------------//
  test("POST /api/proyectos/:idProy/tareas - 404 El servicio no encuentra el proyecto", async () => { 
    const response = await request(app.server)
    .post("/api/proyectos/proyecto-inexistente/tareas")
    .send({ 
        tituloTarea: "Tarea válida",
        estadoTarea: "pendiente",
   });
    expect(response.status).toBe(404);
    expect(response.body.mensaje).toBe("El proyecto no existe");
});



//* ---------------------------- TESTS LISTAR TAREAS (GET) ----------------------------//
//* ------------------ TEST 4: CAMINO FELIZ ------------------//
test("GET  /api/proyectos/:idProy/tareas - 200 Retorna lista de tareas", async () => {
    const response = await request(app.server)
    .get("/api/proyectos/proy-1/tareas");


    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("tareas");
    expect(response.body.tareas).toHaveLength(2);
});

//* ---------------------------- TESTS OBTENER TAREA POR ID (GET)----------------------------//
//* ------------------ TEST 5: CAMINO FELIZ ------------------//
test("GET  /api/proyectos/:idProy/tareas/:idTarea - 200 Retorna la tarea encontrada", async () => {
    const response = await request(app.server)
    .get("/api/proyectos/proy-1/tareas/t-1"); 
    expect(response.status).toBe(200);
    expect(response.body.tarea).toHaveProperty("titulo", "Tarea encontrada");
});

//* ------------------ TEST 6: ERROR 404 - Tarea no encontrada ------------------//

test("GET  /api/proyectos/:idProy/tareas/:idTarea - 404 Tarea no encontrada", async () => {
    const response = await request(app.server)
    .get("/api/proyectos/proy-1/tareas/t-inexistente"); 
    expect(response.status).toBe(404);
    expect(response.body.mensaje).toBe("Tarea no encontrada");
});

//* ---------------------------- TESTS ACTUALIZAR TAREA (PUT)----------------------------//
//* ------------------ TEST 7: CAMINO FELIZ ------------------//
test("PUT  /api/proyectos/:idProy/tareas/:idTarea - 200 Tarea actualizada exitosamente", async () => {
    const response = await request(app.server)
    .put("/api/proyectos/proy-1/tareas/t-1")
    .send({
        tituloTarea: "Tarea actualizada",
        descripcionTarea: "Descripción actualizada",
        estadoTarea: "completada",
    });

    expect(response.status).toBe(200);
    expect(response.body.tareaActualizada).toHaveProperty("tituloTarea", "Tarea actualizada");

});

//* ------------------ TEST 8: ERROR (Regla de Negocio) ------------------//
test("PUT  /api/proyectos/:idProy/tareas/:idTarea - 409 La tarea ya se encuentra completada.", async () => {
    const response = await request(app.server)
    .put("/api/proyectos/proy-1/tareas/tarea-ya-completada")
    .send({
        tituloTarea: "Tarea actualizada",
        estadoTarea: "completada",
    });   

    expect(response.status).toBe(409);
    expect(response.body.mensaje).toBe("La tarea ya se encuentra completada.");
});



//* ---------------------------- TESTS ELIMINAR TAREA (DELETE) ----------------------------//
//* ------------------ TEST 9: CAMINO FELIZ ------------------//
test("DELETE  /api/proyectos/:idProy/tareas/:idTarea - 200 Tarea eliminada exitosamente", async () => {
    const response = await request(app.server)
    .delete("/api/proyectos/proy-1/tareas/t-2"); 
    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe("Tarea del proyecto eliminada correctamente");
});

//* ------------------ TEST 10: ERROR 404 - Eliminar tarea inexistente ------------------//
test("DELETE  /api/proyectos/:idProy/tareas/:idTarea - 404 Tarea no encontrada", async () => {
    const response = await request(app.server)
    .delete("/api/proyectos/proy-1/tareas/t-inexistente"); 

    expect(response.status).toBe(404);
    expect(response.body.mensaje).toBe("Tarea no encontrada");
});

});