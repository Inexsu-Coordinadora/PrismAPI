-- ============================================
-- SEED DATA PARA PrismAPI
-- Datos de prueba realistas para Gestión de Proyectos
-- Temática: Empresa de desarrollo de software para Logística y Transporte
-- ============================================

-- Limpiar datos existentes (opcional, comentar si no deseas borrar datos)
TRUNCATE TABLE registrar_horas CASCADE;
TRUNCATE TABLE tareas CASCADE;
TRUNCATE TABLE asignaciones_consultores_proyectos CASCADE;
TRUNCATE TABLE proyectos CASCADE;
TRUNCATE TABLE consultores CASCADE;
TRUNCATE TABLE clientes CASCADE;

-- ============================================
-- 1. CLIENTES (Empresas de transporte, e-commerce, retail)
-- Prefijo: c000...
-- ============================================

INSERT INTO clientes (id_cliente, nombre_cliente, apellido_cliente, documento_cliente, email_cliente, telefono_cliente) VALUES
-- Empresas de Transporte
('c0000000-0000-4000-a000-000000000001', 'Carlos', 'Rodríguez', 12345678, 'carlos.rodriguez@translogistica.com', '+57 300 123 4567'),
('c0000000-0000-4000-a000-000000000002', 'María', 'González', 23456789, 'maria.gonzalez@enviosrapidos.co', '+57 301 234 5678'),
('c0000000-0000-4000-a000-000000000003', 'Roberto', 'Martínez', 34567890, 'roberto.martinez@cargatotal.com', '+57 302 345 6789'),

-- E-commerce
('c0000000-0000-4000-a000-000000000004', 'Ana', 'López', 45678901, 'ana.lopez@marketplace.com', '+57 303 456 7890'),
('c0000000-0000-4000-a000-000000000005', 'Luis', 'Hernández', 56789012, 'luis.hernandez@shopexpress.co', '+57 304 567 8901'),

-- Retail
('c0000000-0000-4000-a000-000000000006', 'Patricia', 'Sánchez', 67890123, 'patricia.sanchez@supermercados.com', '+57 305 678 9012'),
('c0000000-0000-4000-a000-000000000007', 'Fernando', 'Ramírez', 78901234, 'fernando.ramirez@distribuidora.co', '+57 306 789 0123');

-- ============================================
-- 2. CONSULTORES (Especialistas en desarrollo)
-- Prefijo: d000...
-- ============================================

INSERT INTO consultores (id_consultor, nombre_consultor, especialidad_consultor, disponibilidad_consultor, email_consultor, telefono_consultor) VALUES
-- Consultores Activos (con proyectos)
('d0000000-0000-4000-a000-000000000001', 'Juan', 'Backend Developer', 'ocupado', 'juan.perez@prismapi.com', '+57 310 111 1111'),
('d0000000-0000-4000-a000-000000000002', 'Sofía', 'Full Stack Developer', 'ocupado', 'sofia.garcia@prismapi.com', '+57 311 222 2222'),
('d0000000-0000-4000-a000-000000000003', 'Diego', 'DevOps Engineer', 'ocupado', 'diego.torres@prismapi.com', '+57 312 333 3333'),
('d0000000-0000-4000-a000-000000000004', 'Laura', 'Frontend Developer', 'ocupado', 'laura.mendoza@prismapi.com', '+57 313 444 4444'),
('d0000000-0000-4000-a000-000000000005', 'Andrés', 'Backend Developer', 'ocupado', 'andres.castro@prismapi.com', '+57 314 555 5555'),
('d0000000-0000-4000-a000-000000000006', 'Camila', 'QA Engineer', 'ocupado', 'camila.ruiz@prismapi.com', '+57 315 666 6666'),

-- Consultores Bench (SIN proyectos asignados) - Edge Case
('d0000000-0000-4000-a000-000000000007', 'Ricardo', 'Backend Developer', 'disponible', 'ricardo.vargas@prismapi.com', '+57 316 777 7777'),
('d0000000-0000-4000-a000-000000000008', 'Valentina', 'Full Stack Developer', 'disponible', 'valentina.morales@prismapi.com', '+57 317 888 8888'),

-- Consultor en Descanso
('d0000000-0000-4000-a000-000000000009', 'Carlos', 'DevOps Engineer', 'en_descanso', 'carlos.silva@prismapi.com', '+57 318 999 9999');

-- ============================================
-- 3. PROYECTOS (Logística y Transporte)
-- Prefijo: b000...
-- ============================================

