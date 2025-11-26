// src/pages/TareasPage.tsx
import { useEffect, useState } from "react";
import { getTareas } from "../services/api";
import type { TareaBackend } from "../services/api";

export default function TareasPage() {
  const [tareas, setTareas] = useState<TareaBackend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getTareas()
      .then((data) => {
        setTareas(data.tareas || []);
      })
      .catch((err) => {
        console.error("Error cargando tareas:", err);
        setError("No se pudieron cargar las tareas");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">Tareas</h1>

      {loading && <p>Cargando tareas...</p>}
      {error && <p className="text-danger">{error}</p>}

      <table className="table-prism">
        <thead>
          <tr>
            <th>Título</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Fecha límite</th>
            <th>ID Proyecto</th>
          </tr>
        </thead>
        <tbody>
          {tareas.map((t) => (
            <tr key={t.idTarea}>
              <td>{t.tituloTarea}</td>
              <td>{t.estadoTarea}</td>
              <td>{t.prioridadTarea ?? "-"}</td>
              <td>
                {t.fechaLimite
                  ? new Date(t.fechaLimite).toLocaleDateString()
                  : "-"}
              </td>
              <td>{t.idProyecto}</td>
            </tr>
          ))}
          {tareas.length === 0 && !loading && (
            <tr>
              <td colSpan={5}>No hay tareas para mostrar.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

