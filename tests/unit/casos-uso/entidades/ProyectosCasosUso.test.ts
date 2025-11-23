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

    //PRUEBA 1- CASO ÉXITO
    test("Debe obtener proyectos con parámetros por defecto (página 1, límite 10)", async () => {
        // 1. Datos que el mock DEBE devolver
        const respuestaEsperada: ResultadoProyectos = {
            data: [PROYECTO_BASE],
            total: 1,
            pagina: 1,
            limite: 10,
        };

        proyectoRepoMock.obtenerProyectos.mockResolvedValue(respuestaEsperada);
        const params: ProyectoQueryParams = {};
        const result = await proyectoCasosUso.obtenerProyectos(params);

        //verificaciones
        expect(proyectoRepoMock.obtenerProyectos).toHaveBeenCalled();
        // b) Verificamos que el repositorio fue llamado con los parámetros resueltos por el caso de uso
        expect(proyectoRepoMock.obtenerProyectos).toHaveBeenCalledWith({ pagina: 1, limite: 10 });
        // c) Verificamos que el resultado retornado es el correcto
        expect(result).toEqual(respuestaEsperada);
    });

    //PRUEBA 2: CASO ERROR
    test.each([
        [{ pagina: 0, limite: 10 }, 'La página debe ser >= 1 '],
        [{ pagina: 1, limite: 0 }, 'El límite debe ser >= 1'],
        ])("Debe lanzar un error si 'pagina' o 'limite' es menor que 1", async (params, errorMessage) => {
        
        // Ejecutar y verificar que se lanza la excepción
        await expect(proyectoCasosUso.obtenerProyectos(params)).rejects.toThrow(errorMessage);

        // Verificamos que el repositorio NUNCA fue llamado
        expect(proyectoRepoMock.obtenerProyectos).not.toHaveBeenCalled();
    });
    


    //PRUEBA 3: Obtener proyecto con filtros (nombre y estado del proyecto)CASO ÉXITO
    test.each([
        ["pendiente"],
        ["activo"],
        ["finalizado"],
    ])("Debe obtener proyectos aplicando filtros de 'estadoProyecto' (%s)", async (EstadoProyecto) => {
        
        // El tipo 'EstadoProyecto' se maneja como string en JS/TS
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

        // Verificamos que el repositorio fue llamado con el estado del proyecto correcto
        expect(proyectoRepoMock.obtenerProyectos).toHaveBeenCalledWith(params);
        expect(result).toEqual(respuestaEsperada);
    });

    //PRUEBA 5: Obtener proyecto por ordenamiento CASO ÉXITO
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

        // Verificamos que el repositorio fue llamado con los parámetros de ordenamiento
        expect(proyectoRepoMock.obtenerProyectos).toHaveBeenCalledWith(params);
        expect(result).toEqual(respuestaEsperada);
    });


    //PRUEBA 6: Obtener proyectos con Fechas CASO ÉXITO
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

        // Verificamos que el repositorio fue llamado con los objetos Date correctos
        expect(proyectoRepoMock.obtenerProyectos).toHaveBeenCalledWith(params);
        expect(result).toEqual(respuestaEsperada);
    });


    //PRUEBA 7: Obtener proyecto por ID- CASO ÉXITO
    test("Debe obtener un proyecto por su ID", async () => {
        const idProyecto = PROYECTO_BASE.idProyecto!;
        
        // Instruir al mock que devuelva el proyecto si se llama con el ID
        proyectoRepoMock.obtenerProyectoPorId.mockResolvedValue(PROYECTO_BASE);

        const result = await proyectoCasosUso.obtenerProyectoPorId(idProyecto);

        // Verificaciones
        expect(proyectoRepoMock.obtenerProyectoPorId).toHaveBeenCalledWith(idProyecto);
        expect(result).toEqual(PROYECTO_BASE);
    });

    //PRUEBA 8: Crear proyecto CASO ÉXITO
    test("Debe crear un nuevo proyecto y retornar su ID", async () => {
        const idGenerado = "new-id-456";
        const datosCreacion: IProyecto = { ...PROYECTO_BASE, idProyecto: undefined }; // Datos sin el ID (lo crea la DB)
        
        // Instruir al mock que devuelva el ID generado
        proyectoRepoMock.crearProyecto.mockResolvedValue(idGenerado);

        const result = await proyectoCasosUso.crearProyecto(datosCreacion);

        // Verificaciones
        expect(proyectoRepoMock.crearProyecto).toHaveBeenCalledWith(datosCreacion);
        expect(result).toBe(idGenerado);
    });

    //PRUEBA 9: Actualizar proyecto CASO ÉXITO
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

        // Instruir al mock: cuando se llame a actualizarProyecto, devolver el objeto actualizado
        proyectoRepoMock.actualizarProyecto.mockResolvedValue(proyectoActualizado);

        // Ejecutar el método a probar
        const result = await proyectoCasosUso.actualizarProyecto(idProyecto, datosActualizacion);

        // Verificaciones
        // 1. Se debe llamar al repositorio con el ID y los datos parciales
        expect(proyectoRepoMock.actualizarProyecto).toHaveBeenCalledWith(
            idProyecto, 
            datosActualizacion
            // Nota: Aquí se verifica si se llama con el DTO, no con la aserción 'as Partial<IProyecto>'
        );
        // 2. El resultado debe ser el objeto que el repositorio "simuló" devolver
        expect(result).toEqual(proyectoActualizado);
    });

    //PRUEBA 10: Eliminar proyecto caso exitoso
    test("Debe llamar al repositorio para eliminar un proyecto por ID", async () => {
        const idProyecto = PROYECTO_BASE.idProyecto!;
        
        // Instruir al mock: no debe devolver nada (void)
        proyectoRepoMock.eliminarProyecto.mockResolvedValue(undefined);

        await proyectoCasosUso.eliminarProyecto(idProyecto);

        // Verificaciones
        // Solo verificamos que el método del repositorio fue llamado con el ID correcto
        expect(proyectoRepoMock.eliminarProyecto).toHaveBeenCalledWith(idProyecto);
        expect(proyectoRepoMock.eliminarProyecto).toHaveBeenCalledTimes(1);
    });

});