"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CoOwnerLoginPage() {
  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setError("");
    if (password.length < 8) { setError("Password किमान 8 characters चा असावा."); return; }
    setBusy(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-coowner-user", {
        body: { name: name.trim(), loginId: loginId.trim().toLowerCase(), password },
      });
      if (fnError) throw new Error(fnError.message);
      if (!data?.success) throw new Error(data?.error || "Co-owner login तयार झाला नाही.");
      setMessage("Co-owner login तयार झाला. Login ID: " + data.loginId);
      setName(""); setLoginId(""); setPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login तयार झाला नाही.");
    } finally { setBusy(false); }
  }

  const field: React.CSSProperties = { display: "block", width: "100%", boxSizing: "border-box", padding: 13, marginTop: 7, borderRadius: 9, border: "1px solid #333", background: "#0d0d0d", color: "#fff" };
  return <main style={{ minHeight: "100vh", padding: 24, background: "#080808", color: "#fff", fontFamily: "Arial,sans-serif" }}>
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <button type="button" onClick={() => { window.location.href = "/dashboard"; }} style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #333", background: "#151515", color: "#ddd" }}>← Dashboard</button>
      <h1 style={{ color: "#ff7a00", marginBottom: 6 }}>Co-owner Login</h1>
      <p style={{ color: "#aaa", lineHeight: 1.6 }}>विश्वासू co-owner/manager साठी स्वतंत्र Login ID आणि Password तयार करा. हा account Manager role ने तयार होईल.</p>
      {message && <p role="status" style={{ padding: 12, borderRadius: 8, background: "#102016", color: "#69d98a" }}>{message}</p>}
      {error && <p role="alert" style={{ padding: 12, borderRadius: 8, background: "#2a1111", color: "#ff8585" }}>{error}</p>}
      <form onSubmit={create} style={{ padding: 22, border: "1px solid #292929", borderRadius: 14, background: "#151515" }}>
        <label style={{ display: "block", marginBottom: 16, color: "#bbb", fontSize: 13 }}>Co-owner चे नाव<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="उदा. Rahul" style={field} /></label>
        <label style={{ display: "block", marginBottom: 16, color: "#bbb", fontSize: 13 }}>Login ID<input required minLength={3} maxLength={30} value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="उदा. rahul_manager" autoComplete="off" style={field} /></label>
        <label style={{ display: "block", marginBottom: 16, color: "#bbb", fontSize: 13 }}>Password<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="किमान 8 characters" autoComplete="new-password" style={field} /></label>
        <button disabled={busy} type="submit" style={{ padding: "12px 18px", border: 0, borderRadius: 9, background: "#ff7a00", color: "#111", fontWeight: 900, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>{busy ? "तयार होत आहे..." : "Co-owner Login तयार करा"}</button>
      </form>
      <p style={{ color: "#777", fontSize: 12, lineHeight: 1.6 }}>टीप: Login ID unique असणे आवश्यक आहे. तयार केल्यानंतर तो co-owner ला द्या; Password सुरक्षितपणे वेगळा सांगा.</p>
    </div>
  </main>;
}