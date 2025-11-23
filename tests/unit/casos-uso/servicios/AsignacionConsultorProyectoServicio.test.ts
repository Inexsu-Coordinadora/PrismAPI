import { AsignacionConsultorProyectoDTO } from "../../../../src/core/presentacion/esquemas/servicios/asignacionConsultorProyectoEsquema";
import { GestionAsignacionConsultor } from "../../../../src/core/aplicacion/gestion-servicio/GestionAsignacionConsultor";
import { IAsignacionConsultorProyectoRepositorio } from "../../../../src/core/dominio/repositorio/servicios/IAsignacionConsultorProyectoRepositorio";
import { AsignacionConsultorProyectoServicio } from "../../../../src/core/aplicacion/casos-uso/servicios/AsignacionConsultorProyectoServicio";
import { IAsignacionConsultorProyecto } from "../../../../src/core/dominio/servicios/IAsignacionConsultorProyecto";
import { ActualizarAsignacionConsultorproyectoDTO } from "../../../../src/core/presentacion/esquemas/servicios/asignacionConsultorProyectoEsquema";
import { NotFoundError, ValidationError, ConflictError } from "../../../../src/common/errores/AppError";

const idBase = "asignacion-101";
const ASIGNACION_BASE: IAsignacionConsultorProyecto = {
            idAsignacion: idBase,
            idConsultor: "consultor-001",
            idProyecto: "proyecto-alpha",
            rolConsultor: "Developer",
            porcentajeDedicacion: 75,
            fechaInicioAsignacion: new Date("2024-01-01"),
            fechaFinAsignacion: new Date("2024-12-31"),
        };


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
        } as unknown as jest.Mocked<GestionAsignacionConsultor>;


    servicio = new AsignacionConsultorProyectoServicio(
        AsignacionRepoMock,
        ValidadorMock
    )

});

// ---------------------------------------TESTS-------------------------------------------//

