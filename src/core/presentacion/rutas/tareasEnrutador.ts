import { FastifyInstance } from "fastify";
import { TareasControlador } from "../controladores/tareasControlador";
import { ITareaRepositorio } from "../../dominio/repositorio/ITareasRepositorio";
import { ITareasCasosUso } from "../../aplicacion/ITareasCasosUso";
import { TareasCasosUso } from "../../aplicacion/TareaCasosUso";
import { TareaRepository } from "../../infraestructura/TareaRepository";


 //* ----------------- 1. FUNCIÓN DE RUTAS -----------------//
 //* Esta función define las rutas HTTP y las conecta a los métodos del controlador. Es el "mapa" de la API.
    function tareasEnrutador(
        app: FastifyInstance,
        controlador: TareasControlador
    ){
        
        app.get("/tareas",controlador.listarTarea); //* // Cuando llegue un GET a /tareas, llama a controlador.listarTarea ...
        app.get("/tareas/:idTarea", controlador.obtenerTareaPorId);
        app.post("/tareas", controlador.crearTarea);
        app.put("/tareas/:idTarea",controlador.actualizarTarea);
        app.delete("/tareas/:idTarea", controlador.eliminarTarea);
    }

    //* ----------------- 2. FUNCIÓN CONSTRUCTORA (Builder) -----------------//
    //* Esta es la función MÁS IMPORTANTE. Aquí es donde ocurre la Inyección de Dependencias -> conectar todas las capas.

    export async function construirTareasEnrutador (app:FastifyInstance) {
        //* Las capas se leen de adentro hacia afuera (de la BD hacia la API):

        //* 1°. Creamos la capa de REPOSITORIO
        const tareasRepo: ITareaRepositorio = new TareaRepository();

        //* 2°. Creamos la capa de CASOS DE USO y le inyectamos el repositorio
        const tareasCasosUso: ITareasCasosUso = new TareasCasosUso(tareasRepo);

        //* 3°. Creamos la capa de CONTROLADOR y le inyectamos los casos de uso
        const tareasController = new TareasControlador(tareasCasosUso);

        //* 4°. Finalmente, se le pasa el controlador al mapa de rutas
        tareasEnrutador(app, tareasController);
    }

