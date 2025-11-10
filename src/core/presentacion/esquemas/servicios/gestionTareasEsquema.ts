import { z } from "zod";
import { CrearTareaEsquema as BaseCrearTareaEsquema,
        ActualizarTareaEsquema as BaseActualizarTareaEsquema } from "../entidades/tareaEsquema";


//* ------------ 1. Definimos los NUEVOS campos del S4 por separado ------------//        
//*(Este será el 'body' de nuestro nuevo endpoint: POST /proyectos/:idProyecto/tareas)
const CamposServicioS4 = z.object({
    idConsultorAsignado: z
    .string()
    .uuid({ message: "El idConsultorAsignado debe ser un UUID válido" })
    .optional()
    .nullable()
    .transform((val) => val ?? null),

    fechaLimiteTarea: z.coerce.date({ //* z.coerce.date() convierte "YYYY-MM-DD" a Date
        error: "Debe proporcionar una fecha límite válida"
    })
    .optional()
    .nullable()
    .transform((val) => val ?? null),
});

//* ------------ 2. Esquema de CREAR: (Base de Creación E1) + (Campos S4) ------------//   
export const CrearProyectoTareaEsquema = BaseCrearTareaEsquema
.extend(CamposServicioS4.shape); //* Extendemos con los nuevos campos

//* Exportamos el tipo de dato que recibe el Caso de Uso
export type CrearTareaServicioDTO = z.infer<typeof CrearProyectoTareaEsquema>;

//* ------------ 3. Esquema de ACTUALIZAR: (Base de Actualización E1) + (Campos S4) ------------//
export const ActualizarProyectoTareaEsquema = CrearProyectoTareaEsquema
.extend(CamposServicioS4.shape);
export type ActualizarTareaServicioDTO = z.infer<typeof ActualizarProyectoTareaEsquema>;

