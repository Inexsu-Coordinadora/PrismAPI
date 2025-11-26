import { useState } from "react";
import { crearRegistroHoras } from "../services/api";

export default function RegistroHorasTestPage() {
  const [form, setForm] = useState({
    idConsultor: "",
    idProyecto: "",
    fechaRegistro: "",
    horasTrabajadas: "",
    descripcionActividad: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setOk(null);

    try {
      await crearRegistroHoras({
        ...form,
        horasTrabajadas: Number(form.horasTrabajadas),
      });

      setOk("Registro creado correctamente");
    } catch (e: any) {
      setError(e.message); // 👈 aquí verás tu validación del backend
    }
  };

  return (
    <div style={{ padding: 25 }}>
      <h1>Probar Registro de Horas</h1>

      <input
        placeholder="ID Consultor"
        onChange={(e) => setForm({ ...form, idConsultor: e.target.value })}
      />

      <input
        placeholder="ID Proyecto"
        onChange={(e) => setForm({ ...form, idProyecto: e.target.value })}
      />

      <input
        type="date"
        onChange={(e) => setForm({ ...form, fechaRegistro: e.target.value })}
      />

      <input
        type="number"
        placeholder="Horas"
        onChange={(e) =>
          setForm({ ...form, horasTrabajadas: e.target.value })
        }
      />

      <input
        placeholder="Descripción"
        onChange={(e) =>
          setForm({ ...form, descripcionActividad: e.target.value })
        }
      />

      <button onClick={handleSubmit}>Guardar</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {ok && <p style={{ color: "green" }}>{ok}</p>}
    </div>
  );
}
