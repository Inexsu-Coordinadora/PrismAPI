**Contexto del Proyecto:**

  * **Framework:** Fastify (TypeScript).
  * **Librerías instaladas:** `@fastify/swagger` y `@fastify/swagger-ui`.
  * **Estado actual:** Se ha configurado el registro básico de los plugins en `app.ts`, pero se necesita refactorizar los esquemas para no ensuciar el archivo principal y documentar las rutas.

**Instrucciones de la Tarea:**

Necesito que realices los siguientes pasos para organizar la documentación:

1.  **Crear estructura de carpetas:**

      * Crea la ruta: `src/docs/schemas/entidades/`
      * Crea la ruta: `src/docs/schemas/servicios/`
      * Crea un archivo índice principal en: `src/docs/schemas/index.ts`

2.  **Definir el Esquema "Tarea":**

      * Crea el archivo `src/docs/schemas/entidades/tareaSchema.ts`.
      * Debe representar la entidad `ITarea` (ver abajo).
      * **IMPORTANTE:** Usa `as const` al final del objeto del esquema para evitar conflictos de tipado con Fastify/TypeScript (error "No overload matches").

    *Referencia de la Entidad Tarea:*

    ```typescript
    export type EstadoTarea = "pendiente" | "en-progreso" | "bloqueada" | "completada";
    // Propiedades: idTarea (uuid), tituloTarea (string), descripcionTarea (string?), estadoTarea (enum), idProyecto (uuid?), idConsultorAsignado (uuid?), fechaLimiteTarea (date?)
    ```

3.  **Configurar el "Barrel File" (Índice):**

      * En `src/docs/schemas/index.ts`, importa `TareaSchema` y exporta una constante `allSchemas` que agrupe todos los esquemas usando el operador spread (`...`).

4.  **Refactorizar `app.ts`:**

      * Importa `allSchemas` desde `src/docs/schemas`.
      * En la configuración de `app.register(fastifySwagger, ...)`, asigna `components: { schemas: allSchemas }`.

5.  **Documentar Rutas (Ejemplo con Tareas):**

      * Ve al archivo de rutas de tareas (ej: `tareasEnrutador.ts`).
      * Modifica la ruta `GET /` (listar tareas).
      * Agrega el objeto `schema` con:
          * `tags: ['Tareas']` (Para agruparlo visualmente en Swagger).
          * `summary`: "Listar todas las tareas".
          * `response`: Definir el código 200 devolviendo un array de referencias al esquema `Tarea` (`$ref: '#/components/schemas/Tarea'`).
      * Para el resto de las rutas, agrega al menos la propiedad `tags: ['Tareas']` para que dejen de aparecer en "default".

**Restricciones Técnicas:**

  * Mantén el código limpio y modular.
  * Asegúrate de manejar los tipos de TypeScript correctamente.
  * La URL del servidor en Swagger debe coincidir con el puerto del `.env` o la configuración global.

-----

### ¿Cómo usar esto?

Simplemente abre tu editor con IA (o el chat que uses) y dile:

> *"Hola, necesito ayuda para terminar la implementación de Swagger en mi proyecto. Aquí te dejo el contexto técnico y los pasos exactos que definimos:"*

(Y pegas el bloque de arriba).

¡Con esto el agente entenderá la arquitectura de carpetas y el problema del `as const` inmediatamente\!