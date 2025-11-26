import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import "./App.css";
import ClientesPage from "./pages/ClientePage";
import ConsultoresPage from "./pages/ConsultoresPage";
import ProyectosPage from "./pages/ProyectosPage";
import TareasPage from "./pages/TareasPage";
import AsignacionConsultorProyectoPage from "./pages/AsignacionConsultorProyectoPage";
import RegistroHorasPage from "./pages/RegistroHorasPage";
import ConsultaProyectoPage from "./pages/ConsultaProyectoPage";
import GestionTareasPage from "./pages/GestionTareasPage";

function App() {
  return (
    <BrowserRouter>
 <nav className="navbar-root">
  {/* IZQUIERDA: logo + nombre */}
  <div className="navbar-left">
    <img
      src="/prismapi-logo.png"
      alt="PrismAPI"
      className="navbar-logo"
    />
    <span className="navbar-title">PrismAPI</span>
  </div>

  {/* DERECHA: menú */}
  <ul className="navbar-menu">
    <li>
      <NavLink to="/clientes" className="nav-link-custom">
        Clientes
      </NavLink>
    </li>
    <li>
      <NavLink to="/consultores" className="nav-link-custom">
        Consultores
      </NavLink>
    </li>
    <li>
      <NavLink to="/proyectos" className="nav-link-custom">
        Proyectos
      </NavLink>
    </li>
    <li>
      <NavLink to="/tareas" className="nav-link-custom">
        Tareas
      </NavLink>
    </li>
    <li>
      <NavLink to="/asignacion" className="nav-link-custom">
        Asignar Consultor
      </NavLink>
    </li>
    <li>
      <NavLink to="/registro-horas" className="nav-link-custom">
        Registro de Horas
      </NavLink>
    </li>
    <li>
      <NavLink to="/consulta-proyecto" className="nav-link-custom">
        Consulta Proyecto
      </NavLink>
    </li>
    <li>
      <NavLink to="/gestion-tareas" className="nav-link-custom">
        Gestión Tareas
      </NavLink>
    </li>
  </ul>
</nav>

      {/* Contenido principal */}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<ProyectosPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/consultores" element={<ConsultoresPage />} />
          <Route path="/proyectos" element={<ProyectosPage />} />
          <Route path="/tareas" element={<TareasPage />} />

          {/* Servicios */}
          <Route
            path="/asignacion"
            element={<AsignacionConsultorProyectoPage />}
          />
          <Route path="/registro-horas" element={<RegistroHorasPage />} />
          <Route path="/consulta-proyecto" element={<ConsultaProyectoPage />} />
          <Route path="/gestion-tareas" element={<GestionTareasPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;


/**🧠 ¿Qué está pasando aquí?
Usamos BrowserRouter para manejar rutas del navegador.
Navbar con el logo y enlaces a cada entidad y cada servicio.
<Routes> define qué componente se muestra según la URL.
Cada Route apunta a un componente de página (que crearemos en src/pages). */

/**💡 Esto hace dos cosas:
Agrega el botón Clientes en el menú.
Le dice a React: cuando la URL sea /clientes, renderiza <ClientesPage />. */