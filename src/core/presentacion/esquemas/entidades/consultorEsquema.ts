import { z } from "zod";
import { DisponibilidadConsultor } from "../../../dominio/entidades/IConsultor";              

/** La disponibilidad se alinea directamente con el enum de dominio para evitar 
 * desajustes entre DTO y modelo interno */
export const CrearConsultorEsquema = z.object({                 
    nombreConsultor: z
    .string()
    .nonempty("El nombre del consultor es obligatorio")
    .max(100, "El nombre del consulor no puede exceder 100 caracteres"),

    especialidadConsultor: z
    .string()
    .nonempty("La especialidad del consultor es obligatoria")
    .min(5),
    /** Usamos directamente el enum del dominio */
    disponibilidadConsultor: z
    .nativeEnum(DisponibilidadConsultor),     

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


export const ActualizarConsultorEsquema = CrearConsultorEsquema.partial();  
export type ActualizarConsultorDTO = z.infer<typeof ActualizarConsultorEsquema>;      