CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE estado_tarea_tipo AS ENUM (
    'pendiente',
    'en-desarrollo',
    'finalizada'
);

CREATE TABLE IF NOT EXISTS tareas (
    id_tarea UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo_tarea VARCHAR(100) NOT NULL,
    descripcion_tarea VARCHAR(500) NULL,
    estado_tarea estado_tarea_tipo NOT NULL DEFAULT 'pendiente',
);