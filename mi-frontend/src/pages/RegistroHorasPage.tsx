// src/pages/RegistroHorasPage.tsx
import { useEffect, useState } from "react";
import { getRegistrosHoras,crearRegistroHoras,getConsultores,getProyectos } from "../services/api";
import type { RegistroHorasBackend } from "../services/api";
import type { ConsultorBackend } from "../services/api";
import type { ProyectoBackend } from "../services/api";

export default function RegistroHorasPage() {
  const [registros, setRegistros] = useState<RegistroHorasBackend[]>([]);
  const [consultores, setConsultores] = useState<ConsultorBackend[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoBackend[]>([]);

  const [idConsultor, setIdConsultor] = useState("");
  const [idProyecto, setIdProyecto] = useState("");
  const [fecha, setFecha] = useState("");
  const [horas, setHoras] = useState<number>(1);
  const [descripcion, setDescripcion] = useState("");

  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargarRegistros = () => {
    getRegistrosHoras()
      .then((res) => setRegistros(res.registros || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    cargarRegistros();
    getConsultores()
      .then((res) => setConsultores(res.consultores || []))
      .catch((err) => console.error(err));
    getProyectos({ pagina: 1, limite: 100 })
      .then((res) => setProyectos(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    if (!idConsultor || !idProyecto || !fecha || !horas) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      await crearRegistroHoras({
        idConsultor,
        idProyecto,
        fechaRegistro: fecha,
        horasTrabajadas: horas,
        descripcionActividad: descripcion,
      });
      setMensaje("Registro de horas creado correctamente");
      setDescripcion("");
      setHoras(1);
      cargarRegistros();
    } catch (err) {
      console.error(err);
      setError("Error al registrar horas");
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Registro de Horas</h1>

      <form className="page-card d-flex flex-column gap-3" onSubmit={manejarSubmit}>
        <div className="row g-2">
          <div className="col-md-3">
            <label className="form-label">Consultor</label>
            <select
              className="form-select"
              value={idConsultor}
              onChange={(e) => setIdConsultor(e.target.value)}
            >
              <option value="">Seleccione consultor</option>
              {consultores.map((c) => (
                <option key={c.idConsultor} value={c.idConsultor}>
                  {c.nombreConsultor} {c.apellidoConsultor}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Proyecto</label>
            <select
              className="form-select"
              value={idProyecto}
              onChange={(e) => setIdProyecto(e.target.value)}
            >
              <option value="">Seleccione proyecto</option>
              {proyectos.map((p) => (
                <option key={p.idProyecto} value={p.idProyecto}>
                  {p.nombreProyecto}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Fecha</label>
            <input
              type="date"
              className="form-control"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Horas trabajadas</label>
            <input
              type="number"
              className="form-control"
              min={0.5}
              step={0.5}
              value={horas}
              onChange={(e) => setHoras(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label className="form-label">Descripción de la actividad</label>
          <textarea
            className="form-control"
            rows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary align-self-start">
          Registrar horas
        </button>

        {mensaje && <p className="text-success m-0">{mensaje}</p>}
        {error && <p className="text-danger m-0">{error}</p>}
      </form>

      <h2 className="page-subtitle mt-4">Registros recientes</h2>
      <table className="table-prism">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>ID Consultor</th>
            <th>ID Proyecto</th>
            <th>Horas</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((r) => (
            <tr key={r.idRegistroHoras}>
              <td>{new Date(r.fechaRegistro).toLocaleDateString()}</td>
              <td>{r.idConsultor}</td>
              <td>{r.idProyecto}</td>
              <td>{r.horasTrabajadas}</td>
              <td>{r.descripcionActividad}</td>
            </tr>
          ))}
          {registros.length === 0 && (
            <tr>
              <td colSpan={5}>No hay registros aún.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
