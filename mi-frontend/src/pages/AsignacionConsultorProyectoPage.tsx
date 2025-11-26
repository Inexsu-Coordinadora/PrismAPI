// src/pages/AsignacionConsultorProyectoPage.tsx
import { useEffect, useState } from "react";
import { getConsultores,getProyectos,crearAsignacionConsultorProyecto,getAsignacionesPorProyecto } from "../services/api";
import type { ConsultorBackend } from "../services/api";
import type { ProyectoBackend } from "../services/api";
import type { AsignacionConsultorProyectoBackend } from "../services/api";

export default function AsignacionConsultorProyectoPage() {
  const [consultores, setConsultores] = useState<ConsultorBackend[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoBackend[]>([]);
  const [asignaciones, setAsignaciones] = useState<
    AsignacionConsultorProyectoBackend[]
  >([]);

  const [idConsultor, setIdConsultor] = useState("");
  const [idProyecto, setIdProyecto] = useState("");
  const [porcentaje, setPorcentaje] = useState<number>(100);

  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getConsultores()
      .then((res) => setConsultores(res.consultores || []))
      .catch((err) => console.error(err));

    getProyectos({ pagina: 1, limite: 100 })
      .then((res) => setProyectos(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  const cargarAsignacionesProyecto = (id: string) => {
    if (!id) {
      setAsignaciones([]);
      return;
    }
    getAsignacionesPorProyecto(id)
      .then((res) => setAsignaciones(res.asignaciones || []))
      .catch((err) => console.error(err));
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    if (!idConsultor || !idProyecto) {
      setError("Debes seleccionar consultor y proyecto");
      return;
    }

    try {
      const res = await crearAsignacionConsultorProyecto({
        idConsultor,
        idProyecto,
        porcentajeDedicacion: porcentaje,
      });
      setMensaje(res.mensaje || "Asignación creada correctamente");
      cargarAsignacionesProyecto(idProyecto);
    } catch (err) {
      console.error(err);
      setError("Error al crear la asignación");
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Asignar Consultor a Proyecto</h1>

      <form className="page-card d-flex flex-column gap-3" onSubmit={manejarSubmit}>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label">Consultor</label>
            <select
              className="form-select"
              value={idConsultor}
              onChange={(e) => setIdConsultor(e.target.value)}
            >
              <option value="">Seleccione un consultor</option>
              {consultores.map((c) => (
                <option key={c.idConsultor} value={c.idConsultor}>
                  {c.nombreConsultor} {c.apellidoConsultor}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Proyecto</label>
            <select
              className="form-select"
              value={idProyecto}
              onChange={(e) => {
                setIdProyecto(e.target.value);
                cargarAsignacionesProyecto(e.target.value);
              }}
            >
              <option value="">Seleccione un proyecto</option>
              {proyectos.map((p) => (
                <option key={p.idProyecto} value={p.idProyecto}>
                  {p.nombreProyecto}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">% dedicación</label>
            <input
              type="number"
              min={1}
              max={100}
              className="form-control"
              value={porcentaje}
              onChange={(e) => setPorcentaje(Number(e.target.value))}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary align-self-start">
          Asignar consultor
        </button>

        {mensaje && <p className="text-success m-0">{mensaje}</p>}
        {error && <p className="text-danger m-0">{error}</p>}
      </form>

      <h2 className="page-subtitle mt-4">Asignaciones del proyecto</h2>
      <table className="table-prism">
        <thead>
          <tr>
            <th>ID Asignación</th>
            <th>ID Consultor</th>
            <th>ID Proyecto</th>
            <th>% dedicación</th>
          </tr>
        </thead>
        <tbody>
          {asignaciones.map((a) => (
            <tr key={a.idAsignacion}>
              <td>{a.idAsignacion}</td>
              <td>{a.idConsultor}</td>
              <td>{a.idProyecto}</td>
              <td>{a.porcentajeDedicacion ?? "-"}</td>
            </tr>
          ))}
          {asignaciones.length === 0 && (
            <tr>
              <td colSpan={4}>No hay asignaciones para este proyecto.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
