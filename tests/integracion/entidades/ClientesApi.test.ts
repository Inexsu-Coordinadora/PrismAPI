import request from "supertest";
import { app } from "../../../src/core/presentacion/app";
import { ConflictError, NotFoundError } from "../../../src/common/errores/AppError";


jest.mock("../../../src/core/aplicacion/casos-uso/entidades/ClienteCasosUso", () => {
  return {
    ClienteCasosUso: jest.fn().mockImplementation(() => ({
      
      //* MOCK: CREAR CLIENTE
  
      crearCliente: jest.fn().mockImplementation((datos) => {
      
        if (datos.emailCliente === "duplicado@test.com") {
          throw new ConflictError("Ya existe un cliente con ese email");
        }
        
        if (datos.documentoCliente === "12345678") {
          throw new ConflictError("Ya existe un cliente con ese documento de identidad");
        }

        // Cliente creado exitosamente
        return {
          idCliente: "nuevo-id-123",
          nombreCliente: datos.nombreCliente,
          apellidoCliente: datos.apellidoCliente,
          emailCliente: datos.emailCliente,
          telefonoCliente: datos.telefonoCliente,
          documentoCliente: datos.documentoCliente
        };
      }),


      //* MOCK: LISTAR CLIENTES

      obtenerClientes: jest.fn().mockResolvedValue([
        {
          idCliente: "c-1",
          nombreCliente: "Juan",
          apellidoCliente: "Pérez",
          emailCliente: "juan@test.com",
          telefonoCliente: "3001234567",
          documentoCliente: "1234567890"
        },
        {
          idCliente: "c-2",
          nombreCliente: "María",
          apellidoCliente: "García",
          emailCliente: "maria@test.com",
          telefonoCliente: "3009876543",
          documentoCliente: "0987654321"
        }
      ]),


      //* MOCK: OBTENER CLIENTE POR ID
   
      obtenerClientePorId: jest.fn().mockImplementation((id) => {
        if (id === "id-inexistente") {
          throw new NotFoundError("Cliente no encontrado");
        }
        
        return {
          idCliente: id,
          nombreCliente: "Juan",
          apellidoCliente: "Pérez",
          emailCliente: "juan@test.com",
          telefonoCliente: "3001234567",
          documentoCliente: "1234567890"
        };
      }),

     
      //* MOCK: ACTUALIZAR CLIENTE

      actualizarCliente: jest.fn().mockImplementation((id, datos) => {
        if (id === "id-inexistente") {
          throw new NotFoundError("Cliente no encontrado");
        }

        if (datos.emailCliente === "email-duplicado@test.com") {
          throw new ConflictError("Ya existe otro cliente con ese email");
        }

        if (datos.documentoCliente === "doc-duplicado") {
          throw new ConflictError("Ya existe otro cliente con ese documento de identidad");
        }

        // Cliente actualizado exitosamente
        return {
          idCliente: id,
          nombreCliente: datos.nombreCliente || "Juan",
          apellidoCliente: datos.apellidoCliente || "Pérez",
          emailCliente: datos.emailCliente || "juan@test.com",
          telefonoCliente: datos.telefonoCliente || "3001234567",
          documentoCliente: datos.documentoCliente || "1234567890"
        };
      }),

      //* MOCK: ELIMINAR CLIENTE
   
      eliminarCliente: jest.fn().mockImplementation((id) => {
        if (id === "id-inexistente") {
          throw new NotFoundError("Cliente no encontrado");
        }
        
      })
    }))
  };
});


