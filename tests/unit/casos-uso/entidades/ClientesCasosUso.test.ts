import { ClienteCasosUso } from "../../../../src/core/aplicacion/casos-uso/entidades/ClienteCasosUso";
import { CrearClienteDto, ActualizarClienteDto } from "../../../../src/core/dominio/entidades/Cliente";
import { NotFoundError, ConflictError } from "../../../../src/common/errores/AppError";
import { ICliente } from "../../../../src/core/dominio/entidades/ICliente";

describe("Pruebas Unitarias - ClienteCasosUso (Entidad)", () => {
  let mockRepo: any;
  let servicio: ClienteCasosUso;

  beforeEach(() => {
    //* Creamos un mock del repositorio con todos sus métodos
    mockRepo = {
      crearCliente: jest.fn(),
      obtenerClientes: jest.fn(),
      obtenerClientePorId: jest.fn(),
      actualizarCliente: jest.fn(),
      eliminarCliente: jest.fn(),
      existeEmailCliente: jest.fn(),
      existeDocumentoCliente: jest.fn(),
    };

    //* Instanciamos el servicio con el repositorio mockeado
    servicio = new ClienteCasosUso(mockRepo);
  });

  //* ============================================================================
  //* TESTS: CREAR CLIENTE
  //* ============================================================================

  //* ------------------ TEST 1: CREAR CLIENTE - CAMINO FELIZ ------------------//
  test("crearCliente - Debe crear un cliente y devolver los datos del cliente creado", async () => {
    //* A. PREPARAR DATOS (ARRANGE)
    const datosCliente: CrearClienteDto = {
      nombreCliente: "Juan",
      apellidoCliente: "Pérez",
      emailCliente: "juan@test.com",
      telefonoCliente: "3001234567",
      documentoCliente: "1234567890",
    };

    const clienteCreado: ICliente = {
      idCliente: "nuevo-id-123",
      ...datosCliente,
     } as ICliente;

    // Simulamos que el email y documento NO existen
    mockRepo.existeEmailCliente.mockResolvedValue(false);
    mockRepo.existeDocumentoCliente.mockResolvedValue(false);
    mockRepo.crearCliente.mockResolvedValue(clienteCreado);

    //* B. EJECUTAR (ACT)
    const resultado = await servicio.crearCliente(datosCliente);

    //* C. VALIDAR (ASSERT)
    expect(mockRepo.existeEmailCliente).toHaveBeenCalledWith("juan@test.com");
    expect(mockRepo.existeDocumentoCliente).toHaveBeenCalledWith("1234567890");
    expect(mockRepo.crearCliente).toHaveBeenCalledWith(datosCliente);
    expect(resultado).toEqual(clienteCreado);
  });

  //* ------------------ TEST 2: CREAR CLIENTE - EMAIL DUPLICADO ------------------//
  test("crearCliente - Debe lanzar ConflictError si el email ya existe", async () => {
    //* A. PREPARAR DATOS (ARRANGE)
    const datosCliente: CrearClienteDto = {
      nombreCliente: "María",
      apellidoCliente: "García",
      emailCliente: "duplicado@test.com",
      telefonoCliente: "3009876543",
      documentoCliente: "9876543210",
    };

    // Simulamos que el email SÍ existe
    mockRepo.existeEmailCliente.mockResolvedValue(true);

    //* B. EJECUTAR y VALIDAR (ACT & ASSERT)
    await expect(servicio.crearCliente(datosCliente)).rejects.toThrow(ConflictError);
    await expect(servicio.crearCliente(datosCliente)).rejects.toThrow(
      "Ya existe un cliente con ese email"
    );

    // Verificamos que NO se llamó a crearCliente porque falló la validación
    expect(mockRepo.crearCliente).not.toHaveBeenCalled();
  });

  //* ------------------ TEST 3: CREAR CLIENTE - DOCUMENTO DUPLICADO ------------------//
  test("crearCliente - Debe lanzar ConflictError si el documento ya existe", async () => {
    //* A. PREPARAR DATOS (ARRANGE)
    const datosCliente: CrearClienteDto = {
      nombreCliente: "Carlos",
      apellidoCliente: "López",
      emailCliente: "carlos@test.com",
      telefonoCliente: "3001112222",
      documentoCliente: "12345678", // Documento duplicado
    };

    // Simulamos que el email NO existe pero el documento SÍ existe
    mockRepo.existeEmailCliente.mockResolvedValue(false);
    mockRepo.existeDocumentoCliente.mockResolvedValue(true);

    //* B. EJECUTAR y VALIDAR (ACT & ASSERT)
    await expect(servicio.crearCliente(datosCliente)).rejects.toThrow(ConflictError);
    await expect(servicio.crearCliente(datosCliente)).rejects.toThrow(
      "Ya existe un cliente con ese documento de identidad"
    );

    // Verificamos que NO se llamó a crearCliente
    expect(mockRepo.crearCliente).not.toHaveBeenCalled();
  });

  //* ============================================================================
  //* TESTS: LISTAR CLIENTES
  //* ============================================================================

  //* ------------------ TEST 4: LISTAR CLIENTES ------------------//
  test("obtenerClientes - Debe llamar al repositorio y devolver una lista de clientes", async () => {
    //* A. PREPARAR DATOS (ARRANGE)
    const listaSimulada: ICliente[] = [
      {
        idCliente: "c-1",
        nombreCliente: "Juan",
        apellidoCliente: "Pérez",
        emailCliente: "juan@test.com",
        telefonoCliente: "3001234567",
        documentoCliente: "1234567890",
      },
      {
        idCliente: "c-2",
        nombreCliente: "María",
        apellidoCliente: "García",
        emailCliente: "maria@test.com",
        telefonoCliente: "3009876543",
        documentoCliente: "9087654321",
      },
    ];

    mockRepo.obtenerClientes.mockResolvedValue(listaSimulada);

    //* B. EJECUTAR (ACT)
    const resultado = await servicio.obtenerClientes();

    //* C. VALIDAR (ASSERT)
    expect(mockRepo.obtenerClientes).toHaveBeenCalled();
    expect(resultado).toEqual(listaSimulada);
    expect(resultado).toHaveLength(2);
  });

  //* ============================================================================
  //* TESTS: OBTENER CLIENTE POR ID
  //* ============================================================================

  //* ------------------ TEST 5: OBTENER CLIENTE POR ID - CLIENTE ENCONTRADO ------------------//
  test("obtenerClientePorId - Debe llamar al repositorio y devolver el cliente", async () => {
    //* A. PREPARAR DATOS (ARRANGE)
    const clienteSimulado: ICliente = {
      idCliente: "c-1",
      nombreCliente: "Juan",
      apellidoCliente: "Pérez",
      emailCliente: "juan@test.com",
      telefonoCliente: "3001234567",
      documentoCliente: "1234567890",
    };

    mockRepo.obtenerClientePorId.mockResolvedValue(clienteSimulado);

    //* B. EJECUTAR (ACT)
    const resultado = await servicio.obtenerClientePorId("c-1");

    //* C. VALIDAR (ASSERT)
    expect(mockRepo.obtenerClientePorId).toHaveBeenCalledWith("c-1");
    expect(resultado).toEqual(clienteSimulado);
  });

  //* ------------------ TEST 6: OBTENER CLIENTE POR ID - CLIENTE NO ENCONTRADO ------------------//
  test("obtenerClientePorId - Debe lanzar NotFoundError si el cliente no existe", async () => {
    //* A. PREPARAR DATOS (ARRANGE)
    mockRepo.obtenerClientePorId.mockResolvedValue(null);

    //* B. EJECUTAR y VALIDAR (ACT & ASSERT)
    await expect(servicio.obtenerClientePorId("id-inexistente")).rejects.toThrow(
      NotFoundError
    );
    await expect(servicio.obtenerClientePorId("id-inexistente")).rejects.toThrow(
      "Cliente no encontrado"
    );

    expect(mockRepo.obtenerClientePorId).toHaveBeenCalledWith("id-inexistente");
  });

  //* ============================================================================
  //* TESTS: ACTUALIZAR CLIENTE
  //* ============================================================================

  //* ------------------ TEST 7: ACTUALIZAR CLIENTE - CAMINO FELIZ ------------------//
  test("actualizarCliente - Debe actualizar el cliente y devolver los datos actualizados", async () => {
    //* A. PREPARAR DATOS (ARRANGE)
    const datosActualizar: ActualizarClienteDto = {
      nombreCliente: "Juan Carlos",
      telefonoCliente: "3009998888",
    };

    const clienteExistente: ICliente = {
      idCliente: "c-1",
      nombreCliente: "Juan",
      apellidoCliente: "Pérez",
      emailCliente: "juan@test.com",
      telefonoCliente: "3001234567",
      documentoCliente: "1234567890",
    };

    const clienteActualizado: ICliente = {
      ...clienteExistente,
      nombreCliente: "Juan Carlos",
      telefonoCliente: "3009998888",
    };

    // Simulamos que el cliente existe
    mockRepo.obtenerClientePorId.mockResolvedValue(clienteExistente);
    mockRepo.actualizarCliente.mockResolvedValue(clienteActualizado);

    //* B. EJECUTAR (ACT)
    const resultado = await servicio.actualizarCliente("c-1", datosActualizar);

    //* C. VALIDAR (ASSERT)
    expect(mockRepo.obtenerClientePorId).toHaveBeenCalledWith("c-1");
    expect(mockRepo.actualizarCliente).toHaveBeenCalledWith("c-1", datosActualizar);
    expect(resultado).toEqual(clienteActualizado);
  });

  //* ------------------ TEST 8: ACTUALIZAR CLIENTE - CLIENTE NO ENCONTRADO ------------------//
  test("actualizarCliente - Debe lanzar NotFoundError si el cliente no existe", async () => {
    //* A. PREPARAR DATOS (ARRANGE)
    const datosActualizar: ActualizarClienteDto = {
      nombreCliente: "Intento Fallido",
    };

    // Simulamos que el cliente NO existe
    mockRepo.obtenerClientePorId.mockResolvedValue(null);

    //* B. EJECUTAR y VALIDAR (ACT & ASSERT)
    await expect(
      servicio.actualizarCliente("id-inexistente", datosActualizar)
    ).rejects.toThrow(NotFoundError);
    await expect(
      servicio.actualizarCliente("id-inexistente", datosActualizar)
    ).rejects.toThrow("Cliente no encontrado");

    // Verificamos que NO se llamó a actualizarCliente
    expect(mockRepo.actualizarCliente).not.toHaveBeenCalled();
  });

  //* ------------------ TEST 9: ACTUALIZAR CLIENTE - EMAIL DUPLICADO ------------------//
  test("actualizarCliente - Debe lanzar ConflictError si intenta actualizar a un email existente", async () => {
    //* A. PREPARAR DATOS (ARRANGE)
    const datosActualizar: ActualizarClienteDto = {
      emailCliente: "email-duplicado@test.com",
    };

    const clienteExistente: ICliente = {
      idCliente: "c-1",
      nombreCliente: "Juan",
      apellidoCliente: "Pérez",
      emailCliente: "juan@test.com",
      telefonoCliente: "3001234567",
      documentoCliente: "1234567890",
    };

    // Simulamos que el cliente existe
    mockRepo.obtenerClientePorId.mockResolvedValue(clienteExistente);
    // Simulamos que el nuevo email YA existe (usado por otro cliente)
    mockRepo.existeEmailCliente.mockResolvedValue(true);

    //* B. EJECUTAR y VALIDAR (ACT & ASSERT)
    await expect(servicio.actualizarCliente("c-1", datosActualizar)).rejects.toThrow(
      ConflictError
    );
    await expect(servicio.actualizarCliente("c-1", datosActualizar)).rejects.toThrow(
      "Ya existe otro cliente con ese email"
    );

    // Verificamos que se llamó a existeEmailCliente con el ID para excluir
    expect(mockRepo.existeEmailCliente).toHaveBeenCalledWith(
      "email-duplicado@test.com",
      "c-1"
    );
    // Verificamos que NO se llamó a actualizarCliente
    expect(mockRepo.actualizarCliente).not.toHaveBeenCalled();
  });

  //* ------------------ TEST 10: ACTUALIZAR CLIENTE - DOCUMENTO DUPLICADO ------------------//
  test("actualizarCliente - Debe lanzar ConflictError si intenta actualizar a un documento existente", async () => {
    //* A. PREPARAR DATOS (ARRANGE)
    const datosActualizar: ActualizarClienteDto = {
      documentoCliente: "1234567890",
    };

    const clienteExistente: ICliente = {
      idCliente: "c-1",
      nombreCliente: "Juan",
      apellidoCliente: "Pérez",
      emailCliente: "juan@test.com",
      telefonoCliente: "3001234567",
      documentoCliente: "1234567890",
    };

    // Simulamos que el cliente existe
    mockRepo.obtenerClientePorId.mockResolvedValue(clienteExistente);
    // Simulamos que el nuevo documento YA existe (usado por otro cliente)
    mockRepo.existeDocumentoCliente.mockResolvedValue(true);

    //* B. EJECUTAR y VALIDAR (ACT & ASSERT)
    await expect(servicio.actualizarCliente("c-1", datosActualizar)).rejects.toThrow(
      ConflictError
    );
    await expect(servicio.actualizarCliente("c-1", datosActualizar)).rejects.toThrow(
      "Ya existe otro cliente con ese documento de identidad"
    );

    // Verificamos que se llamó a existeDocumentoCliente con el ID para excluir
    expect(mockRepo.existeDocumentoCliente).toHaveBeenCalledWith("1234567890", "c-1");
    // Verificamos que NO se llamó a actualizarCliente
    expect(mockRepo.actualizarCliente).not.toHaveBeenCalled();
  });

  //* ============================================================================
  //* TESTS: ELIMINAR CLIENTE
  //* ============================================================================

  //* ------------------ TEST 11: ELIMINAR CLIENTE - CAMINO FELIZ ------------------//
  test("eliminarCliente - Debe llamar al método eliminar del repositorio", async () => {
    //* A. PREPARAR DATOS (ARRANGE)
    // Simulamos que la eliminación fue exitosa
    mockRepo.eliminarCliente.mockResolvedValue(true);

    //* B. EJECUTAR (ACT)
    await servicio.eliminarCliente("c-1");

    //* C. VALIDAR (ASSERT)
    expect(mockRepo.eliminarCliente).toHaveBeenCalledWith("c-1");
  });

  //* ------------------ TEST 12: ELIMINAR CLIENTE - CLIENTE NO ENCONTRADO ------------------//
  test("eliminarCliente - Debe lanzar NotFoundError si el cliente no existe", async () => {
    //* A. PREPARAR DATOS (ARRANGE)
    // Simulamos que la eliminación falló (cliente no existe)
    mockRepo.eliminarCliente.mockResolvedValue(false);

    //* B. EJECUTAR y VALIDAR (ACT & ASSERT)
    await expect(servicio.eliminarCliente("id-inexistente")).rejects.toThrow(
      NotFoundError
    );
    await expect(servicio.eliminarCliente("id-inexistente")).rejects.toThrow(
      "Cliente no encontrado"
    );

    expect(mockRepo.eliminarCliente).toHaveBeenCalledWith("id-inexistente");
  });
});