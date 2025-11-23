
import { GestionAsignacionConsultor } from "../../../../src/core/aplicacion/gestion-servicio/GestionAsignacionConsultor";
import { IAsignacionConsultorProyectoRepositorio } from "../../../../src/core/dominio/repositorio/servicios/IAsignacionConsultorProyectoRepositorio";
import { IConsultorRepositorio } from "../../../../src/core/dominio/repositorio/entidades/IConsultorRepositorio";
import { IProyectoRepositorio } from "../../../../src/core/dominio/repositorio/entidades/IProyectoRepositorio";
import { NotFoundError, ValidationError, ConflictError } from "../../../../src/common/errores/AppError";
import { IAsignacionConsultorProyecto } from "../../../../src/core/dominio/servicios/IAsignacionConsultorProyecto";
import { AsignacionConsultorProyectoDTO } from "../../../../src/core/presentacion/esquemas/servicios/asignacionConsultorProyectoEsquema";
import { IConsultor } from "../../../../src/core/dominio/entidades/IConsultor";
import { IProyecto } from "../../../../src/core/dominio/entidades/IProyecto";

const ASIGNACION_BASE: AsignacionConsultorProyectoDTO = {
    idConsultor: "consultor-001",
    idProyecto: "proyecto-alpha",
    rolConsultor: "Developer",
    porcentajeDedicacion: 50,
    fechaInicioAsignacion: new Date("2024-03-01"),
    fechaFinAsignacion: new Date("2024-06-30"),
};

const ASIGNACION_EXISTENTE_BASE: IAsignacionConsultorProyecto = {
    ...ASIGNACION_BASE,
    idAsignacion: "asignacion-base-101"
};

const idBase = ASIGNACION_EXISTENTE_BASE.idAsignacion;

const PROYECTO_MOCK: IProyecto= {
    idProyecto: ASIGNACION_BASE.idProyecto,
    nombreProyecto: "Alpha Project",
    fechaInicioProyecto : new Date("2024-01-01"), 
    fechaFinProyecto: new Date("2024-12-31"),       
} as IProyecto;

const CONSULTOR_MOCK: IConsultor = {
    idConsultor: ASIGNACION_BASE.idConsultor,
    nombreConsultor: "John Doe",
    disponibilidadConsultor: 'disponible',    
} as IConsultor;

