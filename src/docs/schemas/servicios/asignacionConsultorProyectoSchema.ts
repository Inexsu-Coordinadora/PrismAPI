//* Schema base para Asignación Consultor-Proyecto
export const AsignacionBodySchema = {
  type: 'object' as const,
  required: ['idConsultor', 'idProyecto', 'fechaInicioAsignacion'],
  properties: {
    idConsultor: {
      type: 'string' as const,
      format: 'uuid' as const,
      description: 'ID del consultor a asignar'
    },
    idProyecto: {
      type: 'string' as const,
      format: 'uuid' as const,
      description: 'ID del proyecto al que se asigna el consultor'
    },
    rolConsultor: {
      type: 'string' as const,
      minLength: 2,
      maxLength: 30,
      nullable: true,
      description: 'Rol del consultor en el proyecto (opcional)'
    },
    porcentajeDedicacion: {
      type: 'number' as const,
      minimum: 0,
      maximum: 100,
      nullable: true,
      description: 'Porcentaje de dedicación del consultor (0-100%, opcional)'
    },
    fechaInicioAsignacion: {
      type: 'string' as const,
      format: 'date' as const,
      description: 'Fecha de inicio de la asignación (YYYY-MM-DD)'
    },
    fechaFinAsignacion: {
      type: 'string' as const,
      format: 'date' as const,
      nullable: true,
      description: 'Fecha de fin de la asignación (YYYY-MM-DD, opcional)'
    }
  }
};

export const AsignacionResponse201Schema = {
  type: 'object' as const,
  properties: {
    exito: { type: 'boolean' as const },
    mensaje: { type: 'string' as const },
    datos: {
      type: 'object' as const,
      properties: {
        idAsignacion: { type: 'string' as const, format: 'uuid' as const }
      }
    }
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
            campo: "idConsultor",
            error: "El id del consultor es obligatorio"
          },
          {
            campo: "fechaInicioAsignacion",
            error: "Debe proporcionar una fecha de inicio válida"
          }
        ]
      }
    },
    {
      summary: "Dedicación total excede el 100%",
      value: {
        mensaje: "La dedicación total excede el 100%. Actualmente tiene 80% asignado. Nueva: 30%, Total: 110%"
      }
    },
    {
      summary: "Fechas inválidas",
      value: {
        mensaje: "La fecha fin debe ser posterior o igual a la fecha de inicio."
      }
    },
    {
      summary: "Fecha fuera del rango del proyecto",
      value: {
        mensaje: "La fecha de inicio de asignación no puede ser anterior a la fecha de inicio del proyecto"
      }
    }
  ]
};

export const ErrorResponse404ConEjemplos = {
  ...ErrorResponse404Schema,
  examples: [
    {
      summary: "Consultor no encontrado",
      value: {
        mensaje: "El consultor con idConsultor: abc-123 no existe."
      }
    },
    {
      summary: "Proyecto no encontrado",
      value: {
        mensaje: "El proyecto con idProyecto: xyz-456 no existe."
      }
    }
  ]
};

export const ErrorResponse409ConEjemplos = {
  ...ErrorResponse409Schema,
  examples: [
    {
      summary: "Asignación duplicada",
      value: {
        mensaje: "Ya existe una asignación de este consultor a este proyecto."
      }
    },
    {
      summary: "Proyecto finalizado",
      value: {
        mensaje: "No se puede asignar consultores a un proyecto finalizado"
      }
    },
    {
      summary: "Consultor no disponible",
      value: {
        mensaje: "El consultor Juan Pérez no está disponible. Estado actual: ocupado. Solo se pueden asignar consultores en estado DISPONIBLE."
      }
    }
  ]
};

//* Schema para Swagger (con as const para tipado)
export const AsignacionSchema = {
  AsignacionBody: AsignacionBodySchema,
  AsignacionResponse201: AsignacionResponse201Schema,
  ErrorResponse400Zod: ErrorResponse400ZodSchema,
  ErrorResponse400Negocio: ErrorResponse400NegocioSchema,
  ErrorResponse404: ErrorResponse404Schema,
  ErrorResponse409: ErrorResponse409Schema,
  ErrorResponse: ErrorResponseSchema
} as const;

