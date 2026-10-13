"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

function authEmailForLoginId(value: string) {
  const normalized = value.trim().toLowerCase();
  return normalized.includes("@") ? normalized : `${normalized}@login.tecmasala.invalid`;
}

export default function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!loginId.trim() || !password) { setError("Login ID आणि Password दोन्ही टाका."); return; }
    setLoading(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: authEmailForLoginId(loginId),
      password,
    });
    if (loginError) {
      setError("Login ID किंवा Password चुकीचा आहे. पुन्हा तपासा.");
      setLoading(false);
      return;
    }
    window.location.href = "/dashboard";
  }

  return <main style={pageStyle}>
    <div style={overlayStyle} />
    <div style={cardStyle}>
      <div style={brandStyle}>TEC MASALA</div>
      <h1 style={{ margin: "0 0 8px", fontSize: 30 }}>Login</h1>
      <p style={{ margin: "0 0 24px", color: "#999", fontSize: 14 }}>तुमचा Login ID आणि Password वापरा.</p>
      {error && <div role="alert" style={errorStyle}>{error}</div>}
      <form onSubmit={handleLogin}>
        <label style={labelStyle}>Login ID
          <input value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="उदा. hinjewadi01 किंवा owner@email.com" autoComplete="username" style={inputStyle} />
        </label>
        <label style={labelStyle}>Password
          <div style={{ position: "relative" }}>
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password टाका" autoComplete="current-password" style={{ ...inputStyle, paddingRight: 65 }} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} style={showStyle}>{showPassword ? "Hide" : "Show"}</button>
          </div>
        </label>
        <button type="submit" disabled={loading} style={{ ...submitStyle, opacity: loading ? 0.7 : 1 }}>{loading ? "तपासत आहे..." : "Login"}</button>
      </form>
      <button type="button" onClick={() => { window.location.href = "/"; }} style={backStyle}>← Back to Home</button>
      <div style={{ marginTop: 22, textAlign: "center", color: "#555", fontSize: 11 }}>TEC MASALA MANAGEMENT</div>
    </div>
  </main>;
}

const pageStyle: React.CSSProperties = { position: "relative", minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, boxSizing: "border-box", background: "#050505", color: "#fff", fontFamily: "Arial,sans-serif" };
const overlayStyle: React.CSSProperties = { position: "absolute", inset: 0, background: "radial-gradient(circle at center,rgba(255,122,0,.09),rgba(0,0,0,.9) 70%)" };
const cardStyle: React.CSSProperties = { position: "relative", zIndex: 1, width: "100%", maxWidth: 430, padding: 30, boxSizing: "border-box", background: "rgba(21,21,21,.96)", border: "1px solid #292929", borderRadius: 18, boxShadow: "0 25px 80px rgba(0,0,0,.65)" };
const brandStyle: React.CSSProperties = { color: "#ff7a00", fontSize: 12, fontWeight: 900, letterSpacing: 3, marginBottom: 10 };
const labelStyle: React.CSSProperties = { display: "block", color: "#aaa", fontSize: 13, fontWeight: 700, marginBottom: 18 };
const inputStyle: React.CSSProperties = { display: "block", width: "100%", boxSizing: "border-box", marginTop: 7, padding: 13, borderRadius: 9, border: "1px solid #333", background: "#0d0d0d", color: "#fff", outline: "none", fontSize: 15 };
const showStyle: React.CSSProperties = { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: 0, background: "transparent", color: "#ff7a00", fontSize: 12, fontWeight: 800, cursor: "pointer" };
const submitStyle: React.CSSProperties = { width: "100%", padding: 14, border: 0, borderRadius: 10, background: "#ff7a00", color: "#111", fontWeight: 900, fontSize: 15, cursor: "pointer" };
const backStyle: React.CSSProperties = { width: "100%", marginTop: 14, padding: 12, border: "1px solid #333", borderRadius: 10, background: "#101010", color: "#aaa", fontWeight: 700, cursor: "pointer" };
const errorStyle: React.CSSProperties = { marginBottom: 18, padding: 12, borderRadius: 9, background: "rgba(255,70,70,.08)", border: "1px solid rgba(255,70,70,.25)", color: "#ff8585", fontSize: 13, fontWeight: 700, lineHeight: 1.5 };