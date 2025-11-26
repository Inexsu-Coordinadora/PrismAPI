import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Importamos Bootstrap CSS (para estilos rápidos)
import "bootstrap/dist/css/bootstrap.min.css";

// Puedes dejar tu CSS también
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**🔍 ¿Qué hicimos aquí?
Le decimos a React que renderice <App />.
Importamos Bootstrap para que todas las clases como container, btn, table, etc., ya se vean bonitas sin esfuerzo. */