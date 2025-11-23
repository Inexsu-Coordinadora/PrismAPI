# ✨ PrismAPI 🌈⃤

PrismAPI es una API RESTful que sirve como núcleo para una aplicación de gestión de proyectos. A diferencia de las listas de tareas planas, el concepto central de PrismAPI es la organización por 'capas', permitiendo al usuario definir y administrar las distintas fases o componentes de un proyecto, desde la idea inicial hasta su finalización.

---

## Tabla de Contenidos
* [Documentación del Proyecto](#-documentación-del-proyecto)
* [Tecnologías](#tecnologías)
* [Herramientas de Desarrollo](#herramientas-de-desarrollo)
* [Prerrequisitos](#prerrequisitos)
* [Instalación](#instalación)
* [Variables de Entorno](#variables-de-entorno)
* [Ejecución](#ejecución)
* [Migraciones](#migraciones)
* [Probando la API con Bruno](#probando-la-api-con-bruno)
* [Pruebas y Calidad de Código](#-pruebas-y-calidad-de-código)

---
## 📚 Documentación del Proyecto
Este proyecto se divide en tres documentos principales para facilitar su revisión:

* **1. README.md (Este archivo):** Contiene las instrucciones de instalación, configuración y ejecución del proyecto.
* **2. Documentación de API:** Contiene el manual de referencia completo de la API, con todos los endpoints, validaciones y ejemplos de la E2.
    * ➡️ **[Ver Documentación de API (E2)](./documentacion/API_Endpoints_E2.md)**
* **3. Informe de Implementación:** Explica las decisiones de arquitectura, el flujo de trabajo (Git) y los retos técnicos de la implementación.
    * ➡️ **[Ver Informe de Implementación](./documentacion/Informe_Implementacion.md)**
---

## 💻 Tecnologías
Lista de las tecnologías, frameworks y librerías principales que usa el proyecto.

* **Plataforma:** Node.js 
* **Lenguaje:** TypeScript 
* **Framework Backend:** Fastify 
* **Base de Datos:** PostgreSQL 
* **Manejo de BD:** node-postgres (pg)
* **Validación de Datos:** Zod
* **Gestión de Entorno:** Dotenv 
* **Generación de IDs:** UUID
* **Pruebas y Calidad:** Jest, Supertest
---

## 🛠️ Herramientas de Desarrollo 
Software utilizado para el desarrollo, pruebas y administración de la API. 
* **Servidor de Desarrollo:** ts-node-dev (para recarga automática) 
* **Cliente de API:** Bruno (para probar los endpoints) 
* **Gestor de Base de Datos:** pgAdmin (para administrar la base de datos PostgreSQL)
---

## ⚙️ Prerrequisitos
Lo que necesitas tener instalado en tu máquina ANTES de empezar.

### Requerimientos del Sistema
* **Node.js:** (Se recomienda v18.x o superior)
* **npm:** (Generalmente se instala con Node.js)
* **PostgreSQL:** Una instancia de base de datos activa para conectarse.

### Herramientas Recomendadas
* **Git:** Para clonar el repositorio.
* **pgAdmin:** Para administrar la base de datos y ejecutar las migraciones manuales.
* **Bruno:** Para probar los endpoints de la API.
* **VSCode:** (O tu editor de código preferido).
---

## 🚀 Instalación
Pasos claros para instalar el proyecto.

1.  Clona el repositorio:
    ```bash
    git clone git@github.com:Inexsu-Coordinadora/PrismAPI.git
    ```

2.  Navega a la carpeta del proyecto:
    ```bash
    cd PrismAPI
    ```
3.  Instala las dependencias:
    ```bash
    npm install

---

## 🔑 Variables de Entorno
Explica cómo configurar las variables de entorno.

1.  En la raíz del proyecto, crea un archivo llamado `.env`.
2.  Copia y pega la siguiente estructura dentro de tu archivo `.env`.
3.  Completa los valores que están vacíos (`PGUSER`, `PGPASSWORD`) con tus propias credenciales de PostgreSQL.

    ```bash
    # Configuración del servidor
    # Puedes cambiarlo si el puerto 3001 ya está en uso en tu PC.
    PUERTO=3001
    
    # Configuración de la Base de Datos PostgreSQL
    PGHOST=localhost
    
    # Este es el puerto estándar de PostgreSQL.
    # Cámbialo solo si tu base de datos corre en un puerto diferente.
    PGPORT=5432 
    
    # Debes completar estas credenciales
    PGUSER=[TU_USUARIO_POSTGRES]
    PGPASSWORD=[TU_PASSWORD_POSTGRES]
    PGDBNAME=prismapi_db
    ```

    **Nota:** Asegúrate de que `PGDBNAME` coincida con el nombre de la base de datos que creaste en pgAdmin. Si usaste un nombre diferente a `prismapi_db`, deberás actualizarlo aquí.
---

## 🏃 Ejecución
Cómo correr el proyecto.

* **Modo Desarrollo (con hot-reload):**
    ```bash
    npm run dev
    ```

* **Modo Producción:**
    1.  Compila el proyecto (de TypeScript a JavaScript):
        ```bash
        npm run build
        ```
    2.  Ejecuta el código compilado:
        ```bash
        npm start
     
---

## 🔄 Migraciones
Este proyecto no utiliza un ORM para migraciones automáticas. La estructura de la base de datos debe crearse manualmente ejecutando los scripts SQL proporcionados.

**Pasos para configurar la base de datos:**

1.  Asegúrate de haber creado tu base de datos en PostgreSQL (ej. `prismapi_db`) y de que los datos de conexión en tu archivo `.env`coincidan.
2.  Abre tu cliente de base de datos (como **pgAdmin** o **DBeaver**) y conéctate a tu base de datos.
3.  Navega a la carpeta `/migrations` en la raíz de este proyecto.
4.  Encontrarás archivos SQL (ej. `001-tabla-proyectos.sql`, `002-tabla-clientes.sql`, etc.).
5.  Abre y ejecuta estos archivos **en el orden numérico** para crear las tablas correctamente. Deberás copiar el contenido de cada archivo y pegarlo en la herramienta de consulta (Query Tool) de pgAdmin.

* `001-tabla-proyectos.sql`` (Ejecutar primero)
* `002-tabla-clientes.sql`` (Ejecutar segundo)
* ...y así sucesivamente.

Una vez ejecutados todos los scripts en orden, tu base de datos estará lista para que la aplicación se conecte a ella.

## 🐶 Probando la API con Bruno
Para facilitar las pruebas de los endpoints, este repositorio incluye una colección de Bruno lista para importar.

**❕[También puedes ver una demostración en video de cómo probar los endpoints de nuestra primera entrega en YouTube](https://youtu.be/zojR3-eEUBs)**

1.  Abre la aplicación de escritorio de **Bruno**.
2.  Haz clic en "Open Collection" (Abrir Colección).
3.  Navega hasta la carpeta de este proyecto y selecciona la carpeta `Gestor Proyectos`.
4.  Bruno importará la colección, la cual está organizada en dos carpetas principales:
    * **`CRUDS Entidades (E1)`:** Contiene los endpoints básicos de la Entrega 1, agrupados por entidad:.
        * `Proyectos`
        * `Clientes`
        * `Consultores`
        * `Tareas`
    * **`Servicios (E2)`:** Contiene los nuevos endpoints de la Entrega 2, organizados por servicio.
        * `S1: Asignación ProyectoConsultor`
        * `S2: Consulta Proyectos`
        * `S3: Registro Horas`
        * `S4: Gestión Tareas`

### Configuración del Entorno en Bruno
Para evitar tener que escribir `http://localhost:3001/api` en cada petición:

1.  Dentro de la colección importada en Bruno, ve a la pestaña "..." y selecciona "Open in Editor".
2.  Ve a la pestaña **"Env"** (Entorno) de la colección.
3.  Añade una variable de entorno. Por ejemplo:
    * `baseUrl`: `http://localhost:{{PUERTO}}/api`
4.  Asegúrate de tener una variable `PUERTO` definida en Bruno (o simplemente pon `http://localhost:3001` si lo prefieres).
5.  Ahora, en tus peticiones, puedes usar `{{baseUrl}}/proyectos` en lugar de la URL completa.

---

## 🧪 Pruebas y Calidad de Código
Para garantizar la estabilidad y el correcto funcionamiento de la lógica de negocio, el proyecto cuenta con una suite automatizada de pruebas utilizando **Jest** y **Supertest**.

### Ejecución de Pruebas
Puedes ejecutar los siguientes comandos en tu terminal:

| Comando | Descripción |
| :--- | :--- |
| `npm run test` | Ejecuta **todas** las pruebas (Unitarias + Integración). |
| `npm run test:unit` | Ejecuta solo las pruebas **unitarias** (Lógica aislada de servicios). |
| `npm run test:integration` | Ejecuta solo las pruebas de **integración** (Endpoints de API). |
| `npm run test:coverage` | Ejecuta las pruebas y genera el **reporte de cobertura** detallado. |

### 📊 Reporte de Cobertura (Entrega 3)
El objetivo de esta entrega es asegurar la calidad del código mediante métricas objetivas.

**Cobertura Global Alcanzada:**
![Informe de cobertura de los tests](./documentacion/images/informe_cobertura_tests.png)

> Actualmente se cuenta con una cobertura de sentencias superior al **60%**, cubriendo los caminos críticos de éxito y error.

Para ver el reporte detallado HTML:
1. Ejecuta `npm run test:coverage`.
2. Busca en tu carpeta del proyecto: `coverage/lcov-report/index.html`
3. Haz clic derecho en el archivo y selecciona "Open with Live Server" (si usas VSCode) o arrástralo a tu navegador favorito. 
![reporte detallado HTML ](./documentacion/images/informe_cobertura_tests_HTML.png)

### 🎥 Demostración: Ejecución de Pruebas y Cobertura (Entrega 3)

En el siguiente video se evidencia el cumplimiento de los objetivos de calidad de la Entrega 3.

**Contenido del video:**
1. **Estructura de Pruebas:** Breve explicación de la organización de la carpeta `tests/`, diferenciando el alcance de las pruebas unitarias (lógica de negocio con Mocks) y las de integración (endpoints con Supertest).
2. **Ejecución en vivo:** Se corre el comando `npm run test:coverage`, mostrando la ejecución exitosa de las suites de pruebas unitarias y de integración.
3. **Manejo de Errores:** Se demuestra cómo el sistema intercepta errores (400, 404, 409) y responde con el formato estandarizado.
4. **Resultados:** Se visualiza el reporte de cobertura final en la terminal, confirmando que se supera el **50%** requerido en las métricas de sentencias y líneas.

➡️ **[Haz clic aquí para ver el video demostrativo](https://youtu.be/MahzUdmFmbs)**