CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
export enum Disponibilidad_consultor {
  DISPONIBLE = "disponible",
  OCUPADO = "ocupado",
  EN_DESCANSO = "en_descanso",
  NO_DISPONIBLE = "no_disponible",
}
CREATE TABLE IF NOT EXISTS consultores (
    id_consultor UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_consultor VARCHAR(100) NOT NULL,
    especialidad_consultor VARCHAR(100) NOT NULL,
    disponibilidad_consultor disponibilidad_consultor NOT NULL, 
    email_consultor VARCHAR(100) NOT NULL UNIQUE,
    telefono_consultor VARCHAR(15) NULL
);