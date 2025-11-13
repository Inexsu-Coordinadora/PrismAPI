import { z } from "zod";

/**
 * Esquema de validación para crear un nuevo registro de horas.
 */
export const CrearRegistroHorasEsquema = z.object({
  //------ Validamos formato UUID ------
  id_consultor: z
    .string()
    .uuid("Consultor no existe, el id del consultor debe tener formato UUID")
    .min(1, "El id del consultor es obligatorio"),

  id_proyecto: z
    .string()
    .uuid("Proyecto no existe, el id del proyecto debe tener formato UUID")
    .min(1, "El id del proyecto es obligatorio"),

  //------ Validamos fecha (string → Date) ------
  fecha_registro: z
    .string()
    .min(1, "La fecha de registro es obligatoria")
    .refine((s) => !isNaN(Date.parse(s)), {
      message: "La fecha de registro no es válida (usa formato YYYY-MM-DD)",
    })
    .transform((s) => new Date(s)),

  //------ Validamos horas trabajadas ------
  horas_trabajadas: z
    .union([
      z.string().transform((val) => Number(val)), // si llega como string
      z.number(),
    ])
    .refine((h) => !isNaN(h) && Number.isFinite(h), {
      message: "Las horas trabajadas deben ser un número válido",
    })
    .refine((h) => h > 0, {
      message: "Las horas trabajadas deben ser mayores que 0",
    })
    .refine((h) => h <= 24, {
      message: "Las horas trabajadas no pueden superar 24 por día",
    })
    .transform((h) => Math.round(h * 100) / 100), // redondeamos a 2 decimales

  //------ Validamos descripción ------
  descripcion_actividad: z
    .string()
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, {
      message: "La descripción de la actividad es obligatoria",
    })
    .refine((s) => s.length <= 500, {
      message: "La descripción no puede superar los 500 caracteres",
    }),
});

export type RegistroHorasDTO = z.infer<typeof CrearRegistroHorasEsquema>;
