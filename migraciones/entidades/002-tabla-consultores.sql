CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE disponibilidad_consultor_tipo AS ENUM (
    'disponible',
    'ocupado',
    'en_descanso',
    'no_disponible'
);

CREATE TABLE IF NOT EXISTS consultores (
    id_consultor UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_consultor VARCHAR(100) NOT NULL,
    especialidad_consultor VARCHAR(100) NOT NULL,
    disponibilidad_consultor disponibilidad_consultor_tipo NOT NULL, 
    email_consultor VARCHAR(100) NOT NULL UNIQUE,
    telefono_consultor VARCHAR(30) NULL
);