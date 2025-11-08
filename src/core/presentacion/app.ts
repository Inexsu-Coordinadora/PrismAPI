import Fastify from 'fastify';;
import {FastifyError} from 'fastify';

//* Aqui importamos los enrutadores de todas las entidades
import { construirClienteEnrutador } from "./rutas/entidades/clienteEnrutador";
import { construirProyectosEnrutador } from "./rutas/entidades/proyectosEnrutador";
import { construirConsultorEnrutador } from "./rutas/entidades/consultorEnrutador";
import { construirTareasEnrutador } from "./rutas/entidades/tareasEnrutador";


//* Aqui importamos los enrutadores de todos los servicios
// import { construirAsignacionConsultorProyectoEnrutador } from './rutas/servicios/asignacionConsultorProyectoEnrutador';
// import { construirConsultaProyectoEnrutador } from './rutas/servicios/consultaProyectoEnrutador';
// import { construirGestionTareasEnrutador } from './rutas/servicios/gestionTareasEnrutador';
// import { construirRegistroHorasEnrutador } from './rutas/servicios/registroHorasEnrutador'; 


const app = Fastify({ logger: true });

app.register(
async (appInstance) => {
    //* Aquí  construimos todos los enrutadores de Entidades
    construirClienteEnrutador(appInstance);
    construirProyectosEnrutador (appInstance);
    construirConsultorEnrutador(appInstance);
    construirTareasEnrutador(appInstance);

    //* Aquí construimos todos los enrutadores de Servicios
    // construirAsignacionConsultorProyectoEnrutador(appInstance);
    // construirConsultaProyectoEnrutador(appInstance);
    // construirGestionTareasEnrutador(appInstance);
    // construirRegistroHorasEnrutador(appInstance);


},
{ prefix: "/api" }
);

export const startServer = async (): Promise<void> => {
try {
    await app.listen({ port: Number(process.env.PUERTO) });
    app.log.info("El servidor esta corriendo...");
} catch (err) {
    app.log.error(`Error al ejecutar el servidor\n ${err}`);

    const serverError: FastifyError = {
    code: "FST_ERR_INIT_SERVER",
    name: "ServidorError",
    statusCode: 500,
    message: `El servidor no se pudo iniciar: ${(err as Error).message}`,
    };

    throw serverError;
}
};
