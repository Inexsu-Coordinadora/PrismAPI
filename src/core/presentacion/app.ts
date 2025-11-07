import Fastify from 'fastify';;
import {FastifyError} from 'fastify';

//* Aqui importamos los enrutadores de todas las entidades
import { construirClienteEnrutador } from "./rutas/clienteEnrutador";
import { construirProyectosEnrutador } from "./rutas/proyectosEnrutador";
import { construirConsultorEnrutador } from "./rutas/consultorEnrutador";
import { construirTareasEnrutador } from "./rutas/tareasEnrutador";

const app = Fastify({ logger: true });

app.register(
async (appInstance) => {
    //* Aquí  construimos todos los enrutadores
    construirClienteEnrutador(appInstance);
    construirProyectosEnrutador (appInstance);
    construirConsultorEnrutador(appInstance);
    construirTareasEnrutador(appInstance);
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
