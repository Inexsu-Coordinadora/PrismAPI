import { ClienteCasosUso } from "../../../../src/core/aplicacion/casos-uso/entidades/ClienteCasosUso"; 
// Asume que necesitas este DTO para el test de creación
//import { ClienteDTO } from "../../../../src/core/presentacion/esquemas/entidades/clienteEsquema"; 
import { CrearClienteDto } from "../../../../src/core/dominio/entidades/Cliente";

// UUID de prueba para la claridad
const ID_CLIENTE_VALIDO = "a1b2c3d4-e5f6-7890-1234-567890abcdef";

describe("Pruebas Unitarias - ClienteCasosUso (Entidad)", () => {
    let mockRepo: any;
    let servicio: ClienteCasosUso; // Asume que la clase se llama ClienteCasosUso

    beforeEach(() => {  
        // 1. Configuración del Mock del Repositorio de Clientes
        mockRepo = {
            crearCliente: jest.fn(),
            listarClientes: jest.fn(),
            obtenerClientePorId: jest.fn(),
            actualizarCliente: jest.fn(),
            eliminarCliente: jest.fn(),
        };

        // 2. Instanciación del Caso de Uso con el mock inyectado
        // @ts-ignore: Permite inyectar el mock sin preocuparse por la interfaz completa
        servicio = new ClienteCasosUso(mockRepo); 
    });

    //* ------------------ TEST 1: CREAR CLIENTE ------------------//
    test("crearCliente - Debe llamar al repositorio y devolver el ID del nuevo cliente", async () => {
        //* A. PREPARAR DATOS (ARRANGE)
        const datosCliente: CrearClienteDto = {
            nombreCliente: "CAMILO",
            apellidoCliente: "CALLE",
            emailCliente: "test@cliente.com",
            telefonoCliente: "555-1234",
            documentoCliente: "1234567889"
        };
        mockRepo.crearCliente.mockResolvedValue(ID_CLIENTE_VALIDO);

        //* B. EJECUTAR (ACT)
        const resultado = await servicio.crearCliente(datosCliente);

        //* C. VALIDAR (ASSERT)
        expect(mockRepo.crearCliente).toHaveBeenCalledWith(datosCliente);
        expect(resultado).toBe(ID_CLIENTE_VALIDO);  
    });

    //* ------------------ TEST 2: LISTAR CLIENTES ------------------//
    test("listarClientes - Debe llamar al repositorio y devolver una lista de clientes", async () => {
        //* A. PREPARAR DATOS (ARRANGE) 
        const listaSimulada = [
            { idCliente: "c1", nombre: "C1" }, 
            { idCliente: "c2", nombre: "C2" }
        ];
        // El listarTareas de tu ejemplo recibe un límite (10), asumimos que listarClientes hace lo mismo
        const limite = 10;
        mockRepo.listarClientes.mockResolvedValue(listaSimulada); 
         
        //* B. EJECUTAR (ACT)
        const resultado = await servicio.obtenerClientes()//limite;
        
        //* C. VALIDAR (ASSERT)     
        expect(mockRepo.listarClientes).toHaveBeenCalledWith(limite);
        expect(resultado).toEqual(listaSimulada);
    });


    //* ------------------ TEST 3: OBTENER CLIENTE POR ID (Encontrado)------------------//
    test("obtenerClientePorId - Debe llamar al repositorio y devolver un cliente", async () => {
        //* A. PREPARAR DATOS (ARRANGE) 
        const clienteSimulado = { idCliente: ID_CLIENTE_VALIDO, nombre: "Cliente Encontrado" };
        mockRepo.obtenerClientePorId.mockResolvedValue(clienteSimulado);
        
        //* B. EJECUTAR (ACT)  
        const resultado = await servicio.obtenerClientePorId(ID_CLIENTE_VALIDO);
        
        //* C. VALIDAR (ASSERT)
        expect(mockRepo.obtenerClientePorId).toHaveBeenCalledWith(ID_CLIENTE_VALIDO);
        expect(resultado).toEqual(clienteSimulado);    
    }); 

    //* ------------------ TEST 4: OBTENER CLIENTE POR ID (No encontrado)------------------//
    test("obtenerClientePorId - Debe devolver null si el cliente no existe", async () => {
        //* A. PREPARAR DATOS (ARRANGE) 
        const ID_FANTASMA = "id-fantasma-404";
        mockRepo.obtenerClientePorId.mockResolvedValue(null); 
        
        //* B. EJECUTAR (ACT)
        const resultado = await servicio.obtenerClientePorId(ID_FANTASMA);
        
        //* C. VALIDAR (ASSERT)
        expect(mockRepo.obtenerClientePorId).toHaveBeenCalledWith(ID_FANTASMA);
        expect(resultado).toBeNull();    
    });
    
    //* ------------------ TEST 5: ACTUALIZAR CLIENTE ------------------//
    test("actualizarCliente - Debe llamar al repositorio y devolver el cliente actualizado", async () => {
        //* A. PREPARAR DATOS (ARRANGE) 
        const datosActualizados = { nombreCliente: "Cliente Modificado", emailCliente: "nuevo@correo.com" };
        const clienteActualizado = { idCliente: ID_CLIENTE_VALIDO, ...datosActualizados };
        mockRepo.actualizarCliente.mockResolvedValue(clienteActualizado);

        //* B. EJECUTAR (ACT)
        const resultado = await servicio.actualizarCliente(ID_CLIENTE_VALIDO, datosActualizados);

        //* C. VALIDAR (ASSERT)
        expect(mockRepo.actualizarCliente).toHaveBeenCalledWith(ID_CLIENTE_VALIDO, datosActualizados);
        expect(resultado).toEqual(clienteActualizado);
    });

    //* ------------------ TEST 6: ELIMINAR CLIENTE ------------------//
    test("eliminarCliente - Debe llamar al método eliminar del repositorio", async () => {
        //* A. PREPARAR DATOS (ARRANGE) 
        // El método de eliminar en esta capa usualmente retorna void o un booleano
        mockRepo.eliminarCliente.mockResolvedValue(undefined); 

        //* B. EJECUTAR (ACT)
        await servicio.eliminarCliente(ID_CLIENTE_VALIDO);
        
        //* C. VALIDAR (ASSERT)
        expect(mockRepo.eliminarCliente).toHaveBeenCalledWith(ID_CLIENTE_VALIDO);     
    });
});