INSERT INTO proyectos (id_proyecto, nombre_proyecto, tipo_proyecto, fecha_inicio_proyecto, fecha_fin_proyecto, estado_proyecto, id_cliente) VALUES
-- Proyectos FINALIZADOS (fecha fin en el pasado)
('b0000000-0000-4000-a000-000000000001', 'Migración de Sistema de Tracking', 'Migración', '2024-01-15', '2024-06-30', 'finalizado', 'c0000000-0000-4000-a000-000000000001'),
('b0000000-0000-4000-a000-000000000002', 'App Móvil para Conductores', 'Desarrollo Móvil', '2024-02-01', '2024-08-15', 'finalizado', 'c0000000-0000-4000-a000-000000000002'),

-- Proyectos ACTIVOS (en progreso)
('b0000000-0000-4000-a000-000000000003', 'Dashboard de Envíos en Tiempo Real', 'Dashboard', '2024-09-01', NULL, 'activo', 'c0000000-0000-4000-a000-000000000003'),
('b0000000-0000-4000-a000-000000000004', 'Sistema de Optimización de Rutas', 'Optimización', '2024-10-15', NULL, 'activo', 'c0000000-0000-4000-a000-000000000004'),
('b0000000-0000-4000-a000-000000000005', 'API de Integración con Transportadoras', 'Integración', '2024-11-01', NULL, 'activo', 'c0000000-0000-4000-a000-000000000005'),

-- Proyecto PENDIENTE (planificación) - Edge Case: Sin consultores ni tareas aún
('b0000000-0000-4000-a000-000000000006', 'Plataforma de Gestión de Flotas', 'Plataforma', '2025-02-01', NULL, 'pendiente', 'c0000000-0000-4000-a000-000000000006'),

-- Proyecto CRÍTICO (con muchas tareas bloqueadas/atrasadas) - Edge Case
('b0000000-0000-4000-a000-000000000007', 'Sistema de Facturación y Cobros', 'Sistema', '2024-08-01', '2025-01-31', 'activo', 'c0000000-0000-4000-a000-000000000007');

-- ============================================
-- 4. ASIGNACIONES (Consultores a Proyectos)
-- Prefijo: a000...
-- ============================================

INSERT INTO asignaciones_consultores_proyectos (id_asignacion, id_consultor, id_proyecto, rol_consultor, porcentaje_dedicacion, fecha_inicio_asignacion, fecha_fin_asignacion) VALUES
-- Asignaciones en Proyectos FINALIZADOS
('a0000000-0000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000001', 'Tech Lead', 100, '2024-01-15', '2024-06-30'),
('a0000000-0000-4000-a000-000000000002', 'd0000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-000000000001', 'Developer', 80, '2024-01-15', '2024-06-30'),
('a0000000-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000003', 'b0000000-0000-4000-a000-000000000002', 'DevOps', 50, '2024-02-01', '2024-08-15'),
('a0000000-0000-4000-a000-000000000004', 'd0000000-0000-4000-a000-000000000004', 'b0000000-0000-4000-a000-000000000002', 'Frontend Lead', 100, '2024-02-01', '2024-08-15'),

-- Asignaciones en Proyectos ACTIVOS
('a0000000-0000-4000-a000-000000000005', 'd0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000003', 'Backend Lead', 60, '2024-09-01', NULL),
('a0000000-0000-4000-a000-000000000006', 'd0000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-000000000003', 'Full Stack', 100, '2024-09-01', NULL),
('a0000000-0000-4000-a000-000000000007', 'd0000000-0000-4000-a000-000000000003', 'b0000000-0000-4000-a000-000000000004', 'DevOps', 40, '2024-10-15', NULL),
('a0000000-0000-4000-a000-000000000008', 'd0000000-0000-4000-a000-000000000005', 'b0000000-0000-4000-a000-000000000004', 'Backend', 80, '2024-10-15', NULL),
('a0000000-0000-4000-a000-000000000009', 'd0000000-0000-4000-a000-000000000006', 'b0000000-0000-4000-a000-000000000005', 'QA Lead', 50, '2024-11-01', NULL),
('a0000000-0000-4000-a000-00000000000a', 'd0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000005', 'Backend', 50, '2024-11-01', NULL),

-- Asignaciones en Proyecto CRÍTICO (múltiples consultores)
('a0000000-0000-4000-a000-00000000000b', 'd0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000007', 'Tech Lead', 100, '2024-08-01', NULL),
('a0000000-0000-4000-a000-00000000000c', 'd0000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-000000000007', 'Full Stack', 80, '2024-08-01', NULL),
('a0000000-0000-4000-a000-00000000000d', 'd0000000-0000-4000-a000-000000000005', 'b0000000-0000-4000-a000-000000000007', 'Backend', 60, '2024-08-01', NULL),
('a0000000-0000-4000-a000-00000000000e', 'd0000000-0000-4000-a000-000000000006', 'b0000000-0000-4000-a000-000000000007', 'QA', 40, '2024-08-01', NULL);

