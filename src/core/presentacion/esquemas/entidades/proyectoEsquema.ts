import {z} from "zod";

export const EstadoProyectoEsquema = z.enum (['activo', 'finalizado', 'pendiente'], { error: "El estado del proyecto debe ser: activo, finalizado o pendiente"
});

export const CrearProyectoEsquema = z.object({
    nombreProyecto: z
    .string()
    .nonempty("El nombre del proyecto es obligatorio")
    .min(5)
    .max(50),

    tipoProyecto: z
    .string()
    .min(2)
    .max(50)
    .optional()
    .transform((val) => val ?? null),

    fechaInicio: z.coerce.date ({
        error: 
        "Debe proporcionar una fecha de inicio válida"}),
    

    fechaFin: z.coerce.date ({
        error: 
        "Debe proporcionar una fecha de fin válida"})
        .optional(),

    estadoProyecto: EstadoProyectoEsquema
    
})
.refine(
    (data) => {
        if (data.fechaFin && data.fechaInicio){
            return data.fechaFin > data.fechaInicio;
    }    
    return true;
},
{
    message: 'La fecha fin debe ser posterior o igual a la fecha de inicio',
    path: ['fechaFin']
}
)
.refine(
    (data)=>{
        if(data.estadoProyecto === 'finalizado' && !data.fechaFin){
            return false;
        }
        return true;
    },
    {
    message: 'Un proyecto finalizado debe tener fecha fin',
    path: ['fechaFin']
}
);

export type ProyectoDTO = z.infer<typeof CrearProyectoEsquema>;