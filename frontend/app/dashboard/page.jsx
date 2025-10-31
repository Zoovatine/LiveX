"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUser(data.user);
      const { data: widgetsData } = await supabase
        .from("widgets")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });
      setWidgets(widgetsData || []);
    });
  }, []);

  async function createWidget() {
    if (!user) return;
    const slug = Math.random().toString(36).slice(2, 8);
    const { data, error } = await supabase.from("widgets").insert({
      user_id: user.id,
      name: name || "My Widget",
      slug
    }).select().single();
    if (!error) {
      setWidgets(prev => [data, ...prev]);
      setName("");
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Your Widgets</h2>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Widget name"
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button onClick={createWidget} style={{ padding: "0.5rem 1rem" }}>
          + Create
        </button>
      </div>
      <ul style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {widgets.map(w => (
          <li key={w.id} style={{ background: "#1e293b", padding: "1rem", borderRadius: "0.5rem" }}>
            <div style={{ fontWeight: 600 }}>{w.name}</div>
            <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>Total: ${(w.total_cents / 100).toFixed(2)}</div>
            <div style={{ marginTop: "0.5rem" }}>
              OBS URL: 
              <code style={{ marginLeft: "0.3rem" }}>
                {`https://YOUR_FRONTEND_DOMAIN/widget/${w.slug}`}
              </code>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
