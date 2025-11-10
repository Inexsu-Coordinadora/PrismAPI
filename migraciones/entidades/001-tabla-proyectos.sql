CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- para generar UUIDs

CREATE TABLE IF NOT EXISTS proyectos (
    id_proyecto UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_proyecto VARCHAR(100) NOT NULL,
    tipo_proyecto VARCHAR(100) NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,
    estado_proyecto VARCHAR(20) NOT NULL
);

/*Agregar nueva columna*/

ALTER TABLE proyectos
ADD COLUMN id_cliente UUID NULL,

/*Después Agregar clave foránea*/
ALTER TABLE proyectos
ADD CONSTRAINT fk_proyecto_cliente
FOREIGN KEY (id_cliente)
REFERENCES clientes(id_cliente);