describe("Pruebas de Integración - API Clientes (Entidad)", () => {

  
  beforeAll(async () => {
    await app.ready(); 
  });

  afterAll(async () => {
    await app.close(); 
  });


  //* TESTS: CREAR CLIENTE (POST /api/clientes)
 
  //* TEST 1: CAMINO FELIZ - Crear cliente correctamente

  test("POST /api/clientes - Debe crear un cliente correctamente (201)", async () => {
    const response = await request(app.server)
      .post("/api/clientes")
      .send({
        nombreCliente: "Carlos",
        apellidoCliente: "Rodríguez",
        emailCliente: "carlos@test.com",
        telefonoCliente: "3001112222",
        documentoCliente: "9876543210"
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("mensaje", "Cliente creado correctamente");
    expect(response.body).toHaveProperty("cliente");
    expect(response.body.cliente).toHaveProperty("idCliente", "nuevo-id-123");
  });

  //* TEST 2: ERROR 400 - Validación (faltan datos obligatorios)

  test("POST /api/clientes - Debe devolver 400 si faltan datos obligatorios", async () => {
    const response = await request(app.server)
      .post("/api/clientes")
      .send({}); 

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("mensaje");
    expect(response.body).toHaveProperty("detalles");
  });

  //* TEST 3: ERROR 400 - Validación (email inválido)
 
  test("POST /api/clientes - Debe devolver 400 si el email es inválido", async () => {
    const response = await request(app.server)
      .post("/api/clientes")
      .send({
        nombreCliente: "Carlos",
        apellidoCliente: "Rodríguez",
        emailCliente: "email-invalido", 
        telefonoCliente: "3001112222",
        documentoCliente: "9876543210"
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("mensaje");
  });

  //* TEST 4: ERROR 400 - Validación (nombre muy corto)

  test("POST /api/clientes - Debe devolver 400 si el nombre es muy corto", async () => {
    const response = await request(app.server)
      .post("/api/clientes")
      .send({
        nombreCliente: "Jo", 
        apellidoCliente: "Pérez",
        emailCliente: "jo@test.com",
        telefonoCliente: "3001112222",
        documentoCliente: "9876543210"
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("mensaje");
    expect(response.body).toHaveProperty("detalles");
  });

  //* TEST 5: ERROR 400 - Validación (nombre muy largo)
  
  test("POST /api/clientes - Debe devolver 400 si el nombre es muy largo", async () => {
    const nombreLargo = "a".repeat(101); 
    
    const response = await request(app.server)
      .post("/api/clientes")
      .send({
        nombreCliente: nombreLargo,
        apellidoCliente: "Pérez",
        emailCliente: "largo@test.com",
        telefonoCliente: "3001112222",
        documentoCliente: "9876543210"
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("mensaje");
    expect(response.body).toHaveProperty("detalles");
  });

  //* TEST 6: ERROR 400 - Validación (teléfono muy corto)

  test("POST /api/clientes - Debe devolver 400 si el teléfono es muy corto", async () => {
    const response = await request(app.server)
      .post("/api/clientes")
      .send({
        nombreCliente: "Carlos",
        apellidoCliente: "López",
        emailCliente: "carlos@test.com",
        telefonoCliente: "123", 
        documentoCliente: "9876543210"
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("mensaje");
    expect(response.body).toHaveProperty("detalles");
  });


  //* TEST 7: ERROR 400 - Validación (documento muy corto)
 
  test("POST /api/clientes - Debe devolver 400 si el documento es muy corto", async () => {
    const response = await request(app.server)
      .post("/api/clientes")
      .send({
        nombreCliente: "Carlos",
        apellidoCliente: "López",
        emailCliente: "carlos@test.com",
        telefonoCliente: "3001112222",
        documentoCliente: "123" 
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("mensaje");
    expect(response.body).toHaveProperty("detalles");
  });


  //* TEST 8: ERROR 409 - Conflicto (email duplicado)
 
  test("POST /api/clientes - Debe devolver 409 si el email ya existe", async () => {
    const response = await request(app.server)
      .post("/api/clientes")
      .send({
        nombreCliente: "Pedro",
        apellidoCliente: "López",
        emailCliente: "duplicado@test.com", 
        telefonoCliente: "3001112222",
        documentoCliente: "1111111111"
      });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("mensaje", "Ya existe un cliente con ese email");
  });

  //* TEST 9: ERROR 409 - Conflicto (documento duplicado)

  test("POST /api/clientes - Debe devolver 409 si el documento ya existe", async () => {
    const response = await request(app.server)
      .post("/api/clientes")
      .send({
        nombreCliente: "Ana",
        apellidoCliente: "Martínez",
        emailCliente: "ana@test.com",
        telefonoCliente: "3001112222",
        documentoCliente: "12345678" 
      });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("mensaje", "Ya existe un cliente con ese documento de identidad");
  });

  //* TESTS: LISTAR CLIENTES (GET /api/clientes)

  //* TEST 10: CAMINO FELIZ - Listar todos los clientes

  test("GET /api/clientes - Debe retornar la lista de clientes (200)", async () => {
    const response = await request(app.server).get("/api/clientes");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("mensaje", "Clientes encontrados correctamente");
    expect(response.body.clientes).toHaveLength(2);
    expect(response.body.total).toBe(2);
    expect(response.body.clientes[0]).toHaveProperty("nombreCliente", "Juan");
  });


  //* TESTS: OBTENER CLIENTE POR ID (GET /api/clientes/:idCliente)
  
  //* TEST 11: CAMINO FELIZ - Obtener un cliente específico

  test("GET /api/clientes/:idCliente - Debe devolver el cliente encontrado (200)", async () => {
    const response = await request(app.server).get("/api/clientes/c-1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("mensaje", "Cliente encontrado correctamente");
    expect(response.body.cliente).toHaveProperty("nombreCliente", "Juan");
    expect(response.body.cliente).toHaveProperty("emailCliente", "juan@test.com");
  });


  //* TEST 12: ERROR 404 - Cliente no encontrado
 
  test("GET /api/clientes/:idCliente - Debe devolver 404 si el cliente no existe", async () => {
    const response = await request(app.server).get("/api/clientes/id-inexistente");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("mensaje", "Cliente no encontrado");
  });


  //* TESTS: ACTUALIZAR CLIENTE (PUT /api/clientes/:idCliente)
  
  //* TEST 13: CAMINO FELIZ - Actualizar cliente correctamente

  test("PUT /api/clientes/:idCliente - Debe actualizar el cliente correctamente (200)", async () => {
    const response = await request(app.server)
      .put("/api/clientes/c-1")
      .send({
        nombreCliente: "Juan Carlos",
        telefonoCliente: "3009998888"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("mensaje", "Cliente actualizado correctamente");
    expect(response.body.cliente).toHaveProperty("nombreCliente", "Juan Carlos");
  });

 
  //* TEST 14: ERROR 404 - Cliente no encontrado para actualizar

  test("PUT /api/clientes/:idCliente - Debe devolver 404 si el cliente no existe", async () => {
    const response = await request(app.server)
      .put("/api/clientes/id-inexistente")
      .send({
        nombreCliente: "Intento Fallido"
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("mensaje", "Cliente no encontrado");
  });


  //* TEST 15: ERROR 400 - Email inválido al actualizar

  test("PUT /api/clientes/:idCliente - Debe devolver 400 si el email a actualizar es inválido", async () => {
    const response = await request(app.server)
      .put("/api/clientes/c-1")
      .send({
        emailCliente: "email-sin-formato"
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("mensaje");
    expect(response.body).toHaveProperty("detalles");
  });

 
  //* TEST 16: ERROR 409 - Email duplicado al actualizar

  test("PUT /api/clientes/:idCliente - Debe devolver 409 si intenta actualizar a un email existente", async () => {
    const response = await request(app.server)
      .put("/api/clientes/c-1")
      .send({
        emailCliente: "email-duplicado@test.com" 
      });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("mensaje", "Ya existe otro cliente con ese email");
  });

  //* TEST 17: ERROR 409 - Documento duplicado al actualizar

  test("PUT /api/clientes/:idCliente - Debe devolver 409 si intenta actualizar a un documento existente", async () => {
    const response = await request(app.server)
      .put("/api/clientes/c-1")
      .send({
        documentoCliente: "doc-duplicado" 
      });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("mensaje", "Ya existe otro cliente con ese documento de identidad");
  });

  //* TEST 18: ERROR 400 - Sin campos para actualizar

  test("PUT /api/clientes/:idCliente - Debe devolver 400 si no se envían campos para actualizar", async () => {
    const response = await request(app.server)
      .put("/api/clientes/c-1")
      .send({}); 

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("mensaje");
  });


  //* TESTS: ELIMINAR CLIENTE (DELETE /api/clientes/:idCliente)

  //* TEST 19: CAMINO FELIZ - Eliminar cliente correctamente

  test("DELETE /api/clientes/:idCliente - Debe eliminar el cliente correctamente (200)", async () => {
    const response = await request(app.server).delete("/api/clientes/c-1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("mensaje", "Cliente eliminado correctamente");
    expect(response.body).toHaveProperty("idClienteEliminado", "c-1");
  });


  //* TEST 20: ERROR 404 - Cliente no encontrado para eliminar
 
  test("DELETE /api/clientes/:idCliente - Debe devolver 404 si el cliente no existe", async () => {
    const response = await request(app.server).delete("/api/clientes/id-inexistente");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("mensaje", "Cliente no encontrado");
  });

});