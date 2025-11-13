# 📚 Documentación de API (E2): Servicios y Lógica de Negocio

## Introducción

Bienvenido a la documentación técnica de la **Entrega 2** de PrismAPI.

En esta fase, el proyecto evoluciona significativamente: pasamos de los CRUDs básicos (E1), que gestionaban entidades de forma aislada, a un conjunto de **Servicios (E2)** que implementan la lógica de negocio real de la aplicación.

El pilar de esta entrega son las **validaciones complejas** y la **integración entre entidades**. Cada servicio no solo crea o consulta datos, sino que aplica reglas de negocio críticas (como topes de dedicación, coherencia de fechas o permisos de asignación) para garantizar la integridad y el valor del sistema.

Este documento detalla los 4 servicios implementados, sus *endpoints* y las reglas de negocio que cada uno aplica.

---

## 🚨 Manejo Uniforme de Errores

Un requisito clave de esta entrega es la uniformidad en las respuestas de error. Todos los *endpoints* de servicios (S1 a S4) que rechazan una solicitud por una validación de negocio devuelven una estructura de error idéntica para asegurar una experiencia predecible en el *frontend*.

**Ejemplo de Estructura de Error (400 Bad Request - Validación de Negocio):**

```json
{
  "mensaje": "Validación fallida: La dedicación total (110%) supera el 100%."
}
```

**Ejemplo de Estructura de Error (400 Bad Request - Error de Validación Zod):**

```json
{
  "mensaje": "Error al validar los datos de entrada",
  "error": "Expected number, received string"
}
```

**Ejemplo de Recurso no Encontrado (404 Not Found):**

```json
{
  "mensaje": "El recurso 'Proyecto' con id '...' no encontrado"
}
```

---

## 🚀 Endpoints Entrega 2: Servicios

A continuación, se detallan los 4 servicios implementados.

### Servicio 1: Gestión de Asignación (Consultor-Proyecto)

El Servicio 1 es fundamental para la Entrega 2, ya que constituye el núcleo para la gestión de asignaciones de consultores a proyectos. Proporciona endpoints que implementan sólidas validaciones de negocio, asegurando la integridad de los datos y la optimización de recursos. Este servicio no solo permite vincular consultores a proyectos, sino que también sirve de base para las validaciones realizadas en otros servicios, como S3 y S4.

