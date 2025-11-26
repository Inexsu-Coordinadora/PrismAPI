// src/pages/ClientePage.tsx
import { useEffect, useState } from "react";
import { getClientes } from "../services/api";
import type { ClienteBackend } from "../services/api";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteBackend[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getClientes()
      .then((data) => {
        setClientes(data.clientes || []);
      })
      .catch((err) => {
        console.error("Error cargando clientes:", err);
        setError("No se pudieron cargar los clientes");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtrados = clientes.filter((c) => {
    const term = filtro.toLowerCase();
    return (
      c.nombreCliente.toLowerCase().includes(term) ||
      c.apellidoCliente.toLowerCase().includes(term) ||
      c.documentoCliente ||
      c.emailCliente.toLowerCase().includes(term) ||
      c.telefonoCliente.toLowerCase().includes(term)
    );
  });

  return (
    <div className="page-container">
      <h1 className="page-title">Clientes</h1>

      <div className="page-card">
        <input
          type="text"
          className="form-control"
          placeholder="Filtrar por nombre, email o teléfono..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {loading && <p>Cargando clientes...</p>}
      {error && <p className="text-danger">{error}</p>}

      <table className="table-prism">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Documento</th>
            <th>Email</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((c) => (
            <tr key={c.idCliente}>
              <td>{c.nombreCliente}</td>
              <td>{c.apellidoCliente}</td>
              <td>{c.documentoCliente}</td>
              <td>{c.emailCliente}</td>
              <td>{c.telefonoCliente}</td>
            </tr>
          ))}
          {filtrados.length === 0 && !loading && (
            <tr>
              <td colSpan={4}>No hay clientes para mostrar.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}



/**¿Qué está pasando, bloque por bloque?
interface Cliente → le enseñamos a TypeScript qué campos tiene un cliente, para que nos avise si nos equivocamos en el nombre.
useState:
clientes → guarda el array que viene del backend.
filtro → texto de búsqueda escrito por el usuario.
seleccionado → guarda un cliente concreto cuando haces click en una fila.
useEffect:
Se ejecuta al montar el componente (una sola vez).
Llama a getClientes() (que a su vez llama GET /clientes).
Toma data.clientes de la respuesta y lo guarda en el estado.
clientesFiltrados:
Toma clientes y los filtra si el texto del filtro está contenido en nombre/email/teléfono.
Tabla:
Muestra sólo clientesFiltrados.
Cada fila tiene onClick={() => setSeleccionado(c)} → eso permite mostrar el panel de detalle.
Panel de detalle:
Se muestra si seleccionado !== null.
Muestra los campos claves del cliente.
Botón “Cerrar” vuelve a null. */

/**🧠 ¿Qué hace esta página?
useEffect → al cargar la página, hace GET /clientes.
Guarda la lista en clientes.
El input filtro permite buscar por nombre/email.
clientesFiltrados es la lista ya filtrada.
Cada fila es clickeable (onClick) y muestra un panel de detalle abajo.

👉 Aquí ya tienes:
Listado
Filtro
Click en entidad
UI linda gracias a Bootstrap */

/**🧠 Explicación rápida:
useEffect llama a getClientes() una sola vez al cargar.
La respuesta del backend clientes se guarda en el estado.
Input de filtro funciona en memoria.
Puedes clickeear una fila y ver detalle en una card. */