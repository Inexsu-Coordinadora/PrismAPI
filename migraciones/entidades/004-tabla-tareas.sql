CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE estado_tarea_tipo AS ENUM (
    'pendiente',
    'en-progreso', 
    'bloqueada',   
    'completada'
);

CREATE TABLE IF NOT EXISTS tareas (
    id_tarea UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo_tarea VARCHAR(100) NOT NULL,
    descripcion_tarea VARCHAR(500) NULL,
    estado_tarea estado_tarea_tipo NOT NULL DEFAULT 'pendiente',

    -- Nuevos campos requeridos por la E2 Servicio 4 --

    fecha_limite_tarea DATE NULL, 
    id_proyecto UUID NULL, 
    id_consultor_asignado UUID NULL,


    -- Constraints (Relaciones y Reglas) ---

    CONSTRAINT fk_proyecto
        FOREIGN KEY(id_proyecto) 
        REFERENCES proyectos(id_proyecto)
        ON DELETE CASCADE, -- Si se borra el proyecto, se borran sus tareas
    
    -- Clave foránea para el Consultor
    CONSTRAINT fk_consultor_asignado
        FOREIGN KEY(id_consultor_asignado) 
        REFERENCES consultores(id_consultor)
        ON DELETE SET NULL -- Si se borra el consultor, la tarea queda 'huerfana' (sin asignar)

    -- Asegura que una tarea (por su título) sea única DENTRO de un proyecto
    --CONSTRAINT tarea_unica_por_proyecto UNIQUE (id_proyecto, titulo_tarea),


);