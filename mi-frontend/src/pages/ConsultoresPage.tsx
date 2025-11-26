// src/pages/ConsultoresPage.tsx
import { useEffect, useState } from "react";
import { getConsultores } from "../services/api";
import type { ConsultorBackend } from "../services/api";

export default function ConsultoresPage() {
  const [consultores, setConsultores] = useState<ConsultorBackend[]>([]);
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const [limite] = useState(10); // tamaño de página
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Llamada simple, sin query params
    getConsultores()
      .then((data) => {
        // Usa la misma propiedad que ya tenías antes
        setConsultores(data.consultores || []);
        setPagina(1); // siempre arrancamos en página 1
      })
      .catch((err) => {
        console.error("Error cargando consultores:", err);
        setError("No se pudieron cargar los consultores");
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔍 Filtrado en frontend
  const filtrados = consultores.filter((c) => {
    const term = filtro.toLowerCase().trim();
    if (!term) return true;

    return (
      c.nombreConsultor.toLowerCase().includes(term) ||
      c.especialidadConsultor.toLowerCase().includes(term) ||
      c.disponibilidadConsultor.toLowerCase().includes(term) ||
      c.emailConsultor.toLowerCase().includes(term) 
    );
  });

  // 📄 Paginación en frontend sobre la lista filtrada
  const total = filtrados.length;
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  const indiceInicio = (pagina - 1) * limite;
  const paginaActual = filtrados.slice(indiceInicio, indiceInicio + limite);

  const irAPagina = (nuevaPagina: number) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
    setPagina(nuevaPagina);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Consultores</h1>

      {/* Filtro */}
      <div className="page-card d-flex gap-2 flex-wrap">
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: 300 }}
          placeholder="Buscar por nombre, especialidad o email..."
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPagina(1); // al cambiar filtro, volvemos a la primera página
          }}
        />

        {/* Si quisieras hacer configurable el tamaño de página */}
        {/* 
        <select
          className="form-select"
          style={{ maxWidth: 120 }}
          value={limite}
          onChange={(e) => {
            setLimite(Number(e.target.value));
            setPagina(1);
          }}
        >
          <option value={5}>5 por página</option>
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
        </select>
        */}
      </div>

      {loading && <p>Cargando consultores...</p>}
      {error && <p className="text-danger">{error}</p>}

      <table className="table-prism">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Especialidad</th>
            <th>Disponibilidad</th>
            <th>Email</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {paginaActual.map((c) => (
            <tr key={c.idConsultor}>
              <td>{`${c.nombreConsultor}`}</td>
              <td>{c.especialidadConsultor}</td>
              <td>{c.disponibilidadConsultor}</td>
              <td>{c.emailConsultor}</td>
              <td>{c.telefonoConsultor}</td>
            </tr>
          ))}

          {paginaActual.length === 0 && !loading && (
            <tr>
              <td colSpan={5}>No hay consultores para mostrar.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Paginación simple (mismo estilo que ProyectosPage) */}
      <div className="d-flex justify-content-end align-items-center gap-2 mt-2">
        <button
          className="btn btn-sm btn-secondary"
          disabled={pagina <= 1}
          onClick={() => irAPagina(pagina - 1)}
        >
          Anterior
        </button>
        <span>
          Página {pagina} de {totalPaginas}
        </span>
        <button
          className="btn btn-sm btn-secondary"
          disabled={pagina >= totalPaginas}
          onClick={() => irAPagina(pagina + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}


/**Qué hace cada parte (en cristiano):
interface Consultor → le dice a TypeScript qué campos existen, para no equivocarnos con nombres mágicos.
useState:
consultores → la lista que viene del backend.
filtro → texto que escribe el usuario.
seleccionado → guarda el consultor al que se le hizo click.
useEffect:
Se ejecuta una vez cuando se monta el componente.
Llama a getConsultores() → GET /consultores.
De la respuesta toma data.consultores y lo mete a setConsultores.
consultoresFiltrados:
Solo aplica filtro en la lista en memoria (no toca el backend).
<table>:
Muestra los consultores filtrados.
Cada fila tiene onClick={() => setSeleccionado(c)}.
Card de detalle:
Solo aparece si seleccionado !== null.
Muestra todos los campos clave del consultor. */