import { z } from "zod";

const estadosValidos =["pendiente", "en-progreso", "bloqueada", "completada"] as const;

//* ----------------- 1. Esquema para CREAR Tarea -----------------//
export const CrearTareaEsquema = z.object({
  tituloTarea: z
  .string()
  .nonempty({message: "El título de la tarea es obligatorio"})
  .min(5, "El título debe tener al menos 5 caracteres")
  .max(100, "El título no puede tener más de 100 caracteres"),
  
  descripcionTarea: z
  .string()
  .max(500, "La descripción no puede tener más de 500 caracteres")
  .optional()
  .nullable(),
  //.transform((val)=> val ?? null),//* .transform() asegura que si es 'undefined' o 'null', se guarde como 'null'

  
  estadoTarea: z
  .enum(estadosValidos, "Estado no válido. Debe ser 'pendiente', 'en-progreso', 'bloqueada' o 'completada'")
  .optional()
  .default("pendiente"),
});

//* Este es el tipo de datos que recibe el Caso de Uso
export type TareaDTO = z.infer<typeof CrearTareaEsquema>;

//* ----------------- 2. Esquema para ACTUALIZAR Tarea -----------------//
export const ActualizarTareaEsquema = CrearTareaEsquema.partial();
//* Este es el tipo de datos que usará nuestro controlador para Actualizar
export type ActualizarTareaDTO = z.infer<typeof ActualizarTareaEsquema>;