import { TareaSchema, TareaSchemaFastify } from "./schemas/entidades/tareaSchema";
import { AsignacionSchema } from "./schemas/servicios/asignacionConsultorProyectoSchema";
import { GestionTareasSchema } from "./schemas/servicios/gestionTareasSchema";
import { RegistroHorasSchema } from "./schemas/servicios/registroHorasSchema";
import { ConsultaProyectoSchema } from "./schemas/servicios/consultaProyectoSchema";

//* Schemas para Swagger (OpenAPI components)
export const allSchemas = {
  ...TareaSchema,
  ...AsignacionSchema,
  ...GestionTareasSchema,
  ...RegistroHorasSchema,
  ...ConsultaProyectoSchema
};

//* Schemas para Fastify (para usar con $ref en rutas)
export const allFastifySchemas = [
  TareaSchemaFastify
];  