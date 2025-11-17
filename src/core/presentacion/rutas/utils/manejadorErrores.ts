import { FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export const manejarError = (reply: FastifyReply, error: unknown, mensajeBase: string) => {

    //* 1. Error de Validación de Zod (400)
    if (error instanceof ZodError) {
        return reply.code(400).send({
            mensaje: mensajeBase,
            error: error.issues[0]?.message || "Error de validación",
        });
    }

    //* 2. Error "No Encontrado" (404)
    if (error instanceof Error && (
        error.message.includes("no encontrado") || 
        error.message.includes("no encontrada")
    )) {
        return reply.code(404).send({
            mensaje: error.message,
        });
    }

    //* 3. Otros Errores de Negocio (400)
    //* (Duplicado, fecha inválida, tarea ya completada, etc.)
    if (error instanceof Error) {
        return reply.code(400).send({
            mensaje: error.message,
        });
    }

    //* 4. Error genérico/desconocido (500)
    return reply.code(500).send({
        mensaje: "Error interno del servidor",
        error: String(error), 
    });
};
