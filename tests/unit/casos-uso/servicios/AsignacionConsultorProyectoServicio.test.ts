import { AsignacionConsultorProyectoDTO } from "../../../../src/core/presentacion/esquemas/servicios/asignacionConsultorProyectoEsquema";
import { GestionAsignacionConsultor } from "../../../../src/core/aplicacion/gestion-servicio/GestionAsignacionConsultor";
import { IAsignacionConsultorProyectoRepositorio } from "../../../../src/core/dominio/repositorio/servicios/IAsignacionConsultorProyectoRepositorio";

import { AsignacionConsultorProyectoServicio } from "../../../../src/core/aplicacion/casos-uso/servicios/AsignacionConsultorProyectoServicio";


import { NotFoundError, ValidationError, ConflictError } from "../../../../src/common/errores/AppError";
import { date } from "zod";

describe("Pruebas unitarias AsignacionConsultorProyectoServicio", () => {
    let ValidadorMock : jest.Mocked<GestionAsignacionConsultor>;
    let AsignacionRepoMock : jest.Mocked<IAsignacionConsultorProyectoRepositorio>;

    let servicio: AsignacionConsultorProyectoServicio;

    beforeEach(()=>{

        AsignacionRepoMock ={
        asignarConsultorProyecto : jest.fn(),
        obtenerAsignacionPorId : jest.fn(),
        obtenerAsignacionPorConsultor : jest.fn(),
        obtenerAsignacionPorProyecto : jest.fn(),
        obtenerAsignacionExistente : jest.fn(),
        obtenerDedicacionConsultor : jest.fn(),
        actualizarAsignacion : jest.fn(),
        eliminarAsignacion : jest.fn(),
    };

    ValidadorMock = {
            validarAsignacion: jest.fn(),
            // Las demás propiedades y métodos privados se ignoran al mockear solo el método público
        } as unknown as jest.Mocked<GestionAsignacionConsultor>;


    servicio = new AsignacionConsultorProyectoServicio(
        AsignacionRepoMock,
        ValidadorMock
    )

});

// TESTS

//TEST 1: Camino Felíz
test ("Crear Asignación- debe retornar el ID si todo es válido", async () => {

    const idGenerado = "nueva-asignacion-id";
    
    const datosAsignacion: AsignacionConsultorProyectoDTO = {
            idConsultor: "consultor-1",
            idProyecto: "proyecto-1",
            rolConsultor: "Jefe",
            porcentajeDedicacion: 50,
            fechaInicioAsignacion: new Date(),
            fechaFinAsignacion: new Date(),
        };
 //* 1. El validador no debe lanzar error
        ValidadorMock.validarAsignacion.mockResolvedValue(undefined);

        //* 2. El repositorio debe retornar el ID generado
        AsignacionRepoMock.asignarConsultorProyecto.mockResolvedValue(idGenerado);

        // Ejecutar el método
        const resultado = await servicio.asignarConsultorProyecto(datosAsignacion);

        // Verificaciones
        // 1. Verificamos que el validador fue llamado ANTES de ir al repositorio
        expect(ValidadorMock.validarAsignacion).toHaveBeenCalledWith(datosAsignacion);
        
        // 2. Verificamos que el repositorio fue llamado
        expect(AsignacionRepoMock.asignarConsultorProyecto).toHaveBeenCalledWith(datosAsignacion);

        // 3. Verificamos la respuesta esperada del servicio
        expect(resultado).toEqual({
            mensaje: "Consultor asignado exitosamente al proyecto",
            asignacion: idGenerado
        });
    });

    //TEST 2: ERROR (CONFLICTO)
    test("asignarConsultorProyecto - Debe lanzar ConflictError si el validador detecta duplicidad", async () => {
        const datosAsignacion: AsignacionConsultorProyectoDTO = {
            idConsultor: "consultor-duplicado",
            idProyecto: "proyecto-1",
            rolConsultor: "Dev",
            porcentajeDedicacion: 100,
            fechaInicioAsignacion: new Date(),
            fechaFinAsignacion: null,
        };
        
        // Instruir al Validador para que lance el error de negocio
        ValidadorMock.validarAsignacion.mockRejectedValue(
            new ConflictError("Ya existe una asignación de este consultor a este proyecto.")
        );

        // Ejecutar y verificar que se lanza la excepción
        await expect(servicio.asignarConsultorProyecto(datosAsignacion)).rejects.toThrow(ConflictError);
        await expect(servicio.asignarConsultorProyecto(datosAsignacion)).rejects.toThrow("Ya existe una asignación de este consultor a este proyecto.");

        // Verificamos que el repositorio NUNCA fue llamado, ya que falló la validación
        expect(AsignacionRepoMock.asignarConsultorProyecto).not.toHaveBeenCalled();
    });
    
    // TEST 3: obtenerAsignacionPorId - Caso no encontrado
    test("obtenerAsignacionPorId - Debe devolver null si la asignación no existe", async () => {
        
        const idInexistente = "id-inexistente";
        
        // El repositorio devuelve null
        AsignacionRepoMock.obtenerAsignacionPorId.mockResolvedValue(null);

        const resultado = await servicio.obtenerAsignacionPorId(idInexistente);

        // Verificaciones
        expect(AsignacionRepoMock.obtenerAsignacionPorId).toHaveBeenCalledWith(idInexistente);
        expect(resultado).toBeNull();
    });

    //TEST 4: eliminarAsignacion - Caso exitoso (Verificar llamada a repositorio)
    test("eliminarAsignacion - Debe llamar al repositorio para eliminar la asignación por ID", async () => {
        
        // Usamos un ID literal en lugar de una constante base
        const idAsignacion = "asignacion-123"; 
        
        // El repositorio no devuelve nada (void)
        AsignacionRepoMock.eliminarAsignacion.mockResolvedValue(undefined);

        await servicio.eliminarAsignacion(idAsignacion);

        // Verificaciones
        expect(AsignacionRepoMock.eliminarAsignacion).toHaveBeenCalledWith(idAsignacion);
        expect(AsignacionRepoMock.eliminarAsignacion).toHaveBeenCalledTimes(1);
    });

})