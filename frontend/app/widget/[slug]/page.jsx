"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { supabase } from "../../../lib/supabaseClient";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // e.g. https://live-tracker-backend.onrender.com

export default function WidgetPage({ params }) {
  const { slug } = params;
  const [total, setTotal] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [widgetId, setWidgetId] = useState(null);

  useEffect(() => {
    async function loadWidget() {
      // we need to get widget by slug
      const { data, error } = await supabase
        .from("widgets")
        .select("id, total_cents, currency")
        .eq("slug", slug)
        .single();

      if (!error && data) {
        setWidgetId(data.id);
        setTotal(data.total_cents);
        setCurrency(data.currency);

        // connect to socket
        const socket = io(BACKEND_URL, {
          transports: ["websocket"]
        });
        socket.emit("join_widget", data.id);
        socket.on("widget_update", (payload) => {
          if (payload.id === data.id) {
            setTotal(payload.totalCents);
            setCurrency(payload.currency);
          }
        });

        return () => {
          socket.disconnect();
        };
      }
    }
    loadWidget();
  }, [slug]);

  return (
    <div style={{
      background: "transparent",
      color: "white",
      fontFamily: "system-ui, sans-serif",
      fontSize: "2.8rem",
      fontWeight: 700,
      textAlign: "center",
      padding: "0.5rem 1rem",
      textShadow: "0 0 12px rgba(0,0,0,0.6)"
    }}>
      {currency === "USD" ? "$" : ""}
      {(total / 100).toFixed(2)}
    </div>
  );
}