-- ============================================
-- 5. TAREAS (Asociadas a Proyectos y Consultores)
-- Prefijo: e000...
-- ============================================

INSERT INTO tareas (id_tarea, titulo_tarea, descripcion_tarea, estado_tarea, fecha_limite_tarea, id_proyecto, id_consultor_asignado) VALUES
-- Tareas en Proyecto FINALIZADO (todas completadas)
('e0000000-0000-4000-a000-000000000001', 'Análisis de Requerimientos', 'Revisar sistema legacy y documentar funcionalidades', 'completada', '2024-02-15', 'b0000000-0000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000001'),
('e0000000-0000-4000-a000-000000000002', 'Diseño de Arquitectura', 'Diseñar nueva arquitectura del sistema de tracking', 'completada', '2024-03-01', 'b0000000-0000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000001'),
('e0000000-0000-4000-a000-000000000003', 'Implementación Backend', 'Desarrollar APIs REST para tracking', 'completada', '2024-04-30', 'b0000000-0000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000002'),

-- Tareas en Proyecto ACTIVO (Dashboard de Envíos)
('e0000000-0000-4000-a000-000000000004', 'Configurar WebSockets', 'Implementar conexión en tiempo real para actualizaciones', 'en-progreso', '2024-12-15', 'b0000000-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000001'),
('e0000000-0000-4000-a000-000000000005', 'Desarrollar Componentes de Mapa', 'Crear visualización de rutas en mapa interactivo', 'en-progreso', '2024-12-20', 'b0000000-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000002'),
('e0000000-0000-4000-a000-000000000006', 'Integración con API de Tracking', 'Conectar con servicios externos de tracking', 'pendiente', '2025-01-10', 'b0000000-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000001'),

-- Tareas en Proyecto ACTIVO (Optimización de Rutas)
('e0000000-0000-4000-a000-000000000007', 'Algoritmo de Optimización', 'Implementar algoritmo genético para optimización', 'en-progreso', '2024-12-31', 'b0000000-0000-4000-a000-000000000004', 'd0000000-0000-4000-a000-000000000005'),
('e0000000-0000-4000-a000-000000000008', 'Pruebas de Carga', 'Realizar pruebas de rendimiento del algoritmo', 'pendiente', '2025-01-15', 'b0000000-0000-4000-a000-000000000004', 'd0000000-0000-4000-a000-000000000006'),

-- Tareas BLOQUEADAS en Proyecto CRÍTICO (Edge Case)
('e0000000-0000-4000-a000-000000000009', 'Integración con Pasarela de Pagos', 'BLOQUEADA: Esperando aprobación de seguridad de la pasarela', 'bloqueada', '2024-12-01', 'b0000000-0000-4000-a000-000000000007', 'd0000000-0000-4000-a000-000000000001'),
('e0000000-0000-4000-a000-00000000000a', 'Módulo de Facturación', 'BLOQUEADA: Depende de la integración con pasarela de pagos', 'bloqueada', '2024-12-10', 'b0000000-0000-4000-a000-000000000007', 'd0000000-0000-4000-a000-000000000002'),
('e0000000-0000-4000-a000-00000000000b', 'Generación de Reportes', 'BLOQUEADA: Requiere datos de facturación completos', 'bloqueada', '2024-12-20', 'b0000000-0000-4000-a000-000000000007', 'd0000000-0000-4000-a000-000000000005'),

-- Tareas ATRASADAS en Proyecto CRÍTICO (fecha límite en el pasado)
('e0000000-0000-4000-a000-00000000000c', 'Configuración de Base de Datos', 'ATRASADA: Configurar esquema de facturación', 'en-progreso', '2024-11-15', 'b0000000-0000-4000-a000-000000000007', 'd0000000-0000-4000-a000-000000000001'),
('e0000000-0000-4000-a000-00000000000d', 'API de Consulta de Facturas', 'ATRASADA: Endpoints para consultar facturas', 'en-progreso', '2024-11-20', 'b0000000-0000-4000-a000-000000000007', 'd0000000-0000-4000-a000-000000000002'),

