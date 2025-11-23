import {z} from "zod";

const EstadoProyectoEsquema = ['activo', 'finalizado', 'pendiente'] as const;

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

    fechaInicioProyecto: z.coerce.date ({
        error: 
        "Debe proporcionar una fecha de inicio válida"}),
        
    

    fechaFinProyecto: z.coerce.date ({
        error: 
        "Debe proporcionar una fecha de fin válida"})
        .optional(),

    estadoProyecto: z 
    .enum(EstadoProyectoEsquema, "Estado no válido. Debe ser 'pendiente', 'activo' o 'finalizado'")
    .optional()
    .default("pendiente"),
    
})
.refine(
    (data) => {
        if (data.fechaFinProyecto && data.fechaInicioProyecto){
            return data.fechaFinProyecto > data.fechaInicioProyecto;
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
        if(data.estadoProyecto === 'finalizado' && !data.fechaFinProyecto){
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


export const ActualizarProyectoEsquema = CrearProyectoEsquema.partial();

export type ActualizarProyectoDTO = z.infer<typeof ActualizarProyectoEsquema> 