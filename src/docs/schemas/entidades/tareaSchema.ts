//* Schema base para usar en rutas (sin as const para poder referenciarlo)
export const TareaSchemaBase = {
  type: 'object' as const,
  required: ['tituloTarea', 'estadoTarea'] as const,
  properties: {
    idTarea: { 
      type: 'string' as const, 
      format: 'uuid' as const, 
      description: 'Identificador único de la tarea' 
    },
    tituloTarea: { 
      type: 'string' as const, 
      description: 'Título principal' 
    },
    descripcionTarea: { 
      type: 'string' as const, 
      nullable: true,
      description: 'Detalles adicionales de la tarea' 
    },
    estadoTarea: { 
      type: 'string' as const, 
      enum: ['pendiente', 'en-progreso', 'bloqueada', 'completada'] as const,
      description: 'Estado actual del flujo de trabajo'
    },
    idProyecto: { 
      type: 'string' as const, 
      format: 'uuid' as const, 
      nullable: true,
      description: 'ID del proyecto al que pertenece' 
    },
    idConsultorAsignado: { 
      type: 'string' as const, 
      format: 'uuid' as const, 
      nullable: true,
      description: 'Consultor responsable' 
    },
    fechaLimiteTarea: { 
      type: 'string' as const, 
      format: 'date' as const, 
      nullable: true,
      description: 'Fecha límite (YYYY-MM-DD)' 
    }
  }
};

//* Schema para registrar en Fastify (con id para poder usar $ref)
export const TareaSchemaFastify = {
  $id: 'TareaSchema',
  ...TareaSchemaBase
};

//* Schema para Swagger (con as const para tipado)
export const TareaSchema = {
  Tarea: TareaSchemaBase // Nombre del modelo en Swagger
} as const;