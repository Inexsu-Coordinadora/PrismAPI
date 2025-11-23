import request from "supertest";
import { app } from "../../../src/core/presentacion/app";
import { NotFoundError, ConflictError, ValidationError } from "../../../src/common/errores/AppError";

//* 1. MOCK: Simulamos el Servicio de Asignación
jest.mock("../../../src/core/aplicacion/casos-uso/servicios/AsignacionConsultorProyectoServicio", () => {
    return {
    AsignacionConsultorProyectoServicio: jest.fn().mockImplementation(() => ({
    
      //* Simulamos 'asignarConsultorProyecto'
    asignarConsultorProyecto: jest.fn().mockImplementation((datos) => {
        
        //* CASO: Error 404 (Proyecto no existe)
        if (datos.idProyecto === "proyecto-inexistente") {
        throw new NotFoundError("El proyecto no existe");
        }

        //* CASO: Error 409 (Conflicto/Duplicado)
        if (datos.idConsultor === "consultor-duplicado") {
        throw new ConflictError("Ya existe una asignación");
        }

        //* CASO: Éxito (201)
        return { 
            mensaje: "Asignación exitosa", 
            asignacion: "nueva-id-asignacion" 
        };
    }),

      //* Simulamos 'obtenerAsignacionPorId'
    obtenerAsignacionPorId: jest.fn().mockImplementation((id) => {
        if (id === "id-invalido") return null; // Para que el controlador lance 404
        return { idAsignacion: id, rol: "Dev" };
    })

    })),
};
});

describe("Pruebas de Integración - Asignación Consultores", () => {

beforeAll(async () => {
    await app.ready();
});

afterAll(async () => {
    await app.close();
});

  //* --- TEST 1: Crear Asignación (Éxito) ---//
test("POST /api/asignaciones - Debe crear asignación correctamente (201)", async () => {
    const response = await request(app.server)
    .post("/api/asignaciones") // VERIFICA ESTA RUTA EN TUS ENRUTADORES
    .send({
        idConsultor: "consultor-ok",
        idProyecto: "proyecto-ok",
        fechaInicioAsignacion: new Date().toISOString(),
        porcentajeDedicacion: 100,
        rolConsultor: "Arquitecto"
    });

    expect(response.status).toBe(201);
    // CORRECCIÓN: Ajustamos la expectativa para el cuerpo de la respuesta real
    expect(response.body).toHaveProperty("mensaje", "Asignación exitosa");
    expect(response.body.datos).toHaveProperty("idAsignacion", "nueva-id-asignacion");
    });

  //* --- TEST 2: Error de Validación (Zod - 400) ---//
    test("POST /api/asignaciones - Debe devolver 400 si faltan datos", async () => {
    const response = await request(app.server)
    .post("/api/asignaciones")
    .send({}); // Body vacío

    expect(response.status).toBe(400);
    expect(response.body.mensaje).toBe("Error de validación");
    });

  //* --- TEST 3: Error de Negocio (404 - Proyecto no existe) ---//
    test("POST /api/asignaciones - Debe devolver 404 si el servicio lanza NotFoundError", async () => {
    const response = await request(app.server)
    .post("/api/asignaciones")
    .send({
        idConsultor: "consultor-ok",
        idProyecto: "proyecto-inexistente", 
        fechaInicioAsignacion: new Date().toISOString(),
        porcentajeDedicacion: 100,
        rolConsultor: "Dev"
    });

    expect(response.status).toBe(404);
    expect(response.body.mensaje).toBe("El proyecto no existe");
    });

  //* --- TEST 4: Error de Conflicto (409 - Duplicado) ---//
    test("POST /api/asignaciones - Debe devolver 409 si ya existe asignación", async () => {
    const response = await request(app.server)
    .post("/api/asignaciones")
    .send({
        idConsultor: "consultor-duplicado",
        idProyecto: "proyecto-ok",
        fechaInicioAsignacion: new Date().toISOString(),
        porcentajeDedicacion: 100,
        rolConsultor: "Dev"
    });

    expect(response.status).toBe(409);
    expect(response.body.mensaje).toMatch(/Ya existe una asignación/);
    });
});