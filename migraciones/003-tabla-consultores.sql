CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE DisponibilidadConsultor AS ENUM ('disponible', 'ocupado', 'en descanso', 'no disponible');

CREATE TABLE IF NOT EXISTS consultor (
    idConsultor UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombreConsultor VARCHAR(100) NOT NULL,
    especialidadConsultor VARCHAR(100) NOT NULL,
    disponibilidadConsultor DisponibilidadConsultor NOT NULL, 
    emailConsultor VARCHAR(100) NOT NULL UNIQUE,
    telefonoConsultor VARCHAR(15) NULL
);