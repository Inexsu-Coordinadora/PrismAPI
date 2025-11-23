import { ClienteCasosUso } from "../../../../src/core/aplicacion/casos-uso/entidades/ClienteCasosUso";
import { CrearClienteDto, ActualizarClienteDto } from "../../../../src/core/dominio/entidades/Cliente";
import { NotFoundError, ConflictError } from "../../../../src/common/errores/AppError";
import { ICliente } from "../../../../src/core/dominio/entidades/ICliente";

describe("Pruebas Unitarias - ClienteCasosUso (Entidad)", () => {
  let mockRepo: any;
  let servicio: ClienteCasosUso;

  beforeEach(() => {

    mockRepo = {
      crearCliente: jest.fn(),
      obtenerClientes: jest.fn(),
      obtenerClientePorId: jest.fn(),
      actualizarCliente: jest.fn(),
      eliminarCliente: jest.fn(),
      existeEmailCliente: jest.fn(),
      existeDocumentoCliente: jest.fn(),
    };

    servicio = new ClienteCasosUso(mockRepo);
  });


  //*  TEST 1: CREAR CLIENTE - CAMINO FELIZ 
  test("crearCliente - Debe crear un cliente y devolver los datos del cliente creado", async () => {

    const datosCliente: CrearClienteDto = {
      nombreCliente: "Juan",
      apellidoCliente: "Pérez",
      emailCliente: "juan@test.com",
      telefonoCliente: "3001234567",
      documentoCliente: 1234567890,
    };

    const clienteCreado: ICliente = {
      idCliente: "nuevo-id-123",
      ...datosCliente,
     } as ICliente;

    
    mockRepo.existeEmailCliente.mockResolvedValue(false);
    mockRepo.existeDocumentoCliente.mockResolvedValue(false);
    mockRepo.crearCliente.mockResolvedValue(clienteCreado);


    const resultado = await servicio.crearCliente(datosCliente);

    expect(mockRepo.existeEmailCliente).toHaveBeenCalledWith("juan@test.com");
    expect(mockRepo.existeDocumentoCliente).toHaveBeenCalledWith("1234567890");
    expect(mockRepo.crearCliente).toHaveBeenCalledWith(datosCliente);
    expect(resultado).toEqual(clienteCreado);
  });

  //*  TEST 2: CREAR CLIENTE - EMAIL DUPLICADO 
  test("crearCliente - Debe lanzar ConflictError si el email ya existe", async () => {

    const datosCliente: CrearClienteDto = {
      nombreCliente: "María",
      apellidoCliente: "García",
      emailCliente: "duplicado@test.com",
      telefonoCliente: "3009876543",
      documentoCliente: 9876543210,
    };

   
    mockRepo.existeEmailCliente.mockResolvedValue(true);


    await expect(servicio.crearCliente(datosCliente)).rejects.toThrow(ConflictError);
    await expect(servicio.crearCliente(datosCliente)).rejects.toThrow(
      "Ya existe un cliente con ese email"
    );

    
    expect(mockRepo.crearCliente).not.toHaveBeenCalled();
  });

  //*  TEST 3: CREAR CLIENTE - DOCUMENTO DUPLICADO
  test("crearCliente - Debe lanzar ConflictError si el documento ya existe", async () => {
    
    const datosCliente: CrearClienteDto = {
      nombreCliente: "Carlos",
      apellidoCliente: "López",
      emailCliente: "carlos@test.com",
      telefonoCliente: "3001112222",
      documentoCliente: 12345678, 
    };

    mockRepo.existeEmailCliente.mockResolvedValue(false);
    mockRepo.existeDocumentoCliente.mockResolvedValue(true);

    await expect(servicio.crearCliente(datosCliente)).rejects.toThrow(ConflictError);
    await expect(servicio.crearCliente(datosCliente)).rejects.toThrow(
      "Ya existe un cliente con ese documento de identidad"
    );

  
    expect(mockRepo.crearCliente).not.toHaveBeenCalled();
  });


  //*  TEST 4: LISTAR CLIENTES 
  test("obtenerClientes - Debe llamar al repositorio y devolver una lista de clientes", async () => {
   
    const listaSimulada: ICliente[] = [
      {
        idCliente: "c-1",
        nombreCliente: "Juan",
        apellidoCliente: "Pérez",
        emailCliente: "juan@test.com",
        telefonoCliente: "3001234567",
        documentoCliente: 1234567890,
      },
      {
        idCliente: "c-2",
        nombreCliente: "María",
        apellidoCliente: "García",
        emailCliente: "maria@test.com",
        telefonoCliente: "3009876543",
        documentoCliente: 9087654321,
      },
    ];

    mockRepo.obtenerClientes.mockResolvedValue(listaSimulada);

    const resultado = await servicio.obtenerClientes();

    expect(mockRepo.obtenerClientes).toHaveBeenCalled();
    expect(resultado).toEqual(listaSimulada);
    expect(resultado).toHaveLength(2);
  });

  //*  TEST 5: OBTENER CLIENTE POR ID - CLIENTE ENCONTRADO 
  test("obtenerClientePorId - Debe llamar al repositorio y devolver el cliente", async () => {
    
    const clienteSimulado: ICliente = {
      idCliente: "c-1",
      nombreCliente: "Juan",
      apellidoCliente: "Pérez",
      emailCliente: "juan@test.com",
      telefonoCliente: "3001234567",
      documentoCliente: 1234567890,
    };

    mockRepo.obtenerClientePorId.mockResolvedValue(clienteSimulado);

    const resultado = await servicio.obtenerClientePorId("c-1");

 
    expect(mockRepo.obtenerClientePorId).toHaveBeenCalledWith("c-1");
    expect(resultado).toEqual(clienteSimulado);
  });

  //* TEST 6: OBTENER CLIENTE POR ID - CLIENTE NO ENCONTRADO 
  test("obtenerClientePorId - Debe lanzar NotFoundError si el cliente no existe", async () => {
    
    mockRepo.obtenerClientePorId.mockResolvedValue(null);

    await expect(servicio.obtenerClientePorId("id-inexistente")).rejects.toThrow(
      NotFoundError
    );
    await expect(servicio.obtenerClientePorId("id-inexistente")).rejects.toThrow(
      "Cliente no encontrado"
    );

    expect(mockRepo.obtenerClientePorId).toHaveBeenCalledWith("id-inexistente");
  });

  //* TEST 7: ACTUALIZAR CLIENTE - CAMINO FELIZ 
  test("actualizarCliente - Debe actualizar el cliente y devolver los datos actualizados", async () => {

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
      documentoCliente: 1234567890,
    };

    const clienteActualizado: ICliente = {
      ...clienteExistente,
      nombreCliente: "Juan Carlos",
      telefonoCliente: "3009998888",
    };

  
    mockRepo.obtenerClientePorId.mockResolvedValue(clienteExistente);
    mockRepo.actualizarCliente.mockResolvedValue(clienteActualizado);


    const resultado = await servicio.actualizarCliente("c-1", datosActualizar);

  
    expect(mockRepo.obtenerClientePorId).toHaveBeenCalledWith("c-1");
    expect(mockRepo.actualizarCliente).toHaveBeenCalledWith("c-1", datosActualizar);
    expect(resultado).toEqual(clienteActualizado);
  });

  //*  TEST 8: ACTUALIZAR CLIENTE - CLIENTE NO ENCONTRADO 
  test("actualizarCliente - Debe lanzar NotFoundError si el cliente no existe", async () => {
    
    const datosActualizar: ActualizarClienteDto = {
      nombreCliente: "Intento Fallido",
    };

  
    mockRepo.obtenerClientePorId.mockResolvedValue(null);

    await expect(
      servicio.actualizarCliente("id-inexistente", datosActualizar)
    ).rejects.toThrow(NotFoundError);
    await expect(
      servicio.actualizarCliente("id-inexistente", datosActualizar)
    ).rejects.toThrow("Cliente no encontrado");

   
    expect(mockRepo.actualizarCliente).not.toHaveBeenCalled();
  });

  //*  TEST 9: ACTUALIZAR CLIENTE - EMAIL DUPLICADO 
  test("actualizarCliente - Debe lanzar ConflictError si intenta actualizar a un email existente", async () => {

    const datosActualizar: ActualizarClienteDto = {
      emailCliente: "email-duplicado@test.com",
    };

    const clienteExistente: ICliente = {
      idCliente: "c-1",
      nombreCliente: "Juan",
      apellidoCliente: "Pérez",
      emailCliente: "juan@test.com",
      telefonoCliente: "3001234567",
      documentoCliente: 1234567890,
    };


    mockRepo.obtenerClientePorId.mockResolvedValue(clienteExistente);

    mockRepo.existeEmailCliente.mockResolvedValue(true);

  
    await expect(servicio.actualizarCliente("c-1", datosActualizar)).rejects.toThrow(
      ConflictError
    );
    await expect(servicio.actualizarCliente("c-1", datosActualizar)).rejects.toThrow(
      "Ya existe otro cliente con ese email"
    );

    expect(mockRepo.existeEmailCliente).toHaveBeenCalledWith(
      "email-duplicado@test.com",
      "c-1"
    );
    // Verificamos que NO se llamó a actualizarCliente
    expect(mockRepo.actualizarCliente).not.toHaveBeenCalled();
  });

  //* TEST 10: ACTUALIZAR CLIENTE - DOCUMENTO DUPLICADO 
  test("actualizarCliente - Debe lanzar ConflictError si intenta actualizar a un documento existente", async () => {

    const datosActualizar: ActualizarClienteDto = {
      documentoCliente: 1234567890,
    };

    const clienteExistente: ICliente = {
      idCliente: "c-1",
      nombreCliente: "Juan",
      apellidoCliente: "Pérez",
      emailCliente: "juan@test.com",
      telefonoCliente: "3001234567",
      documentoCliente: 1234567890,
    };

    
    mockRepo.obtenerClientePorId.mockResolvedValue(clienteExistente);
    
    mockRepo.existeDocumentoCliente.mockResolvedValue(true);

    await expect(servicio.actualizarCliente("c-1", datosActualizar)).rejects.toThrow(
      ConflictError
    );
    await expect(servicio.actualizarCliente("c-1", datosActualizar)).rejects.toThrow(
      "Ya existe otro cliente con ese documento de identidad"
    );

    expect(mockRepo.existeDocumentoCliente).toHaveBeenCalledWith("1234567890", "c-1");
    
    expect(mockRepo.actualizarCliente).not.toHaveBeenCalled();
  });

  
  //*  TEST 11: ELIMINAR CLIENTE - CAMINO FELIZ //
  test("eliminarCliente - Debe llamar al método eliminar del repositorio", async () => {
    
    mockRepo.eliminarCliente.mockResolvedValue(true);


    await servicio.eliminarCliente("c-1");

  
    expect(mockRepo.eliminarCliente).toHaveBeenCalledWith("c-1");
  });

  //* TEST 12: ELIMINAR CLIENTE - CLIENTE NO ENCONTRADO //
  test("eliminarCliente - Debe lanzar NotFoundError si el cliente no existe", async () => {
   
    mockRepo.eliminarCliente.mockResolvedValue(false);

    await expect(servicio.eliminarCliente("id-inexistente")).rejects.toThrow(
      NotFoundError
    );
    await expect(servicio.eliminarCliente("id-inexistente")).rejects.toThrow(
      "Cliente no encontrado"
    );

    expect(mockRepo.eliminarCliente).toHaveBeenCalledWith("id-inexistente");
  });
});