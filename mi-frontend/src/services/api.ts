// src/services/api.ts

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// ---- Helper genérico ----
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error HTTP ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ---- Helpers REST ----
export function apiGet<T>(path: string) {
  return request<T>(path);
}

export function apiPost<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiPut<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function apiDelete<T>(path: string) {
  return request<T>(path, {
    method: "DELETE",
  });
}

/* =========================================================
   TIPOS Y FUNCIONES POR ENTIDAD / SERVICIO
   ========================================================= */

// ---------- CONSULTORES ----------
export interface ConsultorBackend {
  idConsultor: string;
  nombreConsultor: string;
  especialidadConsultor: string;
  disponibilidadConsultor: string;
  emailConsultor: string;
  telefonoConsultor: string;
}

interface ConsultoresResponse {
  mensaje: string;
  consultores: ConsultorBackend[];
  totalConsultores: number;
}

export function getConsultores(limite?: number) {
  const query = limite ? `?limite=${limite}` : "";
  return apiGet<ConsultoresResponse>(`/consultores${query}`);
}

export type CrearConsultorInput = Omit<ConsultorBackend, "idConsultor">;

export function crearConsultor(data: CrearConsultorInput) {
  return apiPost<{ mensaje: string; idConsultor: string }>(
    "/consultores",
    data
  );
}

// ---------- CLIENTES ----------
export interface ClienteBackend {
  idCliente: string;
  nombreCliente: string;
  apellidoCliente: string;
  documentoCliente: number;
  emailCliente: string;
  telefonoCliente: string;
}

interface ClientesResponse {
  mensaje: string;
  clientes: ClienteBackend[];
  total: number;
}

export function getClientes() {
  return apiGet<ClientesResponse>("/clientes");
}

// ---------- PROYECTOS ----------
export interface ProyectoBackend {
  idProyecto: string;
  nombreProyecto: string;
  tipoProyecto?: string | null;
  fechaInicioProyecto?: string | null;
  fechaFinProyecto?: string | null;
  estadoProyecto: string;
  idCliente?: string | null;
}

export interface ProyectosQueryParams {
  nombre?: string;
  estado?: string;
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
  pagina?: number;
  limite?: number;
  ordenarPor?: string;
  ordenarOrden?: "ASC" | "DESC";
}

interface ProyectosResponse {
  mensaje: string;
  total: number;
  pagina: number;
  limite: number;
  data: ProyectoBackend[];
}

export function getProyectos(params?: ProyectosQueryParams) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
  }
  const qs = query.toString();
  const path = qs ? `/proyectos?${qs}` : "/proyectos";
  return apiGet<ProyectosResponse>(path);
}

// ---------- TAREAS ----------
export interface TareaBackend {
  idTarea: string;
  tituloTarea: string;
  descripcionTarea?: string;
  estadoTarea: string;
  prioridadTarea?: string;
  fechaLimite?: string | null;
  idProyecto: string;
  idConsultor?: string | null;
}

interface TareasResponse {
  mensaje: string;
  tareas: TareaBackend[];
  total: number;
}

export function getTareas(limite?: number) {
  const query = limite ? `?limite=${limite}` : "";
  return apiGet<TareasResponse>(`/tareas${query}`);
}

// ---------- SERVICIO: Asignación Consultor ↔ Proyecto ----------
export interface AsignacionConsultorProyectoBackend {
  idAsignacion: string;
  idConsultor: string;
  idProyecto: string;
  porcentajeDedicacion?: number;
}

export interface CrearAsignacionConsultorProyectoInput {
  idConsultor: string;
  idProyecto: string;
  porcentajeDedicacion?: number;
}

export function crearAsignacionConsultorProyecto(
  data: CrearAsignacionConsultorProyectoInput
) {
  return apiPost<{
    mensaje: string;
    asignacion: AsignacionConsultorProyectoBackend;
  }>("/asignaciones", data);
}

export function getAsignacionesPorProyecto(idProyecto: string) {
  return apiGet<{
    mensaje: string;
    asignaciones: AsignacionConsultorProyectoBackend[];
  }>(`/asignaciones/proyecto/${idProyecto}`);
}

// ---------- SERVICIO: Registro de Horas ----------
export interface RegistroHorasBackend {
  idRegistroHoras: string;
  idConsultor: string;
  idProyecto: string;
  fechaRegistro: string; // viene como string ISO del backend
  horasTrabajadas: number;
  descripcionActividad: string;
}

interface ListarRegistroHorasResponse {
  mensaje: string;
  registros: RegistroHorasBackend[];
  totalRegistros: number;
}

export function getRegistrosHoras(params?: {
  idConsultor?: string;
  idProyecto?: string;
}) {
  const query = new URLSearchParams();
  if (params?.idConsultor) query.append("idConsultor", params.idConsultor);
  if (params?.idProyecto) query.append("idProyecto", params.idProyecto);

  const qs = query.toString();
  const path = qs ? `/registrar-horas?${qs}` : "/registrar-horas";
  return apiGet<ListarRegistroHorasResponse>(path);
}

export type CrearRegistroHorasInput = Omit<
  RegistroHorasBackend,
  "idRegistroHoras"
>;

export function crearRegistroHoras(data: CrearRegistroHorasInput) {
  return apiPost<{ mensaje: string; registro: RegistroHorasBackend }>(
    "/registrar-horas",
    data
  );
}

export async function postRegistroHoras(params: {
  idRegistroHoras: string;
  idConsultor: string;
  idProyecto: string;
  fechaRegistro: string; // viene como string ISO del backend
  horasTrabajadas: number;
  descripcionActividad: string;
}) {
  const res = await fetch(`${BASE_URL}/registro-horas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    // Capturamos el mensaje del backend
    const body = await res.json().catch(() => null);
    const mensaje = body?.mensaje || "Error registrando horas";
    throw new Error(mensaje);
  }

  return res.json();
}

// ---------- SERVICIO: Consulta Proyecto (Proyectos por Cliente) ----------
export function getProyectosPorCliente(idCliente: string) {
  return apiGet<{
    mensaje: string;
    proyectos: ProyectoBackend[];
  }>(`/clientes/${idCliente}/proyectos`);
}

// ---------- SERVICIO: Gestión de Tareas por Proyecto ----------
export function getTareasPorProyecto(idProyecto: string) {
  return apiGet<{
    mensaje: string;
    tareas: TareaBackend[];
  }>(`/proyectos/${idProyecto}/tareas`);
}

export function crearTareaEnProyecto(
  idProyecto: string,
  data: Omit<TareaBackend, "idTarea" | "idProyecto">
) {
  return apiPost<{ mensaje: string; tarea: TareaBackend }>(
    `/proyectos/${idProyecto}/tareas`,
    data
  );
}




/**Lo que hace este archivo:
BASE_URL → dice a qué backend se conecta el frontend.
request → envuelve fetch:
construye la URL completa,
agrega headers,
si hay error http, lanza excepción.
getConsultores → función cómoda que el componente usará; internamente hace GET /consultores. */

/**🧠 ¿Qué hace esto?
BASE_URL: la URL base de tu API (fastify).
request(...): función genérica que hace fetch + valida si la respuesta fue OK.
apiGet y apiPost: helpers para hacer llamadas limpias desde las páginas.
Más adelante solo cambiamos aquí si tu backend cambia. */
/**💡 Aquí lo importante:
Cada helper está alineado con las rutas reales que me diste.
getProyectos sabe que la respuesta viene como { data: [...] } y no como proyectos.
Tendremos menos código repetido en las páginas. */