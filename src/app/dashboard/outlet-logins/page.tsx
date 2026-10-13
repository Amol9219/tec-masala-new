"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Outlet = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  login_id: string | null;
  auth_user_id: string | null;
  is_active: boolean;
  status: string | null;
};

export default function OutletLoginsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [credentials, setCredentials] = useState<Record<string, { loginId: string; password: string }>>({});
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
    if (role?.role !== "Owner") { window.location.href = "/dashboard"; return; }
    const { data, error: loadError } = await supabase
      .from("outlets").select("id,name,phone,email,login_id,auth_user_id,is_active,status")
      .neq("status", "deleted").order("name");
    if (loadError) setError(loadError.message);
    else setOutlets((data ?? []) as Outlet[]);
    setLoading(false);
  }

  function change(id: string, field: "loginId" | "password", value: string) {
    setCredentials((prev) => ({
      ...prev,
      [id]: { loginId: prev[id]?.loginId ?? outlets.find((o) => o.id === id)?.login_id ?? "", password: prev[id]?.password ?? "", [field]: value },
    }));
  }

  async function save(outlet: Outlet) {
    setMessage(""); setError("");
    const item = credentials[outlet.id] ?? { loginId: outlet.login_id ?? "", password: "" };
    if (!item.loginId.trim()) { setError(outlet.name + ": Login ID टाका."); return; }
    if (!item.password) { setError(outlet.name + ": नवीन Password टाका."); return; }
    setBusyId(outlet.id);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-outlet-user", {
        body: { outletId: outlet.id, loginId: item.loginId.trim().toLowerCase(), password: item.password },
      });
      if (fnError) throw new Error(fnError.message);
      if (!data?.success) throw new Error(data?.error || "Login सेव्ह झाला नाही.");
      setMessage(outlet.name + " साठी Login ID आणि Password सेव्ह झाले.");
      setCredentials((prev) => ({ ...prev, [outlet.id]: { loginId: item.loginId.trim().toLowerCase(), password: "" } }));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login सेव्ह झाला नाही.");
    } finally { setBusyId(""); }
  }

  const page: React.CSSProperties = { minHeight: "100vh", padding: 24, background: "#080808", color: "#fff", fontFamily: "Arial,sans-serif" };
  const card: React.CSSProperties = { background: "#151515", border: "1px solid #292929", borderRadius: 14, padding: 18, marginTop: 14 };
  const field: React.CSSProperties = { display: "block", width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 8, border: "1px solid #333", background: "#0d0d0d", color: "#fff", marginTop: 6 };
  return <main style={page}>
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <button onClick={() => { window.location.href = "/dashboard"; }} style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #333", background: "#151515", color: "#ddd", cursor: "pointer" }}>← Dashboard</button>
      <h1 style={{ color: "#ff7a00", marginBottom: 6 }}>Outlet Login IDs</h1>
      <p style={{ color: "#aaa" }}>प्रत्येक outlet साठी Login ID आणि नवीन Password इथून तयार किंवा बदलता येईल.</p>
      {message && <p role="status" style={{ color: "#69d98a", background: "#102016", padding: 12, borderRadius: 8 }}>{message}</p>}
      {error && <p role="alert" style={{ color: "#ff8585", background: "#2a1111", padding: 12, borderRadius: 8 }}>{error}</p>}
      {loading ? <p>Outlets लोड होत आहेत...</p> : outlets.length === 0 ? <p>कोणतेही outlet सापडले नाही.</p> : outlets.map((outlet) => {
        const item = credentials[outlet.id] ?? { loginId: outlet.login_id ?? "", password: "" };
        return <section key={outlet.id} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div><h2 style={{ margin: "0 0 5px", fontSize: 19 }}>{outlet.name}</h2><span style={{ color: "#999", fontSize: 13 }}>{outlet.phone || outlet.email || "संपर्क माहिती नाही"}</span></div>
            <span style={{ color: outlet.is_active ? "#69d98a" : "#ff8585", fontSize: 12 }}>{outlet.is_active ? "Active" : "Inactive"}</span>
          </div>
          <label style={{ display: "block", marginTop: 16, color: "#bbb", fontSize: 13 }}>Login ID<input value={item.loginId} onChange={(e) => change(outlet.id, "loginId", e.target.value)} placeholder="उदा. hinjewadi01" autoComplete="off" style={field} /></label>
          <label style={{ display: "block", marginTop: 12, color: "#bbb", fontSize: 13 }}>नवीन Password<input type="password" value={item.password} onChange={(e) => change(outlet.id, "password", e.target.value)} placeholder="किमान 8 characters" autoComplete="new-password" style={field} /></label>
          <p style={{ color: "#777", fontSize: 12, lineHeight: 1.5 }}>Password सुरक्षिततेसाठी पुन्हा दाखवला जाणार नाही. बदलायचा असल्यास नवीन Password टाका.</p>
          <button disabled={busyId === outlet.id} onClick={() => void save(outlet)} style={{ padding: "11px 16px", border: 0, borderRadius: 8, background: "#ff7a00", color: "#111", fontWeight: 800, cursor: "pointer", opacity: busyId === outlet.id ? 0.6 : 1 }}>{busyId === outlet.id ? "सेव्ह होत आहे..." : "Login ID / Password सेव्ह करा"}</button>
        </section>;
      })}
    </div>
  </main>;
}