import { ProyectoCasosUso } from "../../../../src/core/aplicacion/casos-uso/entidades/ProyectosCasosUso";
import { IProyectoRepositorio } from "../../../../src/core/dominio/repositorio/entidades/IProyectoRepositorio";
import { IProyecto } from "../../../../src/core/dominio/entidades/IProyecto";
import { ProyectoQueryParams } from "../../../../src/core/dominio/tipos/proyecto/ProyectoQueryParams";
import { ResultadoProyectos } from "../../../../src/core/dominio/tipos/proyecto/ResultadoProyectos";
import { ActualizarProyectoDTO } from "../../../../src/core/presentacion/esquemas/entidades/proyectoEsquema";


const PROYECTO_BASE: IProyecto = {
    idProyecto: "proj-123",
    nombreProyecto: "Gestor de Tareas",
    tipoProyecto: "Administrativo",
    fechaInicioProyecto: new Date("2024-01-01"),
    fechaFinProyecto: new Date("2024-12-31"),
    estadoProyecto: "activo"
}

describe("Pruebas Unitarias para ProyectoCasosUso", () => {
    
    let proyectoRepoMock: jest.Mocked<IProyectoRepositorio>;    
    let proyectoCasosUso: ProyectoCasosUso;

    beforeEach(() => {
        proyectoRepoMock = {
            obtenerProyectos: jest.fn(),
            obtenerProyectoPorId: jest.fn(),
            crearProyecto: jest.fn(),
            actualizarProyecto: jest.fn(),
            eliminarProyecto: jest.fn(),
        } as jest.Mocked<IProyectoRepositorio>;

        proyectoCasosUso = new ProyectoCasosUso(proyectoRepoMock);
    });

    //--------------------------TEST 1- Obtener proyecto- Camino feliz------------------------//
    test("Debe obtener proyectos con parámetros por defecto (página 1, límite 10)", async () => {
    
        const respuestaEsperada: ResultadoProyectos = {
            data: [PROYECTO_BASE],
            total: 1,
            pagina: 1,
            limite: 10,
        };

        proyectoRepoMock.obtenerProyectos.mockResolvedValue(respuestaEsperada);
        const params: ProyectoQueryParams = {};
        const result = await proyectoCasosUso.obtenerProyectos(params);
        
        expect(proyectoRepoMock.obtenerProyectos).toHaveBeenCalled();        
        expect(proyectoRepoMock.obtenerProyectos).toHaveBeenCalledWith({ pagina: 1, limite: 10 });        
        expect(result).toEqual(respuestaEsperada);
    });

    //-------------------------------TEST 2: Obtener proyecto - ERROR--------------------------//
    test.each([
        [{ pagina: 0, limite: 10 }, 'La página debe ser >= 1 '],
        [{ pagina: 1, limite: 0 }, 'El límite debe ser >= 1'],
        ])("Debe lanzar un error si 'pagina' o 'limite' es menor que 1", async (params, errorMessage) => {
        
        // B. EJECUTAR  
        await expect(proyectoCasosUso.obtenerProyectos(params)).rejects.toThrow(errorMessage);

        // C. VALIDAR
        expect(proyectoRepoMock.obtenerProyectos).not.toHaveBeenCalled();
    });
    


    //---------TEST 3: Obtener proyecto con filtros (nombre y estado del proyecto)-CASO ÉXITO-------//
    test.each([
        ["pendiente"],
        ["activo"],
        ["finalizado"],
    ])("Debe obtener proyectos aplicando filtros de 'estadoProyecto' (%s)", async (EstadoProyecto) => {
        
        const params: ProyectoQueryParams = { 
            nombre: "Gestor", 
            estado: EstadoProyecto as 'pendiente' | 'activo' | 'finalizado',
            pagina: 1,
            limite: 10
        };
        
        const respuestaEsperada: ResultadoProyectos = {
            data: [{ ...PROYECTO_BASE, estadoProyecto: EstadoProyecto as 'activo' }],
            total: 1,
            pagina: 1,
            limite: 10,
        };

        proyectoRepoMock.obtenerProyectos.mockResolvedValue(respuestaEsperada);

        const result = await proyectoCasosUso.obtenerProyectos(params);

        // C. VALIDAR
        expect(proyectoRepoMock.obtenerProyectos).toHaveBeenCalledWith(params);
        expect(result).toEqual(respuestaEsperada);
    });

    //-------------TEST 5: Obtener proyecto por ordenamiento - CASO ÉXITO------------------//
    test("Debe obtener proyectos aplicando ordenamiento", async () => {
        const params: ProyectoQueryParams = { 
            ordenarPor: 'fechaInicio', 
            ordenarOrden: 'desc',
            pagina: 1,
            limite: 10
        };
        
        const respuestaEsperada: ResultadoProyectos = {
            data: [PROYECTO_BASE],
            total: 1,
            pagina: 1,
            limite: 10,
        };

        proyectoRepoMock.obtenerProyectos.mockResolvedValue(respuestaEsperada);

        const result = await proyectoCasosUso.obtenerProyectos(params);

        // C. VALIDAR
        expect(proyectoRepoMock.obtenerProyectos).toHaveBeenCalledWith(params);
        expect(result).toEqual(respuestaEsperada);
    });


    //-------------TEST 6: Obtener proyectos con Fechas - CASO ÉXITO--------------- //
    test("Debe obtener proyectos aplicando filtros de fechas (desde/hasta)", async () => {
        const fechaDesde = new Date("2024-01-01");
        const fechaHasta = new Date("2024-06-01");

        const params: ProyectoQueryParams = { 
            fechaInicioDesde: fechaDesde,
            fechaInicioHasta: fechaHasta,
            pagina: 1,
            limite: 10
        };
        
        const respuestaEsperada: ResultadoProyectos = {
            data: [PROYECTO_BASE],
            total: 1,
            pagina: 1,
            limite: 10,
        };

        proyectoRepoMock.obtenerProyectos.mockResolvedValue(respuestaEsperada);

        const result = await proyectoCasosUso.obtenerProyectos(params);

        // C. VALIDAR
        expect(proyectoRepoMock.obtenerProyectos).toHaveBeenCalledWith(params);
        expect(result).toEqual(respuestaEsperada);
    });


    //---------------TEST 7: Obtener proyecto por ID- CASO ÉXITO----------------------//
    test("Debe obtener un proyecto por su ID", async () => {
        const idProyecto = PROYECTO_BASE.idProyecto!;        
        
        proyectoRepoMock.obtenerProyectoPorId.mockResolvedValue(PROYECTO_BASE);

        const result = await proyectoCasosUso.obtenerProyectoPorId(idProyecto);

        // C. VALIDAR
        expect(proyectoRepoMock.obtenerProyectoPorId).toHaveBeenCalledWith(idProyecto);
        expect(result).toEqual(PROYECTO_BASE);
    });

    //-------------------TEST 8: Crear proyecto CASO ÉXITO-------------------------------//
    test("Debe crear un nuevo proyecto y retornar su ID", async () => {
        const idGenerado = "new-id-456";
        const datosCreacion: IProyecto = { ...PROYECTO_BASE, idProyecto: undefined }; 
        
        proyectoRepoMock.crearProyecto.mockResolvedValue(idGenerado);

        const result = await proyectoCasosUso.crearProyecto(datosCreacion);

        // C. VALIDAR
        expect(proyectoRepoMock.crearProyecto).toHaveBeenCalledWith(datosCreacion);
        expect(result).toBe(idGenerado);
    });

    //-------------------TEST 9: Actualizar proyecto CASO ÉXITO----------------//
    test("Debe actualizar un proyecto parcialmente y retornar el proyecto actualizado", async () => {
        const idProyecto = PROYECTO_BASE.idProyecto!;
        const datosActualizacion: ActualizarProyectoDTO = {
            estadoProyecto: "finalizado",
            tipoProyecto: "Ingeniería",
        };
        
        const proyectoActualizado: IProyecto = {
            ...PROYECTO_BASE,
            ...datosActualizacion,            
        };
        
        proyectoRepoMock.actualizarProyecto.mockResolvedValue(proyectoActualizado);

        const result = await proyectoCasosUso.actualizarProyecto(idProyecto, datosActualizacion);

       // C. VALIDAR
        expect(proyectoRepoMock.actualizarProyecto).toHaveBeenCalledWith(
            idProyecto, 
            datosActualizacion            
        );
        
        expect(result).toEqual(proyectoActualizado);
    });

    //---------------------------TEST 10: Eliminar proyecto caso exitoso--------------------//
    test("Debe llamar al repositorio para eliminar un proyecto por ID", async () => {
        const idProyecto = PROYECTO_BASE.idProyecto!;        
        
        proyectoRepoMock.eliminarProyecto.mockResolvedValue(undefined);

        await proyectoCasosUso.eliminarProyecto(idProyecto);

        // C. VALIDAR
        expect(proyectoRepoMock.eliminarProyecto).toHaveBeenCalledWith(idProyecto);
        expect(proyectoRepoMock.eliminarProyecto).toHaveBeenCalledTimes(1);
    });

});