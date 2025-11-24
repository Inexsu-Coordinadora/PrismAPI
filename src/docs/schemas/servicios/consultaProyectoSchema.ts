//* Schema base para Consulta de Proyectos
export const ConsultaProyectoParamsSchema = {
  type: 'object' as const,
  properties: {
    idCliente: {
      type: 'string' as const,
      format: 'uuid' as const,
      description: 'ID del cliente cuyos proyectos se desean consultar'
    }
  },
  required: ['idCliente']
};

export const ConsultaProyectoQuerySchema = {
  type: 'object' as const,
  properties: {
    estadoProyecto: {
      type: 'string' as const,
      enum: ['activo', 'finalizado', 'pendiente'] as const,
      description: 'Filtrar por estado del proyecto (opcional)'
    },
    fechaInicioProyecto: {
      type: 'string' as const,
      format: 'date' as const,
      description: 'Filtrar proyectos con fecha de inicio mayor o igual (YYYY-MM-DD, opcional)'
    },
    fechaFinProyecto: {
      type: 'string' as const,
      format: 'date' as const,
      description: 'Filtrar proyectos con fecha de fin menor o igual (YYYY-MM-DD, opcional)'
    }
  }
};

export const ConsultorEnProyectoSchema = {
  type: 'object' as const,
  properties: {
    nombre: { type: 'string' as const },
    rol: { type: 'string' as const, nullable: true }
  }
};

export const ProyectoConConsultoresSchema = {
  type: 'object' as const,
  properties: {
    codigoProyecto: { type: 'string' as const },
    nombreProyecto: { type: 'string' as const },
    estadoProyecto: { 
      type: 'string' as const,
      enum: ['activo', 'finalizado', 'pendiente'] as const
    },
    fechaInicioProyecto: { type: 'string' as const, nullable: true },
    fechaFinProyecto: { type: 'string' as const, nullable: true },
    consultores: {
      type: 'array' as const,
      items: ConsultorEnProyectoSchema
    }
  }
};

export const ConsultaProyectoResponse200Schema = {
  type: 'array' as const,
  items: ProyectoConConsultoresSchema
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

//* Schema genérico de error (para compatibilidad)
export const ErrorResponseSchema = ErrorResponse400NegocioSchema;

//* Schemas de respuesta CON EJEMPLOS para usar en enrutadores
export const ErrorResponse400NegocioConEjemplos = {
  ...ErrorResponse400NegocioSchema,
  examples: [
    {
      summary: "Rango de fechas inválido",
      value: {
        mensaje: "El rango de fechas es inválido: la fecha de inicio no puede ser mayor que la fecha de fin"
      }
    }
  ]
};

export const ErrorResponse404ConEjemplos = {
  ...ErrorResponse404Schema,
  examples: [
    {
      summary: "Cliente no encontrado",
      value: {
        mensaje: "Cliente no encontrado"
      }
    }
  ]
};

//* Schema para Swagger (con as const para tipado)
export const ConsultaProyectoSchema = {
  ConsultaProyectoParams: ConsultaProyectoParamsSchema,
  ConsultaProyectoQuery: ConsultaProyectoQuerySchema,
  ConsultorEnProyecto: ConsultorEnProyectoSchema,
  ProyectoConConsultores: ProyectoConConsultoresSchema,
  ConsultaProyectoResponse200: ConsultaProyectoResponse200Schema,
  ErrorResponse400Negocio: ErrorResponse400NegocioSchema,
  ErrorResponse404: ErrorResponse404Schema,
  ErrorResponse: ErrorResponseSchema
} as const;