// import {forEach} from './forEach';

// import { IClienteCasosUso } from '../../../../src/core/aplicacion/interfaces/entidades/IClienteCasosUso';
// import { ClienteCasosUso } from '../../../../src/core/aplicacion/casos-uso/entidades/ClienteCasosUso';
// import { mock } from 'node:test';
// import { IClienteRepositorio } from '../../../../src/core/dominio/repositorio/entidades/IClienteRepositorio';

// const mockCallback = jest.fn(x => 42 + x);

// describe('forEach mock function', () => {
//   let mockClienteRepositorio: jest.Mocked<IClienteRepositorio>;
//   let clienteCasosUso: ClienteCasosUso;

//   beforeEach(() => {

//     mockClienteRepositorio = {

//       crearCliente: jest.fn(),

//       obtenerClientes: jest.fn(),

//       obtenerClientePorId: jest.fn(),

//       actualizarCliente: jest.fn(),

//       eliminarCliente: jest.fn(),

//       existeEmailCliente: jest.fn(),

//       existeDocumentoCliente: jest.fn(),
//     } as jest.Mocked<IClienteRepositorio>;

//     clienteCasosUso = new ClienteCasosUso(mockClienteRepositorio);

//   })


//   it("probar crearCliente", async () => {

//     mockClienteRepositorio.existeEmailCliente.mockResolvedValue(false);
//     mockClienteRepositorio.existeDocumentoCliente.mockResolvedValue(false);
//     mockClienteRepositorio.crearCliente.mockResolvedValue({
//       idCliente: "hola",
//       nombreCliente: "string",
//       apellidoCliente: "string",
//       documentoCliente: 122345,
//       emailCliente: "hola@gmail.com",
//       telefonoCliente: "stri2ng",

//     });
//     const cliente = await clienteCasosUso.crearCliente({
//       nombreCliente: "string",
//       apellidoCliente: "string",
//       emailCliente: "hola@gmail.com",
//       telefonoCliente: "stri2ng",
//       documentoCliente: "string",
//     }
//     )

//     // Verify
//     expect(mockClienteRepositorio.existeEmailCliente).toHaveBeenCalled()
//         expect(mockClienteRepositorio.existeDocumentoCliente).toHaveBeenCalled()
//             expect(mockClienteRepositorio.crearCliente).toHaveBeenCalled()


//     expect(cliente.nombreCliente).toEqual("string");
//   })

//  it("probar crearCliente- caso ya existe email", async () => {

//     mockClienteRepositorio.existeEmailCliente.mockResolvedValue(true);
//     mockClienteRepositorio.existeDocumentoCliente.mockResolvedValue(false);
//     mockClienteRepositorio.crearCliente.mockResolvedValue({
//       idCliente: "sas",
//       nombreCliente: "Prueba2",
//       apellidoCliente: "string",
//       documentoCliente: 122345,
//       emailCliente: "hola@gmail.com",
//       telefonoCliente: "stri2ng",

//     });
//     await expect(clienteCasosUso.crearCliente( {
//       nombreCliente: "string",
//       apellidoCliente: "string",
//       emailCliente: "hola@gmail.com",
//       telefonoCliente: "stri2ng",
//       documentoCliente: "string",  }))
    
//       .rejects
//       .toThrow('Ya existe un cliente con ese email');
//     // const cliente = await clienteCasosUso.crearCliente({
//     //   nombreCliente: "string",
//     //   apellidoCliente: "string",
//     //   emailCliente: "hola@gmail.com",
//     //   telefonoCliente: "stri2ng",
//     //   documentoCliente: "string",
//     // }
//     // )

//     // Verify
//     expect(mockClienteRepositorio.existeEmailCliente).toHaveBeenCalled()
//      expect(mockClienteRepositorio.existeDocumentoCliente).toHaveBeenCalledTimes(0)
//             expect(mockClienteRepositorio.crearCliente).toHaveBeenCalledTimes(0)
//   })



// });