🎥 **Demonstración en Video (S1):** [Haz clic aquí para ver la demostración en YouTube](https://youtu.be/HRGAN_EFj1s)

Este video muestra la operación de todos los endpoints de este servicio, incluyendo casos de éxito y todas las validaciones de error (inexistencia, duplicidad, exceso de dedicación).

#### POST /api/asignaciones

Crea una asignación de un consultor a un proyecto con validaciones.

**Body (JSON):** (*AsignacionConsultorProyectoEsquema*)

```json
{
  "idConsultor": "a1a1a1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1",
  "idProyecto": "656c3061-83d3-4736-a4a6-2550e8b76c07",
  "rolConsultor": "Líder Técnico",
  "porcentajeDedicacion": 50,
  "fechaInicioAsignacion": "2025-01-01",
  "fechaFinAsignacion": "2025-06-30"
}
```

**Validaciones (Lógica de Negocio):**

- ✅ (S1) **Existencia de Recursos:** Valida que exista un consultor y un proyecto.
- ✅ (S1) **No Duplicidad:** Previene asignaciones idénticas (igual consultor + proyecto + rol).
- ✅ (S1) **Fechas:** Valida que las fechas sean coherentes (fechaFin ≥ fechaInicio) y que estén dentro del rango del proyecto.
- ✅ (S1) **Estado del Proyecto:**
  - **Activo:** Valida fechas dentro del rango del proyecto.
  - **Finalizado:** Rechaza cualquier nueva asignación.
  - **Pendiente:** Asignaciones libres sin restricciones temporales.
- ✅ (S1) **Dedicación:**
  - Cálculo dinámico: Suma porcentajes en períodos superpuestos.
  - Límite estricto: Rechaza operaciones > 100%.

**Respuestas:**

- 200 OK: Asignación creada exitosamente.
- 400 Bad Request: Error de validación de negocio.

#### PUT /api/asignaciones/:idAsignacion

Actualiza una asignación existente manteniendo todas las validaciones.

**Parámetros (URL):**

- idAsignacion (UUID): El ID de la asignación a actualizar.

**Body (JSON):** (*ActualizarAsignacionConsultorProyectoEsquema*)

```json
{
  "idConsultor": "a1a1a1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1",
  "idProyecto": "656c3061-83d3-4736-a4a6-2550e8b76c07",
  "rolConsultor": "Líder Técnico",
  "porcentajeDedicacion": 60,
  "fechaInicioAsignacion": "2025-01-01",
  "fechaFinAsignacion": "2025-06-30"
}
```

**Validaciones (Lógica de Negocio):**

- ✅ (S1) Aplica las mismas validaciones que en POST (existencia, no duplicidad, fechas, estado del proyecto, dedicación).

#### GET /api/asignaciones/:idAsignacion

Obtiene una asignación específica.

**Parámetros (URL):**

- idAsignacion (UUID): El ID de la asignación.

**Validaciones:**

- ✅ (S1) Valida que la asignación (idAsignacion) exista.

#### GET /api/asignaciones/consultor/:idConsultor

Obtiene las asignaciones de un consultor específico.

**Parámetros (URL):**

- idConsultor (UUID): El ID del consultor.

**Validaciones:**

- ✅ (S1) Valida que el consultor exista.

#### GET /api/asignaciones/proyecto/:idProyecto

Obtiene las asignaciones de un proyecto específico.

**Parámetros (URL):**

- idProyecto (UUID): El ID del proyecto.

**Validaciones:**

- ✅ (S1) Valida que el proyecto exista.

#### GET /api/asignaciones/consultor/:idConsultor/dedicacion

Calcula el porcentaje de dedicación de un consultor en un rango de fechas específico.

**Parámetros (URL):**

- idConsultor (UUID): El ID del consultor.

**Query Params:**

- ?fechaInicio=2025-01-01 (requerido): Fecha de inicio del período.
- ?fechaFin=2025-06-30 (opcional): Fecha fin del período.

**Validaciones:**

- ✅ (S1) Valida que el consultor exista.
- ✅ (S1) Valida que las fechas sean coherentes.

#### DELETE /api/asignaciones/:idAsignacion

Elimina una asignación de un consultor a un proyecto.

**Parámetros (URL):**

- idAsignacion (UUID): El ID de la asignación.

**Validaciones:**

- ✅ (S1) Valida que la asignación (idAsignacion) exista antes de borrarla.

---

### Métodos de Integración

El Servicio 1 proporciona métodos que son utilizados por otros servicios:

- `obtenerAsignacionExistente()`: Utilizado por otros servicios para verificar disponibilidad.
- `obtenerDedicacionConsultor()`: Consultado para planificación de recursos.
- Validaciones existentes: Reutilizables en otros contextos.

---

### Servicio 2: Consulta de Proyectos por Cliente

Este servicio permite consultar la información de proyectos, pero filtrada desde la perspectiva de un cliente específico.

🎥 **Demonstración en Video (S2):**

[Haz clic aquí para ver la demostración en YouTube](URL_PLACEHOLDER_S2)

Este video muestra la operación de todos los endpoints de este servicio, incluyendo filtros opcionales, casos de éxito y validaciones de error (cliente inexistente).

#### GET /api/clientes/:idCliente/proyectos

Obtiene la lista de proyectos de un cliente, con filtros opcionales (estado, fechas) y un resumen del equipo.

**Parámetros (URL):**

- idCliente (UUID): El ID del cliente.

**Query Params (Opcionales):**

- ?estado=en_progreso
- ?fechaInicio=2025-01-01

**Validaciones (Lógica de Negocio):**

- ✅ (S2) Valida que el idCliente exista. Si no, retorna error.
- ✅ (S2) Retorna una lista vacía [] si el cliente existe pero no tiene proyectos (respuesta válida).

---

### Servicio 3: Registro y Control de Horas (Timesheet)

Este servicio permite a los consultores registrar horas (partes) en los proyectos, validando que el registro sea coherente con su asignación (S1).

🎥 **Demonstración en Video (S3):**

[Haz clic aquí para ver la demostración en YouTube](URL_PLACEHOLDER_S3)

Este video muestra la operación de todos los endpoints de este servicio, incluyendo casos de éxito y todas las validaciones de error (consultor no asignado, fecha fuera de rango, horas inválidas).

#### POST /api/partes-horas

Registra un nuevo parte de horas de un consultor a un proyecto en una fecha específica.

**Body (JSON):**

```json
{
  "idProyecto": "656c3061-83d3-4736-a4a6-2550e8b76c07",
  "idConsultor": "a1a1a1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1",
  "fecha": "2025-03-15",
  "cantidadHoras": 2.5,
  "descripcion": "Revisión de PRs E2"
}
```

**Validaciones (Lógica de Negocio):**

- ✅ (S3) Valida que idProyecto e idConsultor existan.
- ✅ (S1+S3) **Validación Clave:** Valida que el consultor esté asignado al proyecto (ver S1) y que la fecha del parte esté dentro del rango de su asignación.
- ✅ (S3) Valida que la cantidadHoras sea > 0 y ≤ 24 (o un límite diario razonable).

---

### Servicio 4: Gestión de Tareas de Proyecto

Este servicio expande el CRUD de Tareas (E1), anidando la gestión de tareas dentro de un proyecto específico e integrando validaciones con Proyectos y Consultores (S1).

🎥 **Demonstración en Video (S4):** [Haz clic aquí para ver la demostración en YouTube](https://youtu.be/z3O-AX3xk2Q)



Este video muestra la operación de todos los endpoints de este servicio, incluyendo casos de éxito y todas las validaciones de error (proyecto inexistente, duplicidad, consultor no asignado).

#### POST /api/proyectos/:idProyecto/tareas

Crea una nueva tarea asociada a un proyecto específico.

**Parámetros (URL):**

- idProyecto (UUID): El ID del proyecto al que pertenecerá la tarea.

**Body (JSON):** (*CrearProyectoTareaEsquema*)

```json
{
  "tituloTarea": "Tarea de Integración Exitosa",
  "descripcionTarea": "Hacer la demo del S4.",
  "estadoTarea": "en-progreso",
  "fechaLimiteTarea": "2025-05-10",
  "idConsultorAsignado": "a1a1a1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1"
}
```

**Validaciones (Lógica de Negocio):**

- ✅ (S4) Valida que el idProyecto de la URL exista.
- ✅ (S4) Valida que el idConsultorAsignado (si se envía) exista en la tabla consultores.
- ✅ (S1+S4) Valida que el idConsultorAsignado (si se envía) esté asignado a ese idProyecto (Integración con Servicio 1).
- ✅ (S4) Valida que el tituloTarea no esté duplicado dentro de ese proyecto.
- ✅ (S4) Valida que la fechaLimiteTarea (si se envía) no sea anterior a la fechaInicio del proyecto (o esté fuera del rango del proyecto).

#### GET /api/proyectos/:idProyecto/tareas

Obtiene la lista de todas las tareas que pertenecen a un proyecto específico.

**Parámetros (URL):**

- idProyecto (UUID): El ID del proyecto.

**Validaciones:**

- ✅ Valida que el idProyecto exista.

#### GET /api/proyectos/:idProyecto/tareas/:idTarea

Obtiene una tarea específica, validando que pertenezca al proyecto.

**Parámetros (URL):**

- idProyecto (UUID): El ID del proyecto.
- idTarea (UUID): El ID de la tarea.

**Validaciones:**

- ✅ Valida que la tarea (idTarea) exista Y que su id_proyecto coincida con el idProyecto de la URL.

#### PUT /api/proyectos/:idProyecto/tareas/:idTarea

Actualiza parcialmente una tarea (título, estado, consultor, etc.).

**Parámetros (URL):**

- idProyecto (UUID): El ID del proyecto.
- idTarea (UUID): El ID de la tarea.

**Body (JSON):** (*ActualizarProyectoTareaEsquema*)

```json
{
  "estadoTarea": "completada",
  "idConsultorAsignado": "b2b2b2b2-bbbb-4bbb-bbbb-bbbbbbbbbbb2"
}
```

**Validaciones (Lógica de Negocio):**

- ✅ Valida que la tarea (idTarea) exista Y que pertenezca al idProyecto.
- ✅ (S4) Valida que el idConsultorAsignado (si se actualiza) exista.
- ✅ (S1+S4) Valida que el idConsultorAsignado (si se actualiza) esté asignado a ese idProyecto.
- ✅ (S4) Valida que la fechaLimiteTarea (si se actualiza) sea coherente con las fechas del proyecto.
- ✅ (S4) Valida que una tarea que ya está completada no pueda volver a marcarse como completada.

#### DELETE /api/proyectos/:idProyecto/tareas/:idTarea

Elimina una tarea de un proyecto.

**Parámetros (URL):**

- idProyecto (UUID): El ID del proyecto.
- idTarea (UUID): El ID de la tarea.

**Validaciones:**

- ✅ Valida que la tarea (idTarea) exista Y que pertenezca al idProyecto antes de borrarla.
