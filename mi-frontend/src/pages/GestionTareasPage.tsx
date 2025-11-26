// src/pages/GestionTareasPage.tsx
import { useEffect, useState } from "react";
import { getProyectos,getTareasPorProyecto,crearTareaEnProyecto } from "../services/api";
import type { ProyectoBackend } from "../services/api";
import type { TareaBackend } from "../services/api";

export default function GestionTareasPage() {
  const [proyectos, setProyectos] = useState<ProyectoBackend[]>([]);
  const [tareas, setTareas] = useState<TareaBackend[]>([]);
  const [idProyecto, setIdProyecto] = useState("");

  const [titulo, setTitulo] = useState("");
  const [estado, setEstado] = useState("PENDIENTE");
  const [prioridad, setPrioridad] = useState("MEDIA");

  useEffect(() => {
    getProyectos({ pagina: 1, limite: 100 })
      .then((res) => setProyectos(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  const cargarTareasProyecto = (id: string) => {
    if (!id) {
      setTareas([]);
      return;
    }
    getTareasPorProyecto(id)
      .then((res) => setTareas(res.tareas || []))
      .catch((err) => console.error(err));
  };

  const manejarCambioProyecto = (id: string) => {
    setIdProyecto(id);
    cargarTareasProyecto(id);
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idProyecto || !titulo) return;

    try {
      await crearTareaEnProyecto(idProyecto, {
        tituloTarea: titulo,
        estadoTarea: estado,
        prioridadTarea: prioridad,
      });
      setTitulo("");
      cargarTareasProyecto(idProyecto);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Gestión de Tareas por Proyecto</h1>

      <div className="page-card d-flex flex-column gap-3">
        <div>
          <label className="form-label">Proyecto</label>
          <select
            className="form-select"
            value={idProyecto}
            onChange={(e) => manejarCambioProyecto(e.target.value)}
          >
            <option value="">Seleccione un proyecto</option>
            {proyectos.map((p) => (
              <option key={p.idProyecto} value={p.idProyecto}>
                {p.nombreProyecto}
              </option>
            ))}
          </select>
        </div>

        <form className="row g-2" onSubmit={manejarSubmit}>
          <div className="col-md-6">
            <label className="form-label">Título de la tarea</label>
            <input
              className="form-control"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Levantar API de autenticación"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Estado</label>
            <select
              className="form-select"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROGRESO">En progreso</option>
              <option value="COMPLETADA">Completada</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Prioridad</label>
            <select
              className="form-select"
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value)}
            >
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
            </select>
          </div>

          <div className="col-12 mt-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!idProyecto}
            >
              Crear tarea
            </button>
          </div>
        </form>
      </div>

      <h2 className="page-subtitle mt-4">Tareas del proyecto</h2>
      <table className="table-prism">
        <thead>
          <tr>
            <th>Título</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>ID Tarea</th>
          </tr>
        </thead>
        <tbody>
          {tareas.map((t) => (
            <tr key={t.idTarea}>
              <td>{t.tituloTarea}</td>
              <td>{t.estadoTarea}</td>
              <td>{t.prioridadTarea ?? "-"}</td>
              <td>{t.idTarea}</td>
            </tr>
          ))}
          {tareas.length === 0 && (
            <tr>
              <td colSpan={4}>No hay tareas para este proyecto.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
