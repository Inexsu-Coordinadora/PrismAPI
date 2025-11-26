//* Schema base para Gestión de Tareas en Proyecto
export const CrearTareaProyectoBodySchema = {
  type: 'object' as const,
  required: ['tituloTarea'],
  properties: {
    tituloTarea: {
      type: 'string' as const,
      minLength: 5,
      maxLength: 100,
      description: 'Título de la tarea (5-100 caracteres)'
    },
    descripcionTarea: {
      type: 'string' as const,
      maxLength: 500,
      nullable: true,
      description: 'Descripción detallada de la tarea (máx. 500 caracteres)'
    },
    estadoTarea: {
      type: 'string' as const,
      enum: ['pendiente', 'en-progreso', 'bloqueada', 'completada'] as const,
      default: 'pendiente',
      description: 'Estado inicial de la tarea'
    },
    idConsultorAsignado: {
      type: 'string' as const,
      format: 'uuid' as const,
      nullable: true,
      description: 'ID del consultor asignado a la tarea (debe estar asignado al proyecto)'
    },
    fechaLimiteTarea: {
      type: 'string' as const,
      format: 'date' as const,
      nullable: true,
      description: 'Fecha límite de la tarea (YYYY-MM-DD)'
    }
  }
};

export const TareaProyectoParamsSchema = {
  type: 'object' as const,
  properties: {
    idProyecto: {
      type: 'string' as const,
      format: 'uuid' as const,
      description: 'ID del proyecto donde se creará la tarea'
    }
  },
  required: ['idProyecto']
};

export const TareaProyectoResponse201Schema = {
  type: 'object' as const,
  properties: {
    mensaje: { type: 'string' as const },
    idNuevaTarea: { type: 'string' as const, format: 'uuid' as const }
  }
};

export const TareaProyectoParamsConTareaSchema = {
  type: 'object' as const,
  properties: {
    idProyecto: {
      type: 'string' as const,
      format: 'uuid' as const,
      description: 'ID del proyecto'
    },
    idTarea: {
      type: 'string' as const,
      format: 'uuid' as const,
      description: 'ID de la tarea'
    }
  },
  required: ['idProyecto', 'idTarea']
};

export const ActualizarTareaProyectoBodySchema = {
  type: 'object' as const,
  properties: {
    tituloTarea: {
      type: 'string' as const,
      minLength: 5,
      maxLength: 100,
      description: 'Título de la tarea (5-100 caracteres)'
    },
    descripcionTarea: {
      type: 'string' as const,
      maxLength: 500,
      nullable: true,
      description: 'Descripción detallada de la tarea (máx. 500 caracteres)'
    },
    estadoTarea: {
      type: 'string' as const,
      enum: ['pendiente', 'en-progreso', 'bloqueada', 'completada'] as const,
      description: 'Estado de la tarea'
    },
    idConsultorAsignado: {
      type: 'string' as const,
      format: 'uuid' as const,
      nullable: true,
      description: 'ID del consultor asignado a la tarea (debe estar asignado al proyecto)'
    },
    fechaLimiteTarea: {
      type: 'string' as const,
      format: 'date' as const,
      nullable: true,
      description: 'Fecha límite de la tarea (YYYY-MM-DD)'
    }
  }
};

export const ListarTareasProyectoResponse200Schema = {
  type: 'object' as const,
  properties: {
    mensaje: { type: 'string' as const },
    tareas: {
      type: 'array' as const,
      items: { $ref: 'TareaSchema#' }
    },
    total: { type: 'number' as const }
  }
};

export const ActualizarTareaProyectoResponse200Schema = {
  type: 'object' as const,
  properties: {
    mensaje: { type: 'string' as const },
    tareaActualizada: { $ref: 'TareaSchema#' }
  }
};

//* Schema para errores 400 - Validación Zod
export const ErrorResponse400ZodSchema = {
  type: 'object' as const,
  properties: {
    mensaje: { type: 'string' as const },
    detalles: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          campo: { type: 'string' as const },
          error: { type: 'string' as const }
        }
      }
    }
  }
};

//* Schema para errores 400 - Validación de negocio
export const ErrorResponse400NegocioSchema = {
  type: 'object' as const,
  properties: {
    mensaje: { type: 'string' as const }
  }
};

//* Schema para errores 404
export const ErrorResponse404Schema = {
  type: 'object' as const,
  properties: {
    mensaje: { type: 'string' as const }
  }
};

//* Schema para errores 409
export const ErrorResponse409Schema = {
  type: 'object' as const,
  properties: {
    mensaje: { type: 'string' as const }
  }
};

//* Schema genérico de error (para compatibilidad)
export const ErrorResponseSchema = ErrorResponse400NegocioSchema;

//* Schemas de respuesta CON EJEMPLOS para usar en enrutadores
export const ErrorResponse400NegocioConEjemplos = {
  ...ErrorResponse400NegocioSchema,
  examples: [
    {
      summary: "Error de validación Zod (body vacío o mal formado)",
      value: {
        mensaje: "Error de validación",
        detalles: [
          {
            campo: "tituloTarea",
            error: "El título de la tarea es obligatorio"
          },
          {
            campo: "tituloTarea",
            error: "El título debe tener al menos 5 caracteres"
          }
        ]
      }
    },
    {
      summary: "Consultor no asignado al proyecto",
      value: {
        mensaje: "El consultor abc-123 no está asignado a este proyecto."
      }
    },
    {
      summary: "Fecha límite fuera del rango del proyecto",
      value: {
        mensaje: "La fecha límite (2025-01-01) no puede ser anterior a la fecha de inicio del proyecto (2025-02-01)."
      }
    }
  ]
};

export const ErrorResponse404ConEjemplos = {
  ...ErrorResponse404Schema,
  examples: [
    {
      summary: "Proyecto no encontrado",
      value: {
        mensaje: "Proyecto no encontrado con ID: xyz-456"
      }
    },
    {
      summary: "Consultor no encontrado",
      value: {
        mensaje: "Consultor asignado no encontrado con ID: abc-123"
      }
    },
    {
      summary: "Tarea no encontrada",
      value: {
        mensaje: "Tarea no encontrada"
      }
    }
  ]
};

export const ErrorResponse409ConEjemplos = {
  ...ErrorResponse409Schema,
  examples: [
    {
      summary: "Tarea duplicada",
      value: {
        mensaje: "Ya existe una tarea con el título 'Revisión Legal' en este proyecto."
      }
    },
    {
      summary: "Validación S4: La tarea ya está completada",
      value: {
        mensaje: "La tarea ya se encuentra completada."
      }
    }
  ]
};

//* Schema para Swagger (con as const para tipado)
export const GestionTareasSchema = {
  CrearTareaProyectoBody: CrearTareaProyectoBodySchema,
  TareaProyectoParams: TareaProyectoParamsSchema,
  TareaProyectoResponse201: TareaProyectoResponse201Schema,
  ErrorResponse400Zod: ErrorResponse400ZodSchema,
  ErrorResponse400Negocio: ErrorResponse400NegocioSchema,
  ErrorResponse404: ErrorResponse404Schema,
  ErrorResponse409: ErrorResponse409Schema,
  ErrorResponse: ErrorResponseSchema
} as const;