describe("Pruebas unitarias GestionAsignacionConsultor", () => {    
    
    let AsignacionRepoMock: jest.Mocked<IAsignacionConsultorProyectoRepositorio>;
    let ProyectoRepoMock: jest.Mocked<IProyectoRepositorio>; 
    let ConsultorRepoMock: jest.Mocked<IConsultorRepositorio>; 
    let validador: GestionAsignacionConsultor;

    beforeEach(() => {        

        ConsultorRepoMock = {
            obtenerConsultorPorId: jest.fn(), 
            crearConsultor: jest.fn(),
            listarConsultores : jest.fn(),
            actualizarConsultor : jest.fn(),
            eliminarConsultor: jest.fn(),
        } as jest.Mocked<IConsultorRepositorio>;

        ProyectoRepoMock = {
            obtenerProyectoPorId: jest.fn(), 
            obtenerProyectos: jest.fn(),
            crearProyecto: jest.fn(),
            actualizarProyecto: jest.fn(),
            eliminarProyecto: jest.fn(),
        } as jest.Mocked<IProyectoRepositorio>;

        AsignacionRepoMock = {
            asignarConsultorProyecto: jest.fn(),
            obtenerAsignacionPorId: jest.fn(),
            obtenerAsignacionPorConsultor: jest.fn(),
            obtenerAsignacionPorProyecto: jest.fn(),
            obtenerAsignacionExistente: jest.fn(),
            obtenerDedicacionConsultor: jest.fn(),
            actualizarAsignacion: jest.fn(),
            eliminarAsignacion: jest.fn(),
        } as jest.Mocked<IAsignacionConsultorProyectoRepositorio>;
        
        validador = new GestionAsignacionConsultor(
            ConsultorRepoMock ,            
            ProyectoRepoMock,
            AsignacionRepoMock,
            
        ); 
        
        ProyectoRepoMock.obtenerProyectoPorId.mockResolvedValue(PROYECTO_MOCK);
        ConsultorRepoMock.obtenerConsultorPorId.mockResolvedValue(CONSULTOR_MOCK);
    });

    //-----------------TEST 1: Camino Feliz (Validación exitosa)-------------------------//
    test ("validarAsignacion - Debe retornar undefined si todos los datos son válidos", async () => {
        
        AsignacionRepoMock.obtenerAsignacionExistente.mockResolvedValue(null);
        AsignacionRepoMock.obtenerDedicacionConsultor.mockResolvedValue(40); 
        
        await expect(validador.validarAsignacion(ASIGNACION_BASE)).resolves.toBeUndefined();
        
        expect(ProyectoRepoMock.obtenerProyectoPorId).toHaveBeenCalledTimes(1);
        expect(ConsultorRepoMock.obtenerConsultorPorId).toHaveBeenCalledTimes(1);
    });

    //-------------TEST 2:  Error de Existencia (Proyecto No Encontrado)------------------//
    test("validarAsignacion - Debe lanzar NotFoundError si el proyecto no existe", async () => {        
        
        ProyectoRepoMock.obtenerProyectoPorId.mockResolvedValue(null); 
        ConsultorRepoMock.obtenerConsultorPorId.mockResolvedValue(CONSULTOR_MOCK); 

        await expect(validador.validarAsignacion(ASIGNACION_BASE)).rejects.toThrow(NotFoundError);        
        
        await expect(validador.validarAsignacion(ASIGNACION_BASE)).rejects.toThrow(`El proyecto con idProyecto: ${ASIGNACION_BASE.idProyecto} no existe.`);
    });


    //-------------TEST 3: Error de Existencia (Consultor No Encontrado)-------------------//
    test("validarAsignacion - Debe lanzar NotFoundError si el consultor no existe", async () => {        
        
        ProyectoRepoMock.obtenerProyectoPorId.mockResolvedValue(PROYECTO_MOCK); 
        ConsultorRepoMock.obtenerConsultorPorId.mockResolvedValue(null); 

        await expect(validador.validarAsignacion(ASIGNACION_BASE)).rejects.toThrow(NotFoundError);
        await expect(validador.validarAsignacion(ASIGNACION_BASE)).rejects.toThrow(`El consultor con idConsultor: ${ASIGNACION_BASE.idConsultor} no existe.`);
    });
    

    //----------------TEST 4: Error de Validación (Consultor No Disponible)-------------------//
    test("validarAsignacion - Debe lanzar ConflictError si el consultor no está DISPONIBLE", async () => {
    
        const CONSULTOR_OCUPADO = { 
            ...CONSULTOR_MOCK, 
            nombreConsultor: "Jane Doe", 
            disponibilidadConsultor: "ocupado", 
        } as any;

        ProyectoRepoMock.obtenerProyectoPorId.mockResolvedValue(PROYECTO_MOCK);         
        ConsultorRepoMock.obtenerConsultorPorId.mockResolvedValue(CONSULTOR_OCUPADO); 
        AsignacionRepoMock.obtenerAsignacionExistente.mockResolvedValue(null); 
        AsignacionRepoMock.obtenerDedicacionConsultor.mockResolvedValue(0);   
        
        await expect(validador.validarAsignacion(ASIGNACION_BASE)).rejects.toThrow(ConflictError);        
        
        await expect(validador.validarAsignacion(ASIGNACION_BASE)).rejects.toThrow(
            // Verificamos que se use la información del mock
            /El consultor Jane Doe no está disponible. Estado actual: ocupado. Solo se pueden asignar consultores en estado DISPONIBLE/
        );
    })

    //-------------TEST 5: Error de Conflicto (Asignación Duplicada en Creación)--------------//
    const ASIGNACION_EXISTENTE_BASE: IAsignacionConsultorProyecto = {
        ...ASIGNACION_BASE,
        idAsignacion: "asignacion-base-101"
    } as any;

    test("validarAsignacion - Debe lanzar ConflictError si ya existe una asignación para el mismo consultor y proyecto (en creación)", async () => {
        
        AsignacionRepoMock.obtenerAsignacionExistente.mockResolvedValue(ASIGNACION_EXISTENTE_BASE);
        
        await expect(validador.validarAsignacion(ASIGNACION_BASE)).rejects.toThrow(ConflictError);
    });
    
    // -------------TEST 6: Error de Validación (Dedicación Excedida)---------------------//
    test("validarAsignacion - Debe lanzar ValidationError y mostrar el detalle de la dedicación excedida", async () => {        

        AsignacionRepoMock.obtenerDedicacionConsultor.mockResolvedValue(60);         
        
        await expect(validador.validarAsignacion(ASIGNACION_BASE)).rejects.toThrow(ValidationError);
        
        await expect(validador.validarAsignacion(ASIGNACION_BASE)).rejects.toThrow(            
            /La dedicación total excede el 100%. Actualmente tiene 60% asignado.Nueva: 50%, Total: 110/
        );
    });

    // -------------------TEST 7: Validación de Fechas de Asignación vs Proyecto--------------//
    test("validarAsignacion - Debe lanzar ValidationError si la fecha de inicio de la asignación es anterior a la fecha de inicio del proyecto", async () => {        
        
        const ASIGNACION_TEMPRANA = { 
            ...ASIGNACION_BASE, 
            fechaInicioAsignacion: new Date("2023-12-15") 
        };
        
        const EXPECTED_ERROR_MESSAGE = "La fecha de inicio de asignación no puede ser anterior a la fecha de inicio del proyecto";
        
        await expect(validador.validarAsignacion(ASIGNACION_TEMPRANA)).rejects.toThrow(ValidationError);
        await expect(validador.validarAsignacion(ASIGNACION_TEMPRANA)).rejects.toThrow(EXPECTED_ERROR_MESSAGE);
    });

})