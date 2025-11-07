CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 

CREATE TABLE IF NOT EXISTS clientes (
    id_cliente UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_cliente VARCHAR(100) NOT NULL,
    apellido_cliente VARCHAR(100) NOT NULL,
    documento_cliente INTEGER,
    email_cliente VARCHAR(100) NOT NULL,
    telefono_cliente VARCHAR(100) NOT NULL
   
);