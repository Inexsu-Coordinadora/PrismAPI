import { z } from "zod";


export const consultarProyectosPorClienteQueryEsquema = z
  .object({
    estadoProyecto: z
      .enum(["activo", "finalizado", "pendiente"],{message:"El estado no es válido debe ser: activo | finalizado | pendiente"})
      .optional(),

    fechaInicioProyecto: z.iso
      .date({ message: "fechaInicio debe ser una fecha en formato ISO válido" })
      .optional(),

    fechaFinProyecto: z.iso
      .date({ message: "fechaFin debe ser una fecha en formato ISO válido" })
      .optional(),
  })
  .strict();

export type FiltrosConsultaProyectos = z.infer<
  typeof consultarProyectosPorClienteQueryEsquema
>;



export const consultarProyectosPorClienteParamsEsquema = z
  .object({
    idCliente: z
      .string()
      .uuid({ message: "El ID del cliente debe ser un UUID válido" }),
  })
  .strict();

export type ConsultarProyectosPorClienteParams = z.infer<
  typeof consultarProyectosPorClienteParamsEsquema
>;

export const consultorEnProyectoEsquema = z.object({
  nombre: z.string(),
  rol: z.string().nullable(), 
});

export type ConsultorEnProyectoDTO = z.infer<typeof consultorEnProyectoEsquema>;


export const proyectoConConsultoresEsquema = z.object({
  codigoProyecto: z.string(), 
  nombreProyecto: z.string(), 
  estadoProyecto: z.enum(["activo", "finalizado", "pendiente"]),
  fechaInicioProyecto: z.string().nullable(), 
  fechaFinProyecto: z.string().nullable(),
  consultores: z.array(consultorEnProyectoEsquema),
});

export type ProyectoConConsultoresDTO = z.infer<
  typeof proyectoConConsultoresEsquema
>;


export const respuestaConsultarProyectosEsquema = z.object({
  proyectos: z.array(proyectoConConsultoresEsquema),
});

export type RespuestaConsultarProyectos = z.infer<
  typeof respuestaConsultarProyectosEsquema
>;

