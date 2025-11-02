import { z } from "zod";              //Esquema: validan los datos con Zod

export const CrearConsultorEsquema = z.object({                       //Esquema base para crear un consultor
    nombreConsultor: z
    .string()
    .nonempty("El nombre del consultor es obligatorio")
    .max(100, "El nombre del consulor no puede exceder 100 caracteres"),

    especialidadConsultor: z
    .string()
    .nonempty("La especialidad del consultor es obligatoria")
    .min(5),

    disponibilidaConsultor: z
    .enum(['disponible', 'ocupado', 'en descanso', 'no disponible']),

    emailConsultor: z
    .string()
    .nonempty("El email del consultor es obligatorio").email("El email del consultor no es válido"),

    telefonoConsultor: z
    .string()
    .max(15, {message:"El teléfono del consultor no puede tener más de 15 caracteres"})
    .optional()
    .nullable()
});

export type ConsultorDTO = z.infer<typeof CrearConsultorEsquema>;


export const ActualizarConsultorEsquema = CrearConsultorEsquema.partial();      // Deriva un esquema para actualizar un consultor, donde todos los campos son opcionales   
export type ActualizarConsultorDTO = z.infer<typeof ActualizarConsultorEsquema>;       //existe una dependencia entre los dos esquemas