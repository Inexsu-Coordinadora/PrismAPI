Hola Cursor. Estoy trabajando en un proyecto backend con Node.js, Fastify, TypeScript y Zod. Ya tengo implementada la generación de documentación con Swagger (OpenAPI).

Necesito tu ayuda para agrupar 4 endpoints específicos bajo un mismo Tag en Swagger llamado "Demo Presentación PrismaAPI", para facilitar una demostración en vivo.

Por favor, busca los archivos de rutas ("enrutadores") correspondientes a los siguientes endpoints y modifica la configuración del esquema (`schema`) de cada ruta para agregar o actualizar la propiedad `tags`.

Estos son los 4 endpoints que necesito etiquetar:

1. Servicio de Asignación (S1):
   - Método: POST
   - Ruta: /api/asignaciones (o la ruta definida en `asignacionConsultorProyectoEnrutador.ts`)
   - Tag deseado: tags: ['DEMO PRESENTACIÓN', 'Asignaciones']

2. Servicio de Gestión de Tareas (S4):
   - Método: POST
   - Ruta: /api/proyectos/:idProyecto/tareas (o la ruta definida en `gestionTareasEnrutador.ts`)
   - Tag deseado: tags: ['DEMO PRESENTACIÓN', 'Gestión Tareas']

3. Servicio de Registro de Horas (S3):
   - Método: POST
   - Ruta: /api/registros-horas (o la ruta definida en `registroHorasEnrutador.ts`)
   - Tag deseado: tags: ['DEMO PRESENTACIÓN', 'Registro Horas']

4. Servicio de Consulta (S2):
   - Método: GET
   - Ruta: /api/clientes/:idCliente/proyectos (o la ruta definida en `consultaProyectosEnrutador.ts`)
   - Tag deseado: tags: ['DEMO PRESENTACIÓN', 'Consulta Proyectos']

Instrucciones técnicas:
- No borres los tags existentes si los hay, solo añade 'DEMO PRESENTACIÓN' al inicio del array.
- Si la ruta está definida solo como `app.post(url, handler)`, por favor refactorízala para incluir el objeto de opciones con el esquema: `app.post(url, { schema: { tags: [...] } }, handler)`.
- Asegúrate de mantener la validación Zod si ya está implementada.