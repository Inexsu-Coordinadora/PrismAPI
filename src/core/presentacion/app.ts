import Fastify from 'fastify';;
import {FastifyError} from 'fastify';
//* Aqui importamos los enrutadores de todas las entidades
//import { construirClientesEnrutador } from "./rutas/clientesEnrutador";
//import { construirProyectosEnrutador } from "./rutas/proyectosEnrutador";
//import { construirConsultoresEnrutador } from "./rutas/proyectosEnrutador";
import { construirConsultorEnrutador } from './rutas/consultorEnrutador';

const app = Fastify({logger: true});

app.register(
    async (appInstance) => {
    //* Aquí  construimos todos los enrutadores
    // construirClientesEnrutador(appInstance);
    // construirProyectosEnrutador (appInstance);
    // construirConsultoresEnrutadorappInstance);
        construirConsultorEnrutador(appInstance);     
    },
    {prefix: "/api" }
);

export const startServer = async (): Promise<void> => {
    try {
        await app.listen({port: Number(process.env.PUERTO)});
        app.log.info(`El servidor esta corriendo...`);
    } catch (error) {
        app.log.error(`Error al ejecutar el servidor\n ${error}`);

        const serverError: FastifyError = {
            code: "FST_ERR_INIT_SERVER",
            name: "ServidorError",
            statusCode: 500,
            message: `El servidor no se pudo iniciar: ${(error as Error).message}`,
        };

        throw serverError;
    }
}