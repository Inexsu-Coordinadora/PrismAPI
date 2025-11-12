import {z} from "zod";

export const CrearAsignacionConsultorProyectoEsquema = z.object({
    
    idConsultor: z
    .string()
    .nonempty("El id del consultor es obligatorio"),    

    idProyecto: z
    .string()
    .nonempty("El id del proyecto es obligatorio"),

    rolConsultor: z
    .string()
    .min(2, "El rol del consultor debe tener al menos dos caracteres")
    .max(30, " El rol del consultor debe tener máximo treinta caracteres")
    .nullable()
    .optional()
    .transform((val)=> val ?? null),//* .transform() asegura que si es 'undefined' o 'null', se guarde como 'null',   

    porcentajeDedicacion: z
    .number()
    .min(0, "El porcentaje no puede ser negativo")
    .max(100, "El porcentaje no puede ser mayor a 100")
    .nullable()
    .optional()
    .transform((val)=> val ?? null),

    fechaInicioAsignacion: z.coerce.date ({
        error: 
        "Debe proporcionar una fecha de inicio válida"}),
    

    fechaFinAsignacion: z.coerce.date ({
        error: 
        "Debe proporcionar una fecha de fin válida"})
        .optional()
        .nullable()
        .transform((val) => val ?? null)

})
.refine(
    (data) => {
    
    if (!data.fechaFinAsignacion) return true;

    return data.fechaFinAsignacion >= data.fechaInicioAsignacion;
    },
    {
    message: 'La fecha fin debe ser posterior o igual a la fecha de inicio',
    path: ['fechaFinAsignacion']
}
)


export type AsignacionConsultorProyectoDTO = z.infer<typeof CrearAsignacionConsultorProyectoEsquema>; 



