//* Schema base para Registro de Horas
export const RegistroHorasBodySchema = {
  type: 'object' as const,
  required: ['id_consultor', 'id_proyecto', 'fecha_registro', 'horas_trabajadas', 'descripcion_actividad'],
  properties: {
    id_consultor: {
      type: 'string' as const,
      format: 'uuid' as const,
      description: 'ID del consultor que registra las horas'
    },
    id_proyecto: {
      type: 'string' as const,
      format: 'uuid' as const,
      description: 'ID del proyecto donde se trabajaron las horas'
    },
    fecha_registro: {
      type: 'string' as const,
      format: 'date' as const,
      description: 'Fecha del registro de horas (YYYY-MM-DD)'
    },
    horas_trabajadas: {
      type: 'number' as const,
      minimum: 0.01,
      maximum: 24,
      description: 'Cantidad de horas trabajadas (0.01 - 24 horas)'
    },
    descripcion_actividad: {
      type: 'string' as const,
      minLength: 1,
      maxLength: 500,
      description: 'Descripción de la actividad realizada (1-500 caracteres)'
    }
  }
};

export const RegistroHorasResponse201Schema = {
  type: 'object' as const,
  properties: {
    mensaje: { type: 'string' as const },
    registro: {
      type: 'object' as const,
      properties: {
        idRegistroHoras: { type: 'string' as const, format: 'uuid' as const },
        idConsultor: { type: 'string' as const, format: 'uuid' as const },
        idProyecto: { type: 'string' as const, format: 'uuid' as const },
        fechaRegistro: { type: 'string' as const, format: 'date' as const },
        horasTrabajadas: { type: 'number' as const },
        descripcionActividad: { type: 'string' as const }
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
            campo: "id_consultor",
            error: "El id del consultor es obligatorio"
          },
          {
            campo: "horas_trabajadas",
            error: "Las horas trabajadas deben ser mayores que 0"
          }
        ]
      }
    },
    {
      summary: "Horas inválidas (<= 0 o > 24)",
      value: {
        mensaje: "La cantidad de horas debe ser mayor que 0"
      }
    },
    {
      summary: "Horas exceden el límite diario",
      value: {
        mensaje: "La cantidad de horas no puede superar 24 en un día"
      }
    },
    {
      summary: "Consultor no asignado al proyecto",
      value: {
        mensaje: "El consultor no está asignado a este proyecto"
      }
    },
    {
      summary: "Fecha fuera del rango de asignación",
      value: {
        mensaje: "La fecha del registro está fuera del rango de la asignación del consultor"
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
        mensaje: "El consultor indicado no existe"
      }
    },
    {
      summary: "Proyecto no encontrado",
      value: {
        mensaje: "El proyecto indicado no existe"
      }
    }
  ]
};

export const ErrorResponse409ConEjemplos = {
  ...ErrorResponse409Schema,
  examples: [
    {
      summary: "Registro duplicado",
      value: {
        mensaje: "Ya existe un registro idéntico para este consultor, proyecto, fecha y descripción"
      }
    }
  ]
};

//* Schema para Swagger (con as const para tipado)
export const RegistroHorasSchema = {
  RegistroHorasBody: RegistroHorasBodySchema,
  RegistroHorasResponse201: RegistroHorasResponse201Schema,
  ErrorResponse400Zod: ErrorResponse400ZodSchema,
  ErrorResponse400Negocio: ErrorResponse400NegocioSchema,
  ErrorResponse404: ErrorResponse404Schema,
  ErrorResponse409: ErrorResponse409Schema,
  ErrorResponse: ErrorResponseSchema
} as const;

