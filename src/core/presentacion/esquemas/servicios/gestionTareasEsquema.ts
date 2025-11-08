import { z } from "zod";
import { CrearTareaEsquema as BaseCrearTareaEsquema,
        ActualizarTareaEsquema as BaseActualizarTareaEsquema } from "../entidades/tareaEsquema";


//* ------------ 1. Esquema para CREAR una Tarea de Proyecto ------------//        
//*(Este será el 'body' de nuestro nuevo endpoint: POST /proyectos/:idProyecto/tareas)
export const CrearProyectoTareaEsquema = BaseCrearTareaEsquema.extend({ //* Extendemos con los nuevos campos
    idConsultorAsignado: z
    .string()
    .uuid({ message: "El idConsultorAsignado debe ser un UUID válido" })
    .optional()
    .nullable()
    .transform((val) => val ?? null),

    fechaLimite: z.coerce.date({ //* z.coerce.date() convierte "YYYY-MM-DD" a Date
        error: "Debe proporcionar una fecha límite válida"
    })
    .optional()
    .nullable()
    .transform((val) => val ?? null),

});
//* Exportamos el tipo de dato que recibe el Caso de Uso
export type CrearTareaServicioDTO = z.infer<typeof CrearProyectoTareaEsquema>;

//* ------------- 2. Esquema para ACTUALIZAR Tarea de Proyecto ------------//
export const ActualizarProyectoTareaEsquema = CrearProyectoTareaEsquema.partial();
export type ActualizarTareaServicioDTO = z.infer<typeof ActualizarProyectoTareaEsquema>;

