// src/pages/ConsultaProyectoPage.tsx
import { useEffect, useState } from "react";
import { getClientes,getProyectosPorCliente } from "../services/api";
import type { ClienteBackend } from "../services/api";
import type { ProyectoBackend } from "../services/api";

export default function ConsultaProyectoPage() {
  const [clientes, setClientes] = useState<ClienteBackend[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoBackend[]>([]);
  const [idCliente, setIdCliente] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClientes()
      .then((res) => setClientes(res.clientes || []))
      .catch((err) => console.error(err));
  }, []);

  const manejarCambioCliente = async (id: string) => {
    setIdCliente(id);
    setProyectos([]);
    if (!id) return;

    setLoading(true);
    try {
      const res = await getProyectosPorCliente(id);
      setProyectos(res.proyectos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Consulta de Proyectos por Cliente</h1>

      <div className="page-card">
        <label className="form-label">Cliente</label>
        <select
          className="form-select"
          value={idCliente}
          onChange={(e) => manejarCambioCliente(e.target.value)}
        >
          <option value="">Seleccione un cliente</option>
          {clientes.map((c) => (
            <option key={c.idCliente} value={c.idCliente}>
              {c.nombreCliente} {c.apellidoCliente}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Cargando proyectos...</p>}

      <table className="table-prism">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Fecha inicio</th>
            <th>Fecha fin</th>
          </tr>
        </thead>
        <tbody>
          {proyectos.map((p) => (
            <tr key={p.idProyecto}>
              <td>{p.nombreProyecto}</td>
              <td>{p.tipoProyecto ?? "-"}</td>
              <td>{p.estadoProyecto}</td>
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
            </tr>
          ))}
          {proyectos.length === 0 && !loading && (
            <tr>
              <td colSpan={5}>No hay proyectos para este cliente.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
