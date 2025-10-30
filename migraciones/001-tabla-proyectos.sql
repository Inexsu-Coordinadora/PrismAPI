CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- para generar UUIDs

CREATE TABLE IF NOT EXISTS proyecto (
    idProyecto UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombreProyecto VARCHAR(100) NOT NULL,
    tipoProyecto VARCHAR(100) NULL,
    fechaInicio DATE NOT NULL,
    fechaFin DATE NULL,
    estadoProyecto VARCHAR(20) NOT NULL
);
