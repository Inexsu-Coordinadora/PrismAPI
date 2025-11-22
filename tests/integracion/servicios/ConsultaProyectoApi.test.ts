import { ConsultarProyectosPorClienteServicio } from "../../../src/core/aplicacion/casos-uso/servicios/ConsultaProyectoServicio";
import { NotFoundError, ValidationError } from "../../../src/common/errores/AppError";
import { ProyectoConConsultoresDTO, FiltrosConsultaProyectos } from "../../../src/core/presentacion/esquemas/servicios/consultaProyectoEsquema";
import { string } from "zod";

// IDs y datos de prueba
const ID_CLIENTE_VALIDO = "c-uuid-valido-123";
const ID_CLIENTE_INEXISTENTE = "c-uuid-inexistente";

// Datos mockeados de la respuesta
const MOCK_PROYECTOS: ProyectoConConsultoresDTO[] = [
    {
        codigoProyecto: "P-001",
        nombreProyecto: "Proyecto Alpha",
        estadoProyecto: "activo",
        fechaInicioProyecto: "2024-01-01",
        fechaFinProyecto: "2024-12-12T00:00:00.000Z",
        consultores: []
    }
];

// 1. --- MOCK DEL REPOSITORIO (Simulamos la Capa de Persistencia/Prisma) ---
// La implementación del repositorio que el servicio usa
const mockConsultaProyectosRepositorio = {
    existeCliente: jest.fn(),
    obtenerProyectosPorCliente: jest.fn(),
};

// 2. --- INSTANCIA DEL SERVICIO (Con el Repositorio Mockeado) ---
let servicio: ConsultarProyectosPorClienteServicio;

describe("Pruebas Unitarias - ConsultarProyectosPorClienteServicio", () => {
    beforeEach(() => {
        // Reiniciamos los mocks y creamos una nueva instancia del servicio antes de cada test
        jest.clearAllMocks();
        // @ts-ignore: Ignoramos el error de tipado para la inyección del mock
        servicio = new ConsultarProyectosPorClienteServicio(mockConsultaProyectosRepositorio); 
    });

    // ---------------------------- TESTS DE CAMINO FELIZ ----------------------------//

    describe("consultarProyectosPorClienteServicio (Camino Feliz)", () => {
        test("Debe retornar la lista de proyectos si el cliente existe y sin filtros", async () => {
            // Configurar mocks para el camino feliz
            mockConsultaProyectosRepositorio.existeCliente.mockResolvedValue(true);
            mockConsultaProyectosRepositorio.obtenerProyectosPorCliente.mockResolvedValue(MOCK_PROYECTOS);

            const resultado = await servicio.consultarProyectosPorClienteServicio(ID_CLIENTE_VALIDO);

            // Verificaciones
            expect(resultado).toEqual(MOCK_PROYECTOS);
            expect(mockConsultaProyectosRepositorio.existeCliente).toHaveBeenCalledWith(ID_CLIENTE_VALIDO);
            expect(mockConsultaProyectosRepositorio.obtenerProyectosPorCliente).toHaveBeenCalledWith(
                ID_CLIENTE_VALIDO,
                undefined // Sin filtros
            );
        });

        test("Debe retornar la lista de proyectos si el cliente existe y con filtros válidos", async () => {
            const filtrosValidos: FiltrosConsultaProyectos = {
                estadoProyecto: 'activo',
                fechaInicioProyecto: "2024-12-31", //new Date('2024-12-31'),
                fechaFinProyecto: "2025-12-31" //new Date('2024-12-31'),
            };

            mockConsultaProyectosRepositorio.existeCliente.mockResolvedValue(true);
            mockConsultaProyectosRepositorio.obtenerProyectosPorCliente.mockResolvedValue(MOCK_PROYECTOS);

            await servicio.consultarProyectosPorClienteServicio(ID_CLIENTE_VALIDO, filtrosValidos);

            // Verificaciones
            expect(mockConsultaProyectosRepositorio.obtenerProyectosPorCliente).toHaveBeenCalledWith(
                ID_CLIENTE_VALIDO,
                filtrosValidos
            );
        });
    });

    // ---------------------------- TESTS DE ERRORES DE NEGOCIO ----------------------------//

    describe("consultarProyectosPorClienteServicio (Manejo de Errores)", () => {
        
        test("Debe lanzar NotFoundError si el cliente no existe", async () => {
            // Configurar mock para simular cliente no encontrado
            mockConsultaProyectosRepositorio.existeCliente.mockResolvedValue(false);

            await expect(
                servicio.consultarProyectosPorClienteServicio(ID_CLIENTE_INEXISTENTE)
            ).rejects.toThrow(NotFoundError);
            
            // Si el cliente no existe, NO debe llamar al método de obtener proyectos
            expect(mockConsultaProyectosRepositorio.obtenerProyectosPorCliente).not.toHaveBeenCalled();
        });

        test("Debe lanzar ValidationError si fechaInicio es mayor que fechaFin", async () => {
            const filtrosInvalidos: FiltrosConsultaProyectos = {
                fechaInicioProyecto: "2025-02-03",//new Date('2024-12-31'),//.toISOString(), // <-- Fecha mayor
                fechaFinProyecto: "2025-02-02",//new Date('2024-01-01'),//()    // <-- Fecha menor
            };
    
            // Debe mockearse la existencia del cliente, ya que la validación va después.
       mockConsultaProyectosRepositorio.existeCliente.mockResolvedValue(true); 

            await expect(
                servicio.consultarProyectosPorClienteServicio(ID_CLIENTE_VALIDO, filtrosInvalidos)
            ).rejects.toThrow(ValidationError);
            
            await expect(
                servicio.consultarProyectosPorClienteServicio(ID_CLIENTE_VALIDO, filtrosInvalidos)
            ).rejects.toThrow(
                "El rango de fechas es inválido: la fecha de inicio no puede ser mayor que la fecha de fin"
            );
            
            expect(mockConsultaProyectosRepositorio.obtenerProyectosPorCliente).not.toHaveBeenCalled();
        });
    });
});