CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS asignaciones_consultores_proyectos (
    id_asignacion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_consultor UUID NOT NULL,
    id_proyecto UUID NOT NULL,
    rol_consultor VARCHAR(50) NULL,
    porcentaje_dedicacion INTEGER NOT NULL CHECK (porcentaje_dedicacion BETWEEN 0 AND 100), /*garantizar que el porcentaje esté entre 0 y 100*/
    fecha_inicio_asignacion DATE NOT NULL,
    fecha_fin_asignacion DATE NULL,
    
    -- Claves foráneas
    CONSTRAINT fk_asignacion_consultor 
        FOREIGN KEY (id_consultor) 
        REFERENCES consultores(id_consultor),
    
    CONSTRAINT fk_asignacion_proyecto 
        FOREIGN KEY (id_proyecto) 
        REFERENCES proyectos(id_proyecto),
    
    -- Restricción única para evitar duplicados (mismo consultor, mismo proyecto, mismo rol)
    CONSTRAINT uk_consultor_proyecto_rol 
        UNIQUE (id_consultor, id_proyecto, rol_consultor),
    
    -- Validación de fechas
    CONSTRAINT chk_fechas_asignacion 
        CHECK (fecha_fin_asignacion IS NULL OR fecha_fin_asignacion >= fecha_inicio_asignacion)
);