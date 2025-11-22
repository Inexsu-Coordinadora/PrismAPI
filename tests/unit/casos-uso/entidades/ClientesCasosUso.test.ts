// import {forEach} from './forEach';

import { IClienteCasosUso } from '../../../../src/core/aplicacion/interfaces/entidades/IClienteCasosUso';
import { ClienteCasosUso } from '../../../../src/core/aplicacion/casos-uso/entidades/ClienteCasosUso';
import { mock } from 'node:test';
import { IClienteRepositorio } from '../../../../src/core/dominio/repositorio/entidades/IClienteRepositorio';

const mockCallback = jest.fn(x => 42 + x);

describe('forEach mock function', () => {
  let mockClienteRepositorio: jest.Mocked<IClienteRepositorio>;
  let clienteCasosUso: ClienteCasosUso;

  beforeEach(() => {

    mockClienteRepositorio = {

      crearCliente: jest.fn(),

      obtenerClientes: jest.fn(),

      obtenerClientePorId: jest.fn(),

      actualizarCliente: jest.fn(),

      eliminarCliente: jest.fn(),

      existeEmailCliente: jest.fn(),

      existeDocumentoCliente: jest.fn(),
    } as jest.Mocked<IClienteRepositorio>;

    clienteCasosUso = new ClienteCasosUso(mockClienteRepositorio);

  })


  it("probar crearCliente", async () => {

    mockClienteRepositorio.existeEmailCliente.mockResolvedValue(false);
    mockClienteRepositorio.existeDocumentoCliente.mockResolvedValue(false);
    mockClienteRepositorio.crearCliente.mockResolvedValue({
      idCliente: "hola",
      nombreCliente: "string",
      apellidoCliente: "string",
      documentoCliente: 122345,
      emailCliente: "hola@gmail.com",
      telefonoCliente: "stri2ng",

    });
    const cliente = await clienteCasosUso.crearCliente({
      nombreCliente: "string",
      apellidoCliente: "string",
      emailCliente: "hola@gmail.com",
      telefonoCliente: "stri2ng",
      documentoCliente: "string",
    }
    )

    // Verify
    expect(mockClienteRepositorio.existeEmailCliente).toHaveBeenCalled()
        expect(mockClienteRepositorio.existeDocumentoCliente).toHaveBeenCalled()
            expect(mockClienteRepositorio.crearCliente).toHaveBeenCalled()


    expect(cliente.nombreCliente).toEqual("string");
  })

 it("probar crearCliente- caso ya existe email", async () => {

    mockClienteRepositorio.existeEmailCliente.mockResolvedValue(true);
    mockClienteRepositorio.existeDocumentoCliente.mockResolvedValue(false);
    mockClienteRepositorio.crearCliente.mockResolvedValue({
      idCliente: "sas",
      nombreCliente: "Prueba2",
      apellidoCliente: "string",
      documentoCliente: 122345,
      emailCliente: "hola@gmail.com",
      telefonoCliente: "stri2ng",

    });
    await expect(clienteCasosUso.crearCliente( {
      nombreCliente: "string",
      apellidoCliente: "string",
      emailCliente: "hola@gmail.com",
      telefonoCliente: "stri2ng",
      documentoCliente: "string",  }))
    
      .rejects
      .toThrow('Ya existe un cliente con ese email');
    // const cliente = await clienteCasosUso.crearCliente({
    //   nombreCliente: "string",
    //   apellidoCliente: "string",
    //   emailCliente: "hola@gmail.com",
    //   telefonoCliente: "stri2ng",
    //   documentoCliente: "string",
    // }
    // )

    // Verify
    expect(mockClienteRepositorio.existeEmailCliente).toHaveBeenCalled()
     expect(mockClienteRepositorio.existeDocumentoCliente).toHaveBeenCalledTimes(0)
            expect(mockClienteRepositorio.crearCliente).toHaveBeenCalledTimes(0)
  })



});