//------------------TEST 1: Crear Asignación- Camino Felíz--------------------------------//
test ("Crear Asignación- debe retornar el ID si todo es válido", async () => {

     //* A. PREPARAR DATOS (ARRANGE)
    const idGenerado = "nueva-asignacion-id";    
    const datosAsignacion: AsignacionConsultorProyectoDTO = {
            idConsultor: "consultor-1",
            idProyecto: "proyecto-1",
            rolConsultor: "Jefe",
            porcentajeDedicacion: 50,
            fechaInicioAsignacion: new Date(),
            fechaFinAsignacion: new Date(),
        };

        ValidadorMock.validarAsignacion.mockResolvedValue(undefined);
        
        AsignacionRepoMock.asignarConsultorProyecto.mockResolvedValue(idGenerado);

        // B. EJECUTAR
        const resultado = await servicio.asignarConsultorProyecto(datosAsignacion);

        // C. VALIDAR       
        expect(ValidadorMock.validarAsignacion).toHaveBeenCalledWith(datosAsignacion);        
        expect(AsignacionRepoMock.asignarConsultorProyecto).toHaveBeenCalledWith(datosAsignacion); 
        
        expect(resultado).toEqual({
            mensaje: "Consultor asignado exitosamente al proyecto",
            asignacion: idGenerado
        });
    });

    //----------------------------------TEST 2: ERROR (CONFLICTO)-------------------------------//
    test("asignarConsultorProyecto - Debe lanzar ConflictError si el validador detecta duplicidad", async () => {
        const datosAsignacion: AsignacionConsultorProyectoDTO = {
            idConsultor: "consultor-duplicado",
            idProyecto: "proyecto-1",
            rolConsultor: "Dev",
            porcentajeDedicacion: 100,
            fechaInicioAsignacion: new Date(),
            fechaFinAsignacion: null,
        };        
        
        ValidadorMock.validarAsignacion.mockRejectedValue(
            new ConflictError("Ya existe una asignación de este consultor a este proyecto.")
        );

        // B. EJECUTAR Y VALIDAR
        await expect(servicio.asignarConsultorProyecto(datosAsignacion)).rejects.toThrow(ConflictError);
        await expect(servicio.asignarConsultorProyecto(datosAsignacion)).rejects.toThrow("Ya existe una asignación de este consultor a este proyecto.");
        
        expect(AsignacionRepoMock.asignarConsultorProyecto).not.toHaveBeenCalled();
    });
    
    // ----------------------TEST 3: obtenerAsignacionPorId - Caso no encontrado---------------//
    test("obtenerAsignacionPorId - Debe devolver null si la asignación no existe", async () => {
        
        const idInexistente = "id-inexistente";        
        
        AsignacionRepoMock.obtenerAsignacionPorId.mockResolvedValue(null);

        const resultado = await servicio.obtenerAsignacionPorId(idInexistente);        

        expect(AsignacionRepoMock.obtenerAsignacionPorId).toHaveBeenCalledWith(idInexistente);
        expect(resultado).toBeNull();
    });

    // -------------TEST 5: obtenerAsignacionPorConsultor - Caso exitoso---------------------//
    test("obtenerAsignacionPorConsultor - Debe devolver un array de asignaciones para un consultor", async () => {
        
        const idConsultor = ASIGNACION_BASE.idConsultor;        
        
        const asignacionesEsperadas = [ASIGNACION_BASE, { ...ASIGNACION_BASE, idAsignacion: "asignacion-102", idProyecto: "proyecto-beta" }];        
        
        AsignacionRepoMock.obtenerAsignacionPorConsultor.mockResolvedValue(asignacionesEsperadas);

        const resultado = await servicio.obtenerAsignacionPorConsultor(idConsultor);

        expect(AsignacionRepoMock.obtenerAsignacionPorConsultor).toHaveBeenCalledWith(idConsultor);
        expect(resultado).toEqual(asignacionesEsperadas);
        expect(resultado.length).toBe(2);
    });


    //-----------------TEST 6: obtenerAsignacionPorProyecto - Caso exitoso-----------------------//
    test("obtenerAsignacionPorProyecto - Debe devolver un array de asignaciones para un proyecto", async () => {
        
        const idProyecto = ASIGNACION_BASE.idProyecto        

        const asignacionesEsperadas = [ASIGNACION_BASE, { ...ASIGNACION_BASE, idAsignacion: "asignacion-103", idConsultor: "consultor-002" }];        
    
        AsignacionRepoMock.obtenerAsignacionPorProyecto.mockResolvedValue(asignacionesEsperadas);

        const resultado = await servicio.obtenerAsignacionPorProyecto(idProyecto);
        
        expect(AsignacionRepoMock.obtenerAsignacionPorProyecto).toHaveBeenCalledWith(idProyecto);
        expect(resultado).toEqual(asignacionesEsperadas);
        expect(resultado.length).toBe(2);
    });

    //------------ TEST 7: obtenerAsignacionExistente - Caso encontrado-----------------//
    test("obtenerAsignacionExistente - Debe devolver la asignación si existe", async () => {
        
        const idConsultor = ASIGNACION_BASE.idConsultor;
        const idProyecto = ASIGNACION_BASE.idProyecto;
        const rolConsultor = ASIGNACION_BASE.rolConsultor;
        
        AsignacionRepoMock.obtenerAsignacionExistente.mockResolvedValue(ASIGNACION_BASE);

        const resultado = await servicio.obtenerAsignacionExistente(idConsultor, idProyecto, rolConsultor as string);


        expect(AsignacionRepoMock.obtenerAsignacionExistente).toHaveBeenCalledWith(idConsultor, idProyecto, rolConsultor);
        expect(resultado).toEqual(ASIGNACION_BASE);
    });



    //--------------------TEST 8: obtenerDedicacionConsultor - Caso exitoso------------------//
    test("obtenerDedicacionConsultor - Debe devolver la suma de dedicación existente", async () => {
        
        const idConsultor = ASIGNACION_BASE.idConsultor;
        const fechaInicio = ASIGNACION_BASE.fechaInicioAsignacion;
        const fechaFin = ASIGNACION_BASE.fechaFinAsignacion;
        const totalDedicacionMock = 50;

        AsignacionRepoMock.obtenerDedicacionConsultor.mockResolvedValue(totalDedicacionMock);

        const resultado = await servicio.obtenerDedicacionConsultor(idConsultor, fechaInicio, fechaFin as Date);

        
        expect(AsignacionRepoMock.obtenerDedicacionConsultor).toHaveBeenCalledWith(idConsultor, fechaInicio, fechaFin);
        expect(resultado).toBe(totalDedicacionMock);
    });


    //-----------------------TEST 9: actualizarAsignacion - Camino Feliz----------------//
    test("actualizarAsignacion - Debe actualizar y devolver la asignación modificada", async () => {
        const idAsignacion = idBase;
                
        const datosActualizacion: ActualizarAsignacionConsultorproyectoDTO = {
            porcentajeDedicacion: 90,
            rolConsultor: "Líder Técnico",
        };
        const asignacionActualizada: IAsignacionConsultorProyecto = {
            ...ASIGNACION_BASE,
            ...datosActualizacion,
        };
        
        AsignacionRepoMock.obtenerAsignacionPorId.mockResolvedValue(ASIGNACION_BASE);
    
        ValidadorMock.validarAsignacion.mockResolvedValue(undefined);
        
        AsignacionRepoMock.actualizarAsignacion.mockResolvedValue(asignacionActualizada);
        
        const resultado = await servicio.actualizarAsignacion(idAsignacion, datosActualizacion);

        expect(AsignacionRepoMock.obtenerAsignacionPorId).toHaveBeenCalledWith(idAsignacion);
        
        expect(ValidadorMock.validarAsignacion).toHaveBeenCalledWith(
            expect.objectContaining({
                ...ASIGNACION_BASE,
                ...datosActualizacion,
            }), 
            idAsignacion
        );
        
        expect(AsignacionRepoMock.actualizarAsignacion).toHaveBeenCalledWith(
            idAsignacion, 
            datosActualizacion
        );

        expect(resultado).toEqual(asignacionActualizada);
    });


    //------------------- TEST 10: actualizarAsignacion - Error 404-------------------------//
    test("actualizarAsignacion - Debe lanzar NotFoundError si la asignación no existe", async () => {
        
        const idInexistente = "id-inexistente";
        const datosActualizacion: ActualizarAsignacionConsultorproyectoDTO = {
            porcentajeDedicacion: 50,
        };
        
        AsignacionRepoMock.obtenerAsignacionPorId.mockResolvedValue(null);
    
        await expect(servicio.actualizarAsignacion(idInexistente, datosActualizacion)).rejects.toThrow(NotFoundError);
        await expect(servicio.actualizarAsignacion(idInexistente, datosActualizacion)).rejects.toThrow("Asignación no encontrada");
        
        expect(ValidadorMock.validarAsignacion).not.toHaveBeenCalled();
        expect(AsignacionRepoMock.actualizarAsignacion).not.toHaveBeenCalled();
    });

    //------------- TEST 11: actualizarAsignacion - Error de Validación--------------//
    test("actualizarAsignacion - Debe propagar ValidationError si el validador falla", async () => {
        
        const  idAsignacion = idBase
        
        const datosActualizacion: ActualizarAsignacionConsultorproyectoDTO = {
            fechaFinAsignacion: new Date("2023-01-01"), // Fecha inválida
        };
        
        AsignacionRepoMock.obtenerAsignacionPorId.mockResolvedValue(ASIGNACION_BASE);

        ValidadorMock.validarAsignacion.mockRejectedValue(
            new ValidationError("La fecha fin debe ser posterior o igual a la fecha de inicio.")
        );
        
        await expect(servicio.actualizarAsignacion(idAsignacion, datosActualizacion)).rejects.toThrow(ValidationError);
        await expect(servicio.actualizarAsignacion(idAsignacion, datosActualizacion)).rejects.toThrow("La fecha fin debe ser posterior o igual a la fecha de inicio.");
        
        expect(AsignacionRepoMock.actualizarAsignacion).not.toHaveBeenCalled();
    });

    //--------TEST 12: eliminarAsignacion - Caso exitoso (Verificar llamada a repositorio)------//
    test("eliminarAsignacion - Debe llamar al repositorio para eliminar la asignación por ID", async () => {
        
        const idAsignacion = "asignacion-123";         

        AsignacionRepoMock.eliminarAsignacion.mockResolvedValue(undefined);

        await servicio.eliminarAsignacion(idAsignacion);

        expect(AsignacionRepoMock.eliminarAsignacion).toHaveBeenCalledWith(idAsignacion);
        expect(AsignacionRepoMock.eliminarAsignacion).toHaveBeenCalledTimes(1);
    });

})