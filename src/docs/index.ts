import { TareaSchema, TareaSchemaFastify } from "./schemas/entidades/tareaSchema";

//* Schemas para Swagger (OpenAPI components)
export const allSchemas = {
  ...TareaSchema
};

//* Schemas para Fastify (para usar con $ref en rutas)
export const allFastifySchemas = [
  TareaSchemaFastify
];  