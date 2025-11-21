import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../../../../common/errores/AppError';
import { HttpStatus } from '../../../../common/errores/statusCode';

export const manejarError = (error: unknown, request: FastifyRequest, reply: FastifyReply) => {

    if (error instanceof AppError) {
    //* Errores operacionales conocidos y controlados explícitamente
    return reply.code(error.statusCode).send({
    mensaje: error.message,
    });
}
    
    if (error instanceof ZodError) {
        return reply.code(HttpStatus.SOLICITUD_INCORRECTA).send({
            mensaje: "Error de validación",
            detalles: error.issues.map((issue) => ({
            campo: issue.path.join('.'),
            error: issue.message,
            })),
        });
    }

    //* Errores de sistema inesperados (bugs). Se registran para monitoreo interno.
    request.log.error(error);

    return reply.code(HttpStatus.ERROR_SERVIDOR).send({
    mensaje: "Error interno del servidor",
    });
};
