import { FastifyInstance } from "fastify";

// 1) Servicio de aplicación e interfaz
import { RegistroHorasServicio } from "../../../aplicacion/casos-uso/servicios/RegistroHorasServicio";
import { IRegistroHorasServicio } from "../../../aplicacion/interfaces/servicios/IRegistroHorasServicio";

// 2) Repos reales ya existentes en tu proyecto
import { ConsultorRepositorio } from "../../../infraestructura/postgres/repositorios/entidades/ConsultorRepository";
import { ProyectoRepository } from "../../../infraestructura/postgres/repositorios/entidades/ProyectoRepository";
import { RegistroHorasRepository } from "../../../infraestructura/postgres/repositorios/servicios/RegistroHorasRepository";

// 3) Controlador
import { RegistroHorasControlador } from "../../controladores/servicios/RegistroHorasControlador";

/* ============================================================================================
STUB(fragmento de código que simula el comportamiento de otro componente para permitir que las pruebas de software se realicen de manera aislada y consistente) TEMPORAL: AsignaciónConsultorProyecto
   - Este stub solo existe para que puedas compilar y probar tu servicio mientras integran
     la rama de tu compañera.
   - Mantiene la firma que va a necesitar tu servicio para validar asignaciones y rango de fechas.
   - Cuando integren el repositorio real (IAsignacionConsultorProyectoRepositorio + implementación),
     reemplaza este stub por el repo real y elimina el @ts-expect-error en el constructor.
   ============================================================================================ */
class AsignacionConsultorProyectoRepoStub {
  async obtenerAsignacionPorConsultorYProyecto(
    idConsultor: string,
    idProyecto: string
  ): Promise<{ fecha_inicio: string | Date; fecha_fin: string | Date } | null> {
    // Opción A (estricta): devolver null para forzar el error de "no asignado".
    return null;

    // Opción B (permisiva para pruebas): descomenta para permitir registros mientras integran.
    // return { fecha_inicio: new Date("1900-01-01"), fecha_fin: new Date("2999-12-31") };
  }
}

/**
 * Función que registra las rutas del servicio "Registro de horas"
 * en la instancia de Fastify.
 *
 * Sigue el mismo patrón que usaste en consultores:
 * - construirXEnrutador(app)
 * - dentro se crean repo, servicio y controlador
 */
function registroHorasRutas(app: FastifyInstance, controlador: RegistroHorasControlador) {
  // Listar registros (con filtros opcionales)
  app.get("/registrar-horas", controlador.listarRegistrosHoras);

  // Obtener un registro por ID
  app.get("/registrar-horas/:idRegistro", controlador.obtenerRegistroHoraPorId);

  // Crear un nuevo registro de horas
  app.post("/registrar-horas", controlador.crearRegistroHoras);

  // Eliminar un registro de horas
  app.delete("/registrar-horas/:idRegistro", controlador.eliminarRegistroHoras);
}

export async function construirRegistroHorasEnrutador(app: FastifyInstance) {
  // 1) Instanciar repos reales
  const consultorRepo = new ConsultorRepositorio();
  const proyectoRepo = new ProyectoRepository();
  const registroHorasRepo = new RegistroHorasRepository();

  // 2) Instanciar stub temporal de asignaciones (reemplazar al integrar)
  const asignacionRepo = new AsignacionConsultorProyectoRepoStub();

  // 3) Servicio de aplicación con TODOS los repos inyectados
  //    Nota: tu RegistroHorasServicio debe implementar el método crearRegistroHoras(...)
  const registroHorasServicio: IRegistroHorasServicio = new RegistroHorasServicio(
    registroHorasRepo,
    consultorRepo,
    proyectoRepo,
    // @ts-expect-error: stub temporal hasta que exista la interfaz real
    asignacionRepo
  );

  // 4) Controlador
  const controlador = new RegistroHorasControlador(registroHorasServicio);

  // 5) Registrar rutas
  registroHorasRutas(app, controlador);
}
