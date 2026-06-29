"use client";
import { useState, useEffect } from "react";

interface Subscriber {
  id: string;
  email: string;
  locale: string;
  created_at: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Prefer": "return=representation",
};

export default function Newsletter() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetch_ = async () => {
    setLoading(true);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers?order=created_at.desc&limit=1000`, { headers });
    const data = await res.json();
    setSubs(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar suscriptor?")) return;
    await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers?id=eq.${id}`, { method: "DELETE", headers });
    fetch_();
  };

  const filtered = subs.filter(s => !search || s.email.toLowerCase().includes(search.toLowerCase()));

  const exportCSV = () => {
    const rows = [["email", "idioma", "fecha"], ...filtered.map(s => [s.email, s.locale || "", new Date(s.created_at).toLocaleString("es-ES")])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: 0 }}>Newsletter</h1>
          <p style={{ color: "#4A4540", fontSize: "13px", margin: "4px 0 0" }}>{subs.length} suscriptores en total</p>
        </div>
        <button onClick={exportCSV} style={{ background: "#111827", color: "white", border: "none", borderRadius: "6px", padding: "10px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
          ⬇ Exportar CSV
        </button>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por email..."
        style={{ width: "100%", maxWidth: "360px", padding: "8px 10px", border: "1px solid #DDD8D0", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box", marginBottom: "1rem", outline: "none" }}
      />

      {loading ? (
        <p style={{ color: "#4A4540" }}>Cargando...</p>
      ) : (
        <div style={{ background: "white", borderRadius: "8px", border: "1px solid #DDD8D0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAF8F4" }}>
                {["Email", "Idioma", "Fecha", "Acciones"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#4A4540", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} style={{ borderTop: "1px solid #f3f4f6", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 600, color: "#111827" }}>{s.email}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#1A1714" }}>{(s.locale || "—").toUpperCase()}</td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "#4A4540" }}>{new Date(s.created_at).toLocaleString("es-ES")}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => handleDelete(s.id)} style={{ background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "4px", padding: "4px 10px", fontSize: "12px", cursor: "pointer" }}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#4A4540", fontSize: "13px" }}>Sin suscriptores</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
