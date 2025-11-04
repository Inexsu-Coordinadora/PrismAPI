CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 

CREATE TABLE IF NOT EXISTS clientes (
    idCliente UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombreCliente VARCHAR(100) NOT NULL,
    apellidoCliente VARCHAR(100) NOT NULL,
    documentoCliente NUMBER,
    emailCliente VARCHAR(100) NOT NULL,
    telefonoCliente VARCHAR(100) NOT NULL,
   
);