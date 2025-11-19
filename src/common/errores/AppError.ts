import { HttpStatus } from "./statusCode";

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; 

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Recurso no encontrado") {
    super(message, HttpStatus.NO_ENCONTRADO);
    }
}

export class ValidationError extends AppError {
    constructor(message: string = "Error de validación") {
    super(message, HttpStatus.SOLICITUD_INCORRECTA);
    }
}