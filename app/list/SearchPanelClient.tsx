"use client";

import { useState } from "react";
import { searchEvents } from "../api/events/search/route"; // IMPORTA TU FUNCIÓN CENTRALIZADA

export default function SearchPanel({ initialData }: { initialData: any[] }) {
  const [events, setEvents] = useState(initialData);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function search(textValue: string) {
    setLoading(true);

    const payload = {
      idCategoria: null,
      titulo: textValue,
      descripcion: textValue,
      lugar: textValue,
      fechaHoraInicio: new Date().toISOString(),
      page: 1,
      limit: 10
    };

    console.log("🔍 Buscando con payload:", payload);

    const result = await searchEvents(payload); // 💥 usamos la API unificada

    if (result.ok) {
      setEvents(result.data ?? []);
    } else {
      console.warn("⚠  Error en búsqueda:", result.error);
      setEvents([]);
    }

    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") search(text);
  }

  return (
    <>
      {/* INPUT */}
      <div className="container center" style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Buscar eventos..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            padding: "12px 16px",
            width: "100%",
            maxWidth: "500px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        {loading && <p style={{ marginTop: 10 }}>Buscando...</p>}
      </div>

      {/* RESULTADOS */}
      <div className="container center list-cards" style={{ marginTop: 30 }}>
        {events.length === 0 && !loading && <p>No se encontraron eventos.</p>}

        {events.map((ev: any) => (
          <div key={ev.idEvento}>
            {JSON.stringify(ev)}
          </div>
        ))}
      </div>
    </>
  );
}
