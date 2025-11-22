import request from "supertest";
import { app } from "../../../src/core/presentacion/app"; 

//* 1. MOCK del Servicio (IClienteCasosUso)
// Usamos la ruta y el nombre de la clase de Casos de Uso del Cliente.
jest.mock("../../../src/core/aplicacion/casos-uso/entidades/ClienteCasosUso", () => {
    return {
        // Asegúrate de que el nombre de la clase mockeada sea ClienteCasosUso
        ClienteCasosUso: jest.fn().mockImplementation(() => ({
        
            //* Simulamos 'crearCliente'. Retorna el objeto creado
            crearCliente: jest.fn().mockImplementation((datos) => {
                return { idCliente: "id-nuevo-cliente", ...datos }; 
            }),

            //* Simulamos 'obtenerClientePorId'
            obtenerClientePorId: jest.fn().mockImplementation((id) => {
                if (id === "id-inexistente") {
                    // Simulamos que no encontró nada (el controlador refactorizado lanzará el NotFoundError)
                    return null; 
                }
                return { 
                    idCliente: id, 
                    nombreCliente: "Test", 
                    apellidoCliente: "Cliente", 
                    emailCliente: "test@example.com",
                    documentoCliente: "12345678",
                }; // Simula éxito
            }),

            //* Simulamos 'eliminarCliente'. Devolvemos void (o el mock no hace nada)
            eliminarCliente: jest.fn().mockResolvedValue(undefined),
            
            //* Aquí irían mocks para listar y actualizar
        })),
    };
});

describe("Pruebas de Integración - API Clientes", () => {

    beforeAll(async () => {
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    const CLIENTE_VALIDO = {
        nombreCliente: "Juan",
        apellidoCliente: "Perez",
        emailCliente: "juan.perez@test.com",
        telefonoCliente: "3001234567",
        documentoCliente: "1010101010",
    };

    //* --- CASO 1: CREAR (Happy Path) ---
    test("POST /api/clientes - Debe crear un cliente correctamente (201)", async () => {
        const response = await request(app.server)
            .post("/api/clientes")
            .send(CLIENTE_VALIDO); // Datos requeridos por CrearClienteDto

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("mensaje", "Cliente creado correctamente");
        expect(response.body.cliente).toHaveProperty("idCliente", "id-nuevo-cliente");
        expect(response.body.cliente.nombreCliente).toBe(CLIENTE_VALIDO.nombreCliente);
    });

    //* --- CASO 2: VALIDACIÓN (Error 400) ---
    test("POST /api/clientes - Debe devolver 400 si faltan datos obligatorios (ZodError)", async () => {
        const response = await request(app.server)
            .post("/api/clientes")
            .send({
                // Faltan campos como nombreCliente, emailCliente, etc.
                telefonoCliente: "solo_el_telefono",
            });

        //* Verificamos que el Manejador Global atrapó el error de Zod
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("mensaje", "Error de validación");
        expect(response.body).toHaveProperty("detalles"); // El manejador global devuelve 'detalles'
    });

    //* --- CASO 3: NO ENCONTRADO (Error 404) ---
    test("GET /api/clientes/:id - Debe devolver 404 si el cliente no existe", async () => {
        const ID_INEXISTENTE = "id-inexistente";
        const response = await request(app.server).get(`/api/clientes/${ID_INEXISTENTE}`);

        //* Verificamos que el controlador lanzó 'throw new NotFoundError'
        //* y el Manejador Global respondió con 404
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            mensaje: "Cliente no encontrado",
        });
    });

    //* --- CASO 4: ELIMINAR (Happy Path) ---
    test("DELETE /api/clientes/:id - Debe eliminar un cliente correctamente (200)", async () => {
        const ID_A_ELIMINAR = "id-existente";
        const response = await request(app.server).delete(`/api/clientes/${ID_A_ELIMINAR}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("mensaje", "Cliente eliminado correctamente");
        expect(response.body).toHaveProperty("idClienteEliminado", ID_A_ELIMINAR);
    });
});