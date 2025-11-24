import Fastify from 'fastify';
import { FastifyError } from 'fastify';
import { getConfig } from "../../common/configuracion";
import { manejarError } from './rutas/utils/manejadorErrores';
import { allSchemas, allFastifySchemas } from '../../docs';

//* NUEVO: Importamos los plugins de Swagger
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

//* Aqui importamos los enrutadores de todas las entidades
import { construirClienteEnrutador } from "./rutas/entidades/clienteEnrutador";
import { construirProyectosEnrutador } from "./rutas/entidades/proyectosEnrutador";
import { construirConsultorEnrutador } from "./rutas/entidades/consultorEnrutador";
import { construirTareasEnrutador } from "./rutas/entidades/tareasEnrutador";

//* Aqui importamos los enrutadores de todos los servicios
import { construirAsignacionConsultorProyectoEnrutador } from './rutas/servicios/asignacionConsultorProyectoEnrutador';
import { construirConsultaProyectoEnrutador } from './rutas/servicios/consultaProyectoEnrutador';
import { construirGestionTareasEnrutador } from "./rutas/servicios/gestionTareasEnrutador";
import { construirRegistroHorasEnrutador } from './rutas/servicios/registroHorasEnrutador';

export const app = Fastify({ logger: true });

app.setErrorHandler(manejarError);

//* Registrar schemas en Fastify para poder usar $ref
allFastifySchemas.forEach(schema => app.addSchema(schema));

//* NUEVO: Configuración del Generador de Documentación (Swagger)
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'PrismAPI Documentation',
      description: 'Documentación del Backend para Gestión de Proyectos',
      version: '1.0.0',
      contact: {
        name: 'Equipo PrismAPI',
        email: 'dev@prismapi.com'
      }
    },
    servers: [
      {
        url: `http://localhost:3001`, // Ajusta si tu puerto es diferente en prod
        description: 'Servidor Local'
      }
    ],
    components: {
      schemas: allSchemas as unknown as Record<string, any>
    },
    tags: [
      {
        name: 'DEMO PRESENTACIÓN',
        description: 'Endpoints para demostración en vivo de PrismAPI'
      }
    ]
  }
})

//* NUEVO: Configuración de la Interfaz Visual (La página web)
app.register(fastifySwaggerUi, {
  routePrefix: '/docs', // La documentación estará en /docs
  uiConfig: {
    docExpansion: 'list', // Muestra los endpoints desplegados
    deepLinking: false,
    tryItOutEnabled: true, // Habilita "Try it out" por defecto
    filter: true, // Habilita el filtro de búsqueda
    showExtensions: true,
    showCommonExtensions: true
  },
  staticCSP: true,
  //* Ordenar tags: DEMO PRESENTACIÓN primero, luego alfabéticamente
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    }
  }
});

app.register(
async (appInstance) => {
    //* Aquí  construimos todos los enrutadores de Entidades
    construirClienteEnrutador(appInstance);
    construirProyectosEnrutador(appInstance);
    construirConsultorEnrutador(appInstance);
    construirTareasEnrutador(appInstance);

    //* Aquí construimos todos los enrutadores de Servicios
    construirAsignacionConsultorProyectoEnrutador(appInstance);
    construirConsultaProyectoEnrutador(appInstance);
    construirGestionTareasEnrutador(appInstance);
    construirRegistroHorasEnrutador(appInstance);
},
{ prefix: "/api" }
);

export const startServer = async (): Promise<void> => {
  //* Llamado a la función
const config = getConfig();

try {
    //* Usa la config fresca
    await app.listen({ port: config.httpPuerto });
    app.log.info(`El servidor esta corriendo en el puerto ${config.httpPuerto}`);
    app.log.info(`Documentación disponible en http://localhost:${config.httpPuerto}/docs`); // Log útil
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