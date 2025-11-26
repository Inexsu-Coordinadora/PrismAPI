// src/pages/ProyectosPage.tsx
import { useEffect, useState } from "react";
import { getProyectos } from "../services/api";
import type { ProyectosQueryParams } from "../services/api";
import type { ProyectoBackend } from "../services/api";

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState<ProyectoBackend[]>([]);
  const [nombreFiltro, setNombreFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [limite, setLimite] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarProyectos = (params?: ProyectosQueryParams) => {
    setLoading(true);
    getProyectos(params)
      .then((data) => {
        setProyectos(data.data || []);
        setTotal(data.total || 0);
        setPagina(data.pagina || 1);
        setLimite(data.limite || 10);
      })
      .catch((err) => {
        console.error("Error cargando proyectos:", err);
        setError("No se pudieron cargar los proyectos");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarProyectos({ pagina: 1, limite: 10 });
  }, []);

  const totalPaginas = Math.max(1, Math.ceil(total / limite));

  const aplicarFiltros = () => {
    cargarProyectos({
      pagina: 1,
      limite,
      nombre: nombreFiltro || undefined,
      estado: estadoFiltro || undefined,
    });
  };

  const irAPagina = (nuevaPagina: number) => {
    cargarProyectos({
      pagina: nuevaPagina,
      limite,
      nombre: nombreFiltro || undefined,
      estado: estadoFiltro || undefined,
    });
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Proyectos</h1>

      <div className="page-card d-flex gap-2 flex-wrap">
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: 250 }}
          placeholder="Buscar por nombre..."
          value={nombreFiltro}
          onChange={(e) => setNombreFiltro(e.target.value)}
        />

        <select
          className="form-select"
          style={{ maxWidth: 200 }}
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
          <option value="FINALIZADO">Finalizado</option>
        </select>

        <button className="btn btn-primary" onClick={aplicarFiltros}>
          Aplicar filtros
        </button>
      </div>

      {loading && <p>Cargando proyectos...</p>}
      {error && <p className="text-danger">{error}</p>}

      <table className="table-prism">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Fecha inicio</th>
            <th>Fecha fin</th>
            <th>Estado</th>
            <th>ID Cliente</th>
          </tr>
        </thead>
        <tbody>
          {proyectos.map((p) => (
            <tr key={p.idProyecto}>
              <td>{p.nombreProyecto}</td>
              <td>{p.tipoProyecto ?? "-"}</td>
              <td>
                {p.fechaInicioProyecto
                  ? new Date(p.fechaInicioProyecto).toLocaleDateString()
                  : "-"}
              </td>
              <td>
                {p.fechaFinProyecto
                  ? new Date(p.fechaFinProyecto).toLocaleDateString()
                  : "-"}
              </td>
              <td>{p.estadoProyecto}</td>
              <td>{p.idCliente ?? "-"}</td>
            </tr>
          ))}
          {proyectos.length === 0 && !loading && (
            <tr>
              <td colSpan={6}>No hay proyectos para mostrar.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Paginación simple */}
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
