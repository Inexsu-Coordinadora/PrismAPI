import request from "supertest";
import { app } from "../../../src/core/presentacion/app";
import { NotFoundError, ConflictError, ValidationError } from "../../../src/common/errores/AppError";


const mockAsignacion1 = {
    idAsignacion: "a-1",
    idConsultor: "c-1",
    idProyecto: "p-1",
    rolConsultor: "Desarrollador Senior",
    porcentajeDedicacion: 80,
    fechaInicioAsignacion: new Date("2024-01-01").toISOString(),
    fechaFinAsignacion: new Date("2024-12-31").toISOString(),
};

const mockAsignacion2 = {
    idAsignacion: "a-2",
    idConsultor: "c-2",
    idProyecto: "p-1",
    rolConsultor: "Analista QA",
    porcentajeDedicacion: 40,
    fechaInicioAsignacion: new Date("2024-06-01").toISOString(),
    fechaFinAsignacion: new Date("2024-12-31").toISOString(),
};


jest.mock("../../../src/core/aplicacion/casos-uso/servicios/AsignacionConsultorProyectoServicio", () => {
    return {
        AsignacionConsultorProyectoServicio: jest.fn().mockImplementation(() => ({        
        
        asignarConsultorProyecto: jest    
            .fn()
            .mockImplementation((datosAsignacion) => {
            if (datosAsignacion.idConsultor === "consultor-ya-asignado") {
                throw new ConflictError("El consultor ya tiene una asignación idéntica en este proyecto");
            }
                return {
                        mensaje: "Asignación creada exitosamente",
                        asignacion: "asignacion-id-123"
                    };
                }),
    
        obtenerAsignacionPorId: jest.fn().mockImplementation((idAsignacion) => {
            if (idAsignacion === "a-inexistente" || idAsignacion === "a-fantasma") {
                return null; 
            }
                return mockAsignacion1;
            }),
            
        obtenerAsignacionPorConsultor: jest.fn().mockResolvedValue([mockAsignacion1, mockAsignacion2]),
            
        obtenerAsignacionPorProyecto: jest.fn().mockResolvedValue([mockAsignacion1]),

        obtenerAsignacionExistente: jest.fn().mockImplementation((idConsultor, idProyecto, rolConsultor) => {
                if (idConsultor === "c-existe") {
                    return mockAsignacion1; 
                }
                return null; 
            }),

            
        obtenerDedicacionConsultor: jest.fn().mockResolvedValue(50), 
        
        actualizarAsignacion: jest.fn().mockImplementation((idAsignacion, datos) => {
            if (idAsignacion === "a-fantasma") {
                throw new NotFoundError("Asignación no encontrada");
            }
                return { ...mockAsignacion1, ...datos, idAsignacion };
            }),
            
        eliminarAsignacion: jest.fn().mockImplementation((idAsignacion) => {
            if (idAsignacion === "a-inexistente-borrar") {
                throw new NotFoundError("Asignación no encontrada");
            }
                return; 
            }),
        })),
    };
});

const datosAsignacionValida = {
    idConsultor: "c-999",
    idProyecto: "p-999",
    rolConsultor: "Dev Junior",
    porcentajeDedicacion: 100,
    fechaInicioAsignacion: "2024-10-01T00:00:00.000Z",
    fechaFinAsignacion: "2025-03-31T00:00:00.000Z",
};

const datosActualizacionValida = {
    rolConsultor: "Dev Senior",
    porcentajeDedicacion: 50,
};