-- Tareas en Proyecto ACTIVO (API de Integración)
('e0000000-0000-4000-a000-00000000000e', 'Documentación de API', 'Crear documentación Swagger completa', 'pendiente', '2025-01-05', 'b0000000-0000-4000-a000-000000000005', 'd0000000-0000-4000-a000-000000000001'),
('e0000000-0000-4000-a000-00000000000f', 'Pruebas de Integración', 'Validar integración con transportadoras', 'pendiente', '2025-01-10', 'b0000000-0000-4000-a000-000000000005', 'd0000000-0000-4000-a000-000000000006');

-- ============================================
-- 6. REGISTROS DE HORAS (Coherentes con asignaciones)
-- ============================================

INSERT INTO registrar_horas (id_registro_horas, id_proyecto, id_consultor, fecha_registro, horas_trabajadas, descripcion_actividad) VALUES
-- Registros en Proyecto ACTIVO (Dashboard - fechas dentro del rango)
('f0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000001', '2024-09-05', 8.00, 'Configuración inicial del proyecto y setup del entorno de desarrollo'),
('f0000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000001', '2024-09-10', 6.50, 'Desarrollo de endpoints para consulta de envíos'),
('f0000000-0000-4000-a000-000000000003', 'b0000000-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000002', '2024-09-12', 7.00, 'Implementación de componentes React para visualización'),
('f0000000-0000-4000-a000-000000000004', 'b0000000-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000002', '2024-09-15', 8.00, 'Integración de WebSockets para actualizaciones en tiempo real'),

-- Registros en Proyecto ACTIVO (Optimización de Rutas)
('f0000000-0000-4000-a000-000000000005', 'b0000000-0000-4000-a000-000000000004', 'd0000000-0000-4000-a000-000000000005', '2024-10-20', 7.50, 'Investigación de algoritmos de optimización de rutas'),
('f0000000-0000-4000-a000-000000000006', 'b0000000-0000-4000-a000-000000000004', 'd0000000-0000-4000-a000-000000000005', '2024-10-25', 8.00, 'Implementación de algoritmo genético para optimización'),
('f0000000-0000-4000-a000-000000000007', 'b0000000-0000-4000-a000-000000000004', 'd0000000-0000-4000-a000-000000000003', '2024-10-28', 4.00, 'Configuración de CI/CD para despliegue automático'),

-- Registros en Proyecto CRÍTICO (Sistema de Facturación)
('f0000000-0000-4000-a000-000000000008', 'b0000000-0000-4000-a000-000000000007', 'd0000000-0000-4000-a000-000000000001', '2024-11-05', 8.00, 'Diseño del esquema de base de datos para facturación'),
('f0000000-0000-4000-a000-000000000009', 'b0000000-0000-4000-a000-000000000007', 'd0000000-0000-4000-a000-000000000001', '2024-11-10', 6.00, 'Desarrollo de módulo de generación de facturas'),
('f0000000-0000-4000-a000-00000000000a', 'b0000000-0000-4000-a000-000000000007', 'd0000000-0000-4000-a000-000000000002', '2024-11-12', 7.50, 'Implementación de API REST para consulta de facturas'),
('f0000000-0000-4000-a000-00000000000b', 'b0000000-0000-4000-a000-000000000007', 'd0000000-0000-4000-a000-000000000002', '2024-11-15', 5.50, 'Corrección de bugs en módulo de facturación'),
('f0000000-0000-4000-a000-00000000000c', 'b0000000-0000-4000-a000-000000000007', 'd0000000-0000-4000-a000-000000000006', '2024-11-18', 6.00, 'Pruebas unitarias del módulo de facturación'),

-- Registros en Proyecto ACTIVO (API de Integración)
('f0000000-0000-4000-a000-00000000000d', 'b0000000-0000-4000-a000-000000000005', 'd0000000-0000-4000-a000-000000000001', '2024-11-20', 8.00, 'Desarrollo de endpoints para integración con transportadoras'),
('f0000000-0000-4000-a000-00000000000e', 'b0000000-0000-4000-a000-000000000005', 'd0000000-0000-4000-a000-000000000001', '2024-11-22', 7.00, 'Implementación de autenticación OAuth2'),
('f0000000-0000-4000-a000-00000000000f', 'b0000000-0000-4000-a000-000000000005', 'd0000000-0000-4000-a000-000000000006', '2024-11-25', 5.00, 'Pruebas de integración con API de prueba de transportadoras');

-- ============================================
-- RESUMEN DE DATOS INSERTADOS
-- ============================================
-- Clientes: 7 (c000...)
-- Consultores: 9 (d000...)
-- Proyectos: 7 (b000...)
-- Asignaciones: 14 (a000...)
-- Tareas: 16 (e000...)
-- Registros de Horas: 15 (f000...)
-- ============================================
