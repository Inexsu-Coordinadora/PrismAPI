/**
 * Test unitarios para el caso de uso de Consultor.
 *
 * Objetivo:
 * - Probar SOLO la lógica de negocio de ConsultorCasosUso.
 * - NO tocar base de datos, ni HTTP, ni Fastify.
 * - Mockear el repositorio(IConsultorRepositorio) para controlar las respuestas.
 */
import { describe, test, beforeEach, expect, jest } from "@jest/globals";
import { ConsultorCasosUso } from "../../../../src/core/aplicacion/casos-uso/entidades/ConsultorCasosUso";
import { IConsultorRepositorio } from "../../../../src/core/dominio/repositorio/entidades/IConsultorRepositorio";
import { IConsultor, DisponibilidadConsultor } from "../../../../src/core/dominio/entidades/IConsultor";
import { ConsultorDTO } from "../../../../src/core/presentacion/esquemas/entidades/consultorEsquema";

describe("Pruebas Unitarias ConsultorCasosUso", () => {
    let consultorRepoMock: jest.Mocked<IConsultorRepositorio>;
    let consultorCasosUso: ConsultorCasosUso;

    beforeEach(() => {
        consultorRepoMock = {
            listarConsultores: jest.fn(),
            obtenerConsultorPorId: jest.fn(),
            crearConsultor: jest.fn(),
            actualizarConsultor: jest.fn(),
            eliminarConsultor: jest.fn(),
        };

        consultorCasosUso = new ConsultorCasosUso(consultorRepoMock);
    });

/**------------------------------------ CASO 1 ------------------------------------ */
    test("obtenerConsultores - retorna todos los consultores sin límite", async () => {
        const consultoresEsperados: IConsultor[] = [
            {
                idConsultor: "c1",
                nombreConsultor: "Ana Pérez",
                especialidadConsultor: "Tester",
                disponibilidadConsultor: DisponibilidadConsultor.DISPONIBLE,
                emailConsultor: "ana@mail.com",
                telefonoConsultor: "3000000001",
            },
            {
                idConsultor: "c2",
                nombreConsultor: "Juan Gómez",
                especialidadConsultor: "Backend",
                disponibilidadConsultor: DisponibilidadConsultor.OCUPADO,
                emailConsultor: "juan@mail.com",
                telefonoConsultor: "3000000002",
            },
        ];

        consultorRepoMock.listarConsultores.mockResolvedValue(consultoresEsperados);
        const resultado = await consultorCasosUso.obtenerConsultores();

        expect(consultorRepoMock.listarConsultores).toHaveBeenCalled();
        expect(resultado).toEqual(consultoresEsperados);
    });

/**------------------------------------ CASO 2 ------------------------------------ */
    test("obtenerConsultores - respeta el límite si se envía", async () => {
        const consultores: IConsultor[] = [
            {
                idConsultor: "c1",
                nombreConsultor: "Ana Pérez",
                especialidadConsultor: "Tester",
                disponibilidadConsultor: DisponibilidadConsultor.DISPONIBLE,
                emailConsultor: "ana@mail.com",
                telefonoConsultor: "3000000001",  
            },
            {
                idConsultor: "c2",
                nombreConsultor: "Juan Gómez",
                especialidadConsultor: "Backend",
                disponibilidadConsultor: DisponibilidadConsultor.OCUPADO,
                emailConsultor: "juan@mail.com",
                telefonoConsultor: "3000000002",
            },
            {
                idConsultor: "c3",
                nombreConsultor: "Luisa Díaz",
                especialidadConsultor: "Frontend",
                disponibilidadConsultor: DisponibilidadConsultor.EN_DESCANSO,
                emailConsultor: "luisa@mail.com",
                telefonoConsultor: "3000000003", 
            },
        ];

        const limite = 2;

        consultorRepoMock.listarConsultores.mockResolvedValue(
            consultores.slice(0, limite)
        );

        const resultado = await consultorCasosUso.obtenerConsultores(limite);
        
        expect(consultorRepoMock.listarConsultores).toHaveBeenCalledWith(limite);
        expect(resultado).toEqual(consultores.slice(0, limite));
    });

/**------------------------------------ CASO 3 ------------------------------------ */
    test("obtenerConsultorPorId - retorna un consultor existente", async () => {
        const consultorEsperado: IConsultor = {
            idConsultor: "c1",
            nombreConsultor: "Ana Pérez",
            especialidadConsultor: "Tester",
            disponibilidadConsultor: DisponibilidadConsultor.DISPONIBLE,
            emailConsultor: "ana@mail.com",
            telefonoConsultor: "3000000001",
        };

        consultorRepoMock.obtenerConsultorPorId.mockResolvedValue(consultorEsperado);

        const id = "c1";

        const resultado = await consultorCasosUso.obtenerConsultorPorId(id);

        expect(consultorRepoMock.obtenerConsultorPorId).toHaveBeenCalledWith(id);
        expect(resultado).toEqual(consultorEsperado);
    });

/**------------------------------------ CASO 4 ------------------------------------ */
    test("obtenerConsultorPorId - retorna null si el consultor no existe", async () => {
        consultorRepoMock.obtenerConsultorPorId.mockResolvedValue(null);

        const id = "no-existe";
        const resultado = await consultorCasosUso.obtenerConsultorPorId(id);

        expect(consultorRepoMock.obtenerConsultorPorId).toHaveBeenCalledWith(id);
        expect(resultado).toBeNull();
    });

/**------------------------------------ CASO 5 ------------------------------------ */
    test("crearConsultor - mapea el DTO al dominio y llama al repositorio", async () => {
        const datosEntrada: ConsultorDTO = {
            nombreConsultor: "Ana Pérez",
            especialidadConsultor: "Tester",
            disponibilidadConsultor: DisponibilidadConsultor.DISPONIBLE,
            emailConsultor: "ana@mail.com",
            telefonoConsultor: undefined,
        };
        const consultorCreado: IConsultor = {
            idConsultor: "c1",
            nombreConsultor: datosEntrada.nombreConsultor,
            especialidadConsultor: datosEntrada.especialidadConsultor,
            disponibilidadConsultor: datosEntrada.disponibilidadConsultor,
            emailConsultor: datosEntrada.emailConsultor,
            telefonoConsultor: null,
        };

        consultorRepoMock.crearConsultor.mockResolvedValue(consultorCreado);

        const resultado = await consultorCasosUso.crearConsultor(datosEntrada);
        
        expect(consultorRepoMock.crearConsultor).toHaveBeenCalled();

        const argumentoLlamada = consultorRepoMock.crearConsultor.mock.calls[0][0]; 

        expect(argumentoLlamada).toEqual({
        nombreConsultor: datosEntrada.nombreConsultor,
        especialidadConsultor: datosEntrada.especialidadConsultor,
        disponibilidadConsultor: datosEntrada.disponibilidadConsultor,
        emailConsultor: datosEntrada.emailConsultor,
        telefonoConsultor: null,
        });

        expect(resultado).toEqual(consultorCreado);
    });

/**------------------------------------ CASO 6 ------------------------------------ */
    test("actualizarConsultor - delega en el repositorio con los campos parciales", async () => {
        const idConsultor = "c1";
        const datosActualizacion = {
            nombreConsultor: "Nombre actualizado",
            emailConsultor: "nuevo@mail.com",  
        };

        const consultorActualizado: IConsultor = {
            idConsultor,
            nombreConsultor: "Nombre actualizado",
            especialidadConsultor: "Tester",
            disponibilidadConsultor: DisponibilidadConsultor.DISPONIBLE,
            emailConsultor: "nuevo@mail.com",
            telefonoConsultor: "3000000001",
        };

        consultorRepoMock.actualizarConsultor.mockResolvedValue(consultorActualizado);

        const resultado = await consultorCasosUso.actualizarConsultor(
            idConsultor,
            datosActualizacion
        );

        expect(consultorRepoMock.actualizarConsultor).toHaveBeenCalledWith(
            idConsultor,
            expect.objectContaining(datosActualizacion)
        );
        expect(resultado).toEqual(consultorActualizado);
    });

/**------------------------------------ CASO 7 ------------------------------------ */
    test("eliminarConsultor - llama al repositorio para eliminar", async () => {
        const idConsultor = "c1";

        consultorRepoMock.eliminarConsultor.mockResolvedValue();

        await consultorCasosUso.eliminarConsultor(idConsultor);

        expect(consultorRepoMock.eliminarConsultor).toHaveBeenCalledWith(idConsultor);
    });
});