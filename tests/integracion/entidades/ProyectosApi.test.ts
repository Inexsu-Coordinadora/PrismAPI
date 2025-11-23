import request from "supertest";
import { app } from "../../../src/core/presentacion/app";


jest.mock("../../../src/core/aplicacion/casos-uso/entidades/ProyectosCasosUso", () => {

    const mockImplementations = {
        
        crearProyecto: jest.fn().mockImplementation(() => {
            return "nuevo-id-proyecto-456";
        }),
        
        obtenerProyectos: jest.fn().mockResolvedValue({
            total: 2,
            pagina: 1,
            limite: 10,
            data: [
                { idProyecto: "p-1", nombreProyecto: "Proyecto Alfa", estadoProyecto: "activo", fechaInicioProyecto: "2023-01-01" },
                { idProyecto: "p-2", nombreProyecto: "Proyecto Beta", estadoProyecto: "pendiente", fechaInicioProyecto: "2023-02-15" }
            ]
        }),

        
        obtenerProyectoPorId: jest.fn().mockImplementation((id: string) => {
            if (id === "id-inexistente") {
                return null;
            }
            return { idProyecto: id, nombreProyecto: "Proyecto de Prueba", estadoProyecto: "activo", fechaInicioProyecto: "2024-01-20" };
        }),

        
        actualizarProyecto: jest.fn().mockImplementation((id: string, proyectoActualizado: any) => {
            if (id === "id-inexistente") {
                return null;
            }
            return { idProyecto: id, ...proyectoActualizado };
        }),


        eliminarProyecto: jest.fn().mockResolvedValue(undefined)
    };

    
    const MockProyectoCasosUso = jest.fn(() => mockImplementations);

    return {
        ProyectoCasosUso: MockProyectoCasosUso,        
        default: MockProyectoCasosUso,
    };
});

describe("Pruebas de Integración - API Proyectos (Entidad)", () => {
    
    beforeAll(async () => {
        await app.ready();
    });
    
    afterAll(async () => {
        await app.close();
    });

    //* ---------------------------- TESTS CREAR PROYECTO (POST) ----------------------------//

    //* ------------------ TEST 1: CAMINO FELIZ (201 CREADO) --------------------------------//
    test("POST /api/proyectos - Debe crear un proyecto correctamente (201)", async () => {
        const response = await request(app.server)
            .post("/api/proyectos")
            .send({
                nombreProyecto: "Proyecto Válido Nuevo",
                tipoProyecto: "Descripción del proyecto",
                estadoProyecto: "pendiente",
                fechaInicioProyecto: "2025-05-01",
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("mensaje", "El proyecto se creó correctamente");
        expect(response.body).toHaveProperty("idNuevoProyecto", "nuevo-id-proyecto-456");
    });

    
    //* ------------------ TEST 2: ERROR 400 - Validación (Zod/Esquema) ------------------//
    test("POST /api/proyectos - Debe devolver 400 si faltan datos obligatorios", async () => {
        const response = await request(app.server)
            .post("/api/proyectos")
            .send({
                // Faltan campos obligatorios como nombreProyecto, descripcionProyecto, fechas...
                estadoProyecto: "activo"
            });


        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("mensaje", "Error de validación");
        expect(response.body).toHaveProperty("detalles"); 
    });


    /* ---------------------------- TESTS OBTENER PROYECTOS (GET) ----------------------------//
    /* ------------------ TEST 3: CAMINO FELIZ (200 OK) ------------------*/

    test("GET /api/proyectos - 200 Debe retornar la lista de proyectos con paginación", async () => {
        const response = await request(app.server).get("/api/proyectos");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("mensaje", "Proyectos obtenidos correctamente");
        expect(response.body.data).toHaveLength(2);
        expect(response.body.total).toBe(2);
    });

    //* ---------------------------- TESTS OBTENER PROYECTO POR ID (GET) ----------------------------//
    //* ------------------ TEST 4: CAMINO FELIZ (200 OK) ------------------//
    test("GET /api/proyectos/:id - 200 Debe devolver el proyecto encontrado", async () => {
        const response = await request(app.server).get("/api/proyectos/p-1");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("mensaje", "Proyecto encontrado correctamente");
        expect(response.body.proyecto).toHaveProperty("nombreProyecto", "Proyecto de Prueba");
    });

    //* ------------------ TEST 5: ERROR 404 - Proyecto no encontrado ------------------//
    test("GET /api/proyectos/:id - Debe devolver 404 si el proyecto no existe", async () => {
        const response = await request(app.server).get("/api/proyectos/id-inexistente");

        expect(response.status).toBe(404);        
        expect(response.body).toEqual({ mensaje: "Proyecto no encontrado" });
    });

    //* ---------------------------- TESTS ACTUALIZAR PROYECTO (PUT)----------------------------//
    //* ------------------ TEST 6: CAMINO FELIZ (200 OK) ------------------//
    test("PUT /api/proyectos/:id - 200 Debe actualizar el proyecto correctamente", async () => {
        const response = await request(app.server)
            .put("/api/proyectos/p-1")
            .send({
                nombreProyecto: "Nombre Editado",
                estadoProyecto: "activo" 
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("mensaje", "Proyecto actualizado correctamente");
        expect(response.body.proyectoActualizado).toHaveProperty("nombreProyecto", "Nombre Editado");
        expect(response.body.proyectoActualizado).toHaveProperty("estadoProyecto", "activo");
    });

    //* ------------------ TEST 7: ERROR 404 - Proyecto no encontrado para actualizar ------------------//
    test("PUT /api/proyectos/:id - 404 Debe devolver error si el proyecto a actualizar no existe", async () => {
        const response = await request(app.server)
            .put("/api/proyectos/id-inexistente")
            .send({
                nombreProyecto: "Intento Fallido"
            });

        expect(response.status).toBe(404);        
        expect(response.body.mensaje).toBe("Proyecto no encontrado para actualizar");
    });

    //* ---------------------------- TESTS ELIMINAR PROYECTO (DELETE) ----------------------------//
    //* ------------------ TEST 8: CAMINO FELIZ (200 OK) ------------------//
    test("DELETE /api/proyectos/:id - 200 Debe eliminar el proyecto correctamente", async () => {
        
        const response = await request(app.server).delete("/api/proyectos/p-1");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("mensaje", "Proyecto eliminado correctamente");
        expect(response.body).toHaveProperty("idProyecto", "p-1");
    });

     //* ------------------ TEST 9: ERROR 404 - Eliminar proyecto inexistente ------------------//
    test("DELETE /api/proyectos/:id - 404 Debe devolver error si el proyecto a eliminar no existe", async () => {
        
        const response = await request(app.server).delete("/api/proyectos/id-inexistente");

        expect(response.status).toBe(404);
        expect(response.body.mensaje).toMatch(/Proyecto no encontrado para eliminar/);
    });
})