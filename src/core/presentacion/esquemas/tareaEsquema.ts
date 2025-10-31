import { z } from "zod";


export const CrearTareaEsquema = z.object({
  tituloTarea: z.string(),
  descripcionTarea: z.string().optional().nullable(),
  estadoTarea: z.enum(["pendiente", "en-desarrollo", "finalizada"]),
});


export type TareaDTO = z.infer<typeof CrearTareaEsquema>;


export const ActualizarTareaEsquema = CrearTareaEsquema.partial();
export type ActualizarTareaDTO = z.infer<typeof ActualizarTareaEsquema>;