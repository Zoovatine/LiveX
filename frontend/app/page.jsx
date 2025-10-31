"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const router = useRouter();

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (!error) router.push("/dashboard");
  }

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (!error) router.push("/dashboard");
  }

  return (
    <main style={{ maxWidth: 420, margin: "3rem auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem" }}>
        Live Tracker
      </h1>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        style={{ width: "100%", padding: "0.6rem", marginBottom: "0.7rem" }}
      />
      <input
        type="password"
        value={pass}
        onChange={e => setPass(e.target.value)}
        placeholder="Password"
        style={{ width: "100%", padding: "0.6rem", marginBottom: "0.7rem" }}
      />
      <button onClick={handleLogin} style={{ width: "100%", padding: "0.7rem", marginBottom: "0.5rem" }}>
        Log in
      </button>
      <button onClick={handleSignup} style={{ width: "100%", padding: "0.7rem", background: "#0ea5e9" }}>
        Sign up
      </button>
    </main>
  );
}
