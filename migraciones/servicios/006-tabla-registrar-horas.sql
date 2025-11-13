CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS registrar_horas (
    id_registro_horas UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Estos se llenan desde tu servicio (no automáticos)
    id_proyecto UUID NOT NULL,
    id_consultor UUID NOT NULL,

    fecha_registro DATE NOT NULL,
    horas_trabajadas NUMERIC(5,2) NOT NULL CHECK (horas_trabajadas > 0 AND horas_trabajadas <= 24),
    descripcion_actividad TEXT NOT NULL CHECK (char_length(descripcion_actividad) <= 500),

    -- Relaciones con otras tablas (FKs)
    CONSTRAINT fk_registrar_horas_proyecto
      FOREIGN KEY (id_proyecto)
      REFERENCES proyectos (id_proyecto),

    CONSTRAINT fk_registrar_horas_consultor
      FOREIGN KEY (id_consultor)
      REFERENCES consultores (id_consultor)

);