describe("Pruebas de Integración - API Asignación Consultor Proyecto", () => {

    beforeAll(async () => {
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    const BASE_URL = "/api/asignaciones";

    //* ---------------------------- TESTS CREAR ASIGNACIÓN (POST) ---------------------------//

    // ------------------ TEST 1: CAMINO FELIZ -----------------------------------------------//
    test("POST /api/asignaciones - 201 Asignación creada exitosamente", async () => {
        const response = await request(app.server)
        .post(BASE_URL)
        .send(datosAsignacionValida);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("mensaje");
        expect(response.body).toHaveProperty("datos.idAsignacion", "asignacion-id-123");
    });

    
    // ------------------ TEST 2: ERROR 400 - Validación (Zod) ------------------------------//
    test("POST /api/asignaciones - 400 Error de Validación (Zod)", async () => {
        const response = await request(app.server)
        .post(BASE_URL)
        .send({ idConsultor: "c-123" }); // Faltan campos obligatorios

        expect(response.status).toBe(400);
        expect(response.body.mensaje).toBe("Error de validación");
        expect(response.body).toHaveProperty("detalles");
    });

    // ------------------ TEST 3: ERROR 409 - Conflicto (Regla de Negocio) ------------------//
    test("POST /api/asignaciones - 409 El servicio reporta conflicto", async () => {
        const response = await request(app.server)
        .post(BASE_URL)            
        .send({ ...datosAsignacionValida, idConsultor: "consultor-ya-asignado" }); 

        expect(response.status).toBe(409);
        expect(response.body.mensaje).toBe("El consultor ya tiene una asignación idéntica en este proyecto.");
    });

    //* ---------------------------- TESTS OBTENER POR ID (GET /:id) ----------------------------//

    // ------------------ TEST 4: CAMINO FELIZ --------------------------------------------------//
    test("GET /api/asignaciones/:id - 200 Retorna la asignación encontrada", async () => {
        const response = await request(app.server)
        .get(`${BASE_URL}/a-1`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("mensaje", "Asignación obtenida correctamente");
        expect(response.body.datos).toHaveProperty("idAsignacion", "a-1");
    });

    // ------------------ TEST 5: ERROR 404 - Asignación no encontrada -------------------------//
    test("GET /api/asignaciones/:id - 404 Asignación no encontrada", async () => {
        const response = await request(app.server)
        .get(`${BASE_URL}/a-inexistente`);

        expect(response.status).toBe(404);
        expect(response.body.mensaje).toBe("Asignación no encontrada");
    });

     //* --------------TESTS LISTAR POR CONSULTOR (GET /consultor/:id) ------------------------//
    // ------------------ TEST 6: CAMINO FELIZ ------------------------------------------------//
    test("GET /api/asignaciones/consultor/:id - 200 Retorna lista de asignaciones por consultor", async () => {
        const response = await request(app.server)
        .get(`${BASE_URL}/consultor/c-1`);

        expect(response.status).toBe(200);
        expect(response.body.datos).toHaveLength(2);
        expect(response.body.mensaje).toBe("Se encontraron 2 asignaciones");
    });

     //* ------------------ TESTS LISTAR POR PROYECTO (GET /proyecto/:id) ---------------------//

    // ------------------ TEST 7: CAMINO FELIZ ------------------------------------------------//
    test("GET /api/asignaciones/proyecto/:id - 200 Retorna lista de asignaciones por proyecto", async () => {
        const response = await request(app.server)
        .get(`${BASE_URL}/proyecto/p-1`);

        expect(response.status).toBe(200);
        expect(response.body.datos).toHaveLength(1);
        expect(response.body.mensaje).toBe("Se encontraron 1 asignaciones");
    });

    //* ----------------TESTS OBTENER EXISTENTE (GET /verificar/existente) --------------------//
    // ------------------ TEST 8: ASIGNACIÓN EXISTENTE (CORREGIDA LA RUTA) --------------------//
    test("GET /api/asignaciones/verificar/existente - 200 Retorna existe: true", async () => {
        const response = await request(app.server)        
        .get(`${BASE_URL}/verificar/existente?idConsultor=c-existe&idProyecto=p-1&rolConsultor=cualquiera`);

        expect(response.status).toBe(200);        
        
        expect(response.body).toHaveProperty("datos");
        expect(response.body.datos).toHaveProperty("existe");

        expect(response.body.mensaje).toBe("Ya existe una asignación idéntica");
        expect(response.body.datos.existe).toBe(true);
        expect(response.body.datos.asignacion).toEqual(mockAsignacion1);
    });

    // ------------------ TEST 9: ASIGNACIÓN NO EXISTENTE (CORREGIDA LA RUTA) -----------------//
    test("GET /api/asignaciones/verificar/existente - 200 Retorna existe: false", async () => {
        const response = await request(app.server)        
        .get(`${BASE_URL}/verificar/existente?idConsultor=c-no-existe&idProyecto=p-2`); 

        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBe("No existe asignación duplicada");
        expect(response.body.datos.existe).toBe(false);
        expect(response.body.datos.asignacion).toBeNull();
    });

    //* -----------TESTS OBTENER DEDICACIÓN (GET /consultor/:id/dedicacion) ----------------------//

    // ------------------ TEST 10: CÁLCULO EXITOSO ----------------------------------------------//
    test("GET /api/asignaciones/consultor/:id/dedicacion - 200 Retorna el porcentaje de dedicación", async () => {
        const response = await request(app.server)
            .get(`${BASE_URL}/consultor/c-1/dedicacion?fechaInicio=2024-01-01&fechaFin=2024-01-31`);

        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBe("Dedicación calculada correctamente");
        expect(response.body.datos.dedicacion).toBe("50%");
    });

    // ---------------------------- TESTS ACTUALIZAR ASIGNACIÓN (PUT) ----------------------------//

    // ------------------ TEST 11: CAMINO FELIZ --------------------------------------------------//
    test("PUT /api/asignaciones/:id - 200 Asignación actualizada exitosamente", async () => {
        const response = await request(app.server)
        .put(`${BASE_URL}/a-1`)
        .send(datosActualizacionValida);

        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBe("Asignación actualizada correctamente");
        expect(response.body.datos).toHaveProperty("rolConsultor", "Dev Senior");
        expect(response.body.datos).toHaveProperty("porcentajeDedicacion", 50);
        expect(response.body.datos).toHaveProperty("idAsignacion", "a-1");
    });

    // ------------------ TEST 12: ERROR 404 - Asignación a actualizar no encontrada -------------//
    test("PUT /api/asignaciones/:id - 404 Asignación no encontrada para actualizar", async () => {
        const response = await request(app.server)
        .put(`${BASE_URL}/a-fantasma`) 
        .send(datosActualizacionValida);

        expect(response.status).toBe(404);
        expect(response.body.mensaje).toBe("Asignación no encontrada");
    });

    //* ---------------------------- TESTS ELIMINAR ASIGNACIÓN (DELETE) ---------------------------//

    // ------------------ TEST 13: CAMINO FELIZ --------------------------------------------------//
    test("DELETE /api/asignaciones/:id - 200 Asignación eliminada exitosamente", async () => {
        const response = await request(app.server)
        .delete(`${BASE_URL}/a-2`);

        expect(response.status).toBe(200);
        expect(response.body.mensaje).toBe("Asignación eliminada correctamente");
        expect(response.body.datos).toBeNull();
    });

     // ------------------ TEST 14: ERROR 404 - Eliminar asignación inexistente ------------------//
    test("DELETE /api/asignaciones/:id - 404 Asignación no encontrada para eliminar", async () => {
        const response = await request(app.server)
        .delete(`${BASE_URL}/a-inexistente-borrar`);

        expect(response.status).toBe(404);
        expect(response.body.mensaje).toBe("Asignación no encontrada");
    });

})