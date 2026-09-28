"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CSSProperties } from "react";
type Outlet = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  auth_user_id: string | null;
  is_active: boolean;
  status: string | null;
  created_at: string;
  updated_at: string;
};
export default function OutletsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    loadOutlets();
  }, []);
  async function loadOutlets() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("outlets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("LOAD OUTLETS ERROR:", error);
      setError(error.message);
      setOutlets([]);
    } else {
      setOutlets((data ?? []) as Outlet[]);
    }
    setLoading(false);
  }
  function resetForm() {
    setName("");
    setAddress("");
    setPhone("");
    setEmail("");
    setPassword("");
    setIsActive(true);
    setEditingId(null);
  }
  function openAddForm() {
    resetForm();
    setMessage("");
    setError("");
    setShowForm(true);
  }
  function openEditForm(outlet: Outlet) {
    setName(outlet.name);
    setAddress(outlet.address ?? "");
    setPhone(outlet.phone ?? "");
    setEmail(outlet.email ?? "");
    setPassword("");
    setIsActive(outlet.is_active);
    setEditingId(outlet.id);
    setMessage("");
    setError("");
    setShowForm(true);
  }
  async function createOutletLogin(
    outletId: string,
    loginEmail: string,
    loginPassword: string
  ) {
    const { data, error } = await supabase.functions.invoke(
      "create-outlet-user",
      {
        body: {
          outletId,
          email: loginEmail,
          password: loginPassword,
        },
      }
    );
    if (error) {
      throw new Error(error.message);
    }
    if (!data?.success) {
      throw new Error(
        data?.error || "Outlet login create failed."
      );
    }
    return data;
  }
  async function saveOutlet(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);
    const cleanName = name.trim();
    const cleanAddress = address.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    if (!cleanName) {
      setError("Outlet name टाका.");
      setSaving(false);
      return;
    }
    if (!cleanAddress) {
      setError("Address टाका.");
      setSaving(false);
      return;
    }
    if (!cleanPhone) {
      setError("Phone number टाका.");
      setSaving(false);
      return;
    }
    if (!editingId) {
      if (!cleanEmail) {
        setError("Outlet login Email टाका.");
        setSaving(false);
        return;
      }
      if (!cleanPassword) {
        setError("Outlet login Password टाका.");
        setSaving(false);
        return;
      }
      if (cleanPassword.length < 6) {
        setError(
          "Password किमान 6 characters चा असावा."
        );
        setSaving(false);
        return;
      }
    }
    try {
      if (editingId) {
        const { error } = await supabase
          .from("outlets")
          .update({
            name: cleanName,
            address: cleanAddress,
            phone: cleanPhone,
            email: cleanEmail || null,
            is_active: isActive,
            status: isActive ? "active" : "inactive",
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);
        if (error) {
          console.error("UPDATE ERROR:", error);
          throw new Error(error.message);
        }
        setMessage("Outlet successfully updated.");
      } else {
        /*
         * STEP 1:
         * Create outlet record first.
         */
        const { data: outletData, error: insertError } =
          await supabase
            .from("outlets")
            .insert({
              name: cleanName,
              address: cleanAddress,
              phone: cleanPhone,
              email: cleanEmail,
              is_active: isActive,
              status: isActive ? "active" : "inactive",
            })
            .select("id")
            .single();
        if (insertError) {
          console.error(
            "INSERT OUTLET ERROR:",
            insertError
          );
          throw new Error(insertError.message);
        }
        if (!outletData?.id) {
          throw new Error(
            "Outlet तयार झाला पण outlet ID मिळाला नाही."
          );
        }
        /*
         * STEP 2:
         * Create Supabase Auth login.
         */
        try {
          await createOutletLogin(
            outletData.id,
            cleanEmail,
            cleanPassword
          );
        } catch (loginError) {
          /*
           * Login creation failed.
           * Remove the outlet so incomplete
           * outlet records are not left behind.
           */
          await supabase
            .from("outlets")
            .delete()
            .eq("id", outletData.id);
          throw loginError;
        }
        setMessage(
          "Outlet आणि Login successfully created."
        );
      }
      resetForm();
      setShowForm(false);
      await loadOutlets();
    } catch (err) {
      console.error("SAVE OUTLET ERROR:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unknown error";
      setError(
        `Outlet save failed: ${errorMessage}`
      );
    } finally {
      setSaving(false);
    }
  }
  async function toggleOutlet(id: string) {
    const outlet = outlets.find(
      (item) => item.id === id
    );
    if (!outlet) return;
    const nextActive = !outlet.is_active;
    const { error } = await supabase
      .from("outlets")
      .update({
        is_active: nextActive,
        status: nextActive
          ? "active"
          : "inactive",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      console.error("STATUS ERROR:", error);
      setError(error.message);
      return;
    }
    setMessage("Outlet status updated.");
    await loadOutlets();
  }
  async function deleteOutlet(id: string) {
    const outlet = outlets.find(
      (item) => item.id === id
    );
    if (!outlet) return;
    const confirmed = window.confirm(
      `"${outlet.name}" delete करायचा आहे का?`
    );
    if (!confirmed) return;
    const { error } = await supabase
      .from("outlets")
      .update({
        is_active: false,
        status: "deleted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      console.error("DELETE ERROR:", error);
      setError(error.message);
      return;
    }
    setMessage("Outlet successfully deleted.");
    await loadOutlets();
  }
  const filteredOutlets = useMemo(() => {
    const value = search.trim().toLowerCase();
    return outlets.filter((outlet) => {
      const matchesSearch =
        !value ||
        outlet.name
          .toLowerCase()
          .includes(value) ||
        (outlet.address ?? "")
          .toLowerCase()
          .includes(value) ||
        (outlet.phone ?? "").includes(value) ||
        (outlet.email ?? "")
          .toLowerCase()
          .includes(value);
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" &&
          outlet.is_active) ||
        (statusFilter === "Inactive" &&
          !outlet.is_active);
      return (
        matchesSearch && matchesStatus
      );
    });
  }, [outlets, search, statusFilter]);
  const activeCount = outlets.filter(
    (outlet) => outlet.is_active
  ).length;
  const inactiveCount = outlets.filter(
    (outlet) => !outlet.is_active
  ).length;
  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={loadingStyle}>
          <div style={logoStyle}>
            TEC MASALA
          </div>
          <div style={loadingTextStyle}>
            Loading Outlets...
          </div>
        </div>
      </main>
    );
  }
  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <header style={headerStyle}>
          <div>
            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/dashboard";
              }}
              style={backButtonStyle}
            >
              ← Dashboard
            </button>
            <div style={logoStyle}>
              TEC MASALA
            </div>
            <h1 style={titleStyle}>
              Outlets
            </h1>
            <p style={subtitleStyle}>
              तुमचे सर्व outlets manage करा.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddForm}
            style={addButtonStyle}
          >
            + Add Outlet
          </button>
        </header>
        {message && (
          <div style={successStyle}>
            {message}
          </div>
        )}
        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}
        <section style={summaryGridStyle}>
          <Summary
            title="Total Outlets"
            value={outlets.length}
            icon="🏪"
          />
          <Summary
            title="Active"
            value={activeCount}
            icon="✅"
          />
          <Summary
            title="Inactive"
            value={inactiveCount}
            icon="⏸️"
          />
        </section>
        {showForm && (
          <section style={formCardStyle}>
            <div style={formHeaderStyle}>
              <h2 style={formTitleStyle}>
                {editingId
                  ? "Edit Outlet"
                  : "Add New Outlet"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                style={closeButtonStyle}
              >
                ×
              </button>
            </div>
            <form onSubmit={saveOutlet}>
              <div style={formGridStyle}>
                <Field
                  label="Outlet Name"
                  value={name}
                  placeholder="उदा. Pune Outlet"
                  onChange={setName}
                />
                <Field
                  label="Phone"
                  value={phone}
                  placeholder="उदा. 9876543210"
                  onChange={setPhone}
                />
                <Field
                  label="Login Email"
                  value={email}
                  placeholder="उदा. pune@tecmasala.com"
                  type="email"
                  onChange={setEmail}
                />
                {!editingId && (
                  <Field
                    label="Login Password"
                    value={password}
                    placeholder="किमान 6 characters"
                    type="password"
                    onChange={setPassword}
                  />
                )}
                <Field
                  label="Address"
                  value={address}
                  placeholder="उदा. Pune, Maharashtra"
                  onChange={setAddress}
                />
                <div>
                  <label style={labelStyle}>
                    Status
                  </label>
                  <select
                    value={
                      isActive
                        ? "Active"
                        : "Inactive"
                    }
                    onChange={(event) => {
                      setIsActive(
                        event.target.value ===
                          "Active"
                      );
                    }}
                    style={inputStyle}
                  >
                    <option value="Active">
                      Active
                    </option>
                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>
              {!editingId && (
                <div style={loginInfoStyle}>
                  <strong>
                    Outlet Login:
                  </strong>{" "}
                  हा Email आणि Password त्या
                  outlet वाला login करण्यासाठी
                  वापरेल.
                </div>
              )}
              <div style={formActionsStyle}>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...saveButtonStyle,
                    opacity: saving
                      ? 0.6
                      : 1,
                  }}
                >
                  {saving
                    ? "Creating..."
                    : editingId
                    ? "Update Outlet"
                    : "Create Outlet + Login"}
                </button>
              </div>
            </form>
          </section>
        )}
        <section style={filterStyle}>
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            placeholder="Outlet name, phone, email search करा..."
            style={searchInputStyle}
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(
                event.target.value as
                  | "All"
                  | "Active"
                  | "Inactive"
              );
            }}
            style={filterSelectStyle}
          >
            <option value="All">
              All Status
            </option>
            <option value="Active">
              Active
            </option>
            <option value="Inactive">
              Inactive
            </option>
          </select>
        </section>
        <section style={listCardStyle}>
          <div style={listHeaderStyle}>
            <h2 style={sectionTitleStyle}>
              Outlet List
            </h2>
            <span style={countStyle}>
              {filteredOutlets.length} Records
            </span>
          </div>
          {filteredOutlets.length === 0 ? (
            <div style={emptyStyle}>
              <div style={emptyIconStyle}>
                🏪
              </div>
              <div style={emptyTitleStyle}>
                No outlets found
              </div>
              <p style={emptyTextStyle}>
                + Add Outlet वर click करून
                outlet तयार करा.
              </p>
            </div>
          ) : (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>
                      Outlet
                    </th>
                    <th style={thStyle}>
                      Address
                    </th>
                    <th style={thStyle}>
                      Phone
                    </th>
                    <th style={thStyle}>
                      Email
                    </th>
                    <th style={thStyle}>
                      Status
                    </th>
                    <th style={thStyle}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOutlets.map(
                    (outlet) => (
                      <tr key={outlet.id}>
                        <td style={tdStyle}>
                          <strong>
                            {outlet.name}
                          </strong>
                        </td>
                        <td style={tdStyle}>
                          {outlet.address ||
                            "-"}
                        </td>
                        <td style={tdStyle}>
                          {outlet.phone ||
                            "-"}
                        </td>
                        <td style={tdStyle}>
                          {outlet.email ||
                            "-"}
                        </td>
                        <td style={tdStyle}>
                          <button
                            type="button"
                            onClick={() =>
                              toggleOutlet(
                                outlet.id
                              )
                            }
                            style={{
                              ...statusBadgeStyle,
                              color:
                                outlet.is_active
                                  ? "#69d98a"
                                  : "#ff7070",
                              background:
                                outlet.is_active
                                  ? "rgba(80,200,120,.08)"
                                  : "rgba(255,70,70,.08)",
                              borderColor:
                                outlet.is_active
                                  ? "rgba(80,200,120,.25)"
                                  : "rgba(255,70,70,.25)",
                            }}
                          >
                            {outlet.is_active
                              ? "Active"
                              : "Inactive"}
                          </button>
                        </td>
                        <td style={tdStyle}>
                          <div
                            style={
                              actionGroupStyle
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  outlet
                                )
                              }
                              style={
                                editButtonStyle
                              }
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                deleteOutlet(
                                  outlet.id
                                )
                              }
                              style={
                                deleteButtonStyle
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <footer style={footerStyle}>
          TEC MASALA
        </footer>
      </div>
    </main>
  );
}
function Field({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={inputStyle}
      />
    </div>
  );
}
function Summary({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div style={summaryCardStyle}>
      <div style={summaryTopStyle}>
        <span style={summaryIconStyle}>
          {icon}
        </span>
        <span style={summaryLabelStyle}>
          {title}
        </span>
      </div>
      <div style={summaryValueStyle}>
        {value}
      </div>
    </div>
  );
}
/* =========================
   STYLES
========================= */
const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#080808",
  color: "#fff",
  padding: 20,
  fontFamily: "Arial, sans-serif",
  boxSizing: "border-box",
};
const containerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1200,
  margin: "0 auto",
};
const loadingStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};
const logoStyle: CSSProperties = {
  color: "#ff7a00",
  fontSize: 25,
  fontWeight: 900,
  letterSpacing: 3,
};
const loadingTextStyle: CSSProperties = {
  marginTop: 12,
  color: "#777",
  fontSize: 13,
};
const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 20,
  marginBottom: 28,
  flexWrap: "wrap",
};
const backButtonStyle: CSSProperties = {
  display: "block",
  border: 0,
  background: "transparent",
  color: "#888",
  padding: 0,
  marginBottom: 18,
  cursor: "pointer",
  fontSize: 13,
};
const titleStyle: CSSProperties = {
  margin: "8px 0 4px",
  fontSize: 32,
  fontWeight: 900,
};
const subtitleStyle: CSSProperties = {
  margin: 0,
  color: "#888",
  fontSize: 14,
};
const addButtonStyle: CSSProperties = {
  border: 0,
  borderRadius: 10,
  padding: "13px 18px",
  background: "#ff7a00",
  color: "#111",
  fontWeight: 900,
  cursor: "pointer",
};
const successStyle: CSSProperties = {
  marginBottom: 15,
  padding: 13,
  borderRadius: 10,
  background: "rgba(80,200,120,.08)",
  border: "1px solid rgba(80,200,120,.25)",
  color: "#69d98a",
  fontSize: 13,
  fontWeight: 700,
};
const errorStyle: CSSProperties = {
  marginBottom: 15,
  padding: 13,
  borderRadius: 10,
  background: "rgba(255,70,70,.08)",
  border: "1px solid rgba(255,70,70,.25)",
  color: "#ff7070",
  fontSize: 13,
  fontWeight: 700,
};
const summaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 15,
  marginBottom: 22,
};
const summaryCardStyle: CSSProperties = {
  padding: 19,
  borderRadius: 14,
  border: "1px solid #292929",
  background: "#151515",
};
const summaryTopStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
};
const summaryIconStyle: CSSProperties = {
  fontSize: 19,
};
const summaryLabelStyle: CSSProperties = {
  color: "#888",
  fontSize: 12,
  fontWeight: 800,
};
const summaryValueStyle: CSSProperties = {
  marginTop: 10,
  color: "#ff7a00",
  fontSize: 28,
  fontWeight: 900,
};
const formCardStyle: CSSProperties = {
  marginBottom: 22,
  padding: 22,
  borderRadius: 16,
  border: "1px solid #292929",
  background: "#151515",
};
const formHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 20,
};
const formTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 900,
};
const closeButtonStyle: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "1px solid #333",
  background: "#101010",
  color: "#aaa",
  fontSize: 20,
  cursor: "pointer",
};
const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 18,
};
const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: 7,
  color: "#aaa",
  fontSize: 13,
  fontWeight: 700,
};
const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 13,
  borderRadius: 9,
  border: "1px solid #333",
  background: "#0d0d0d",
  color: "#fff",
  outline: "none",
  fontSize: 14,
};
const loginInfoStyle: CSSProperties = {
  marginTop: 18,
  padding: 12,
  borderRadius: 9,
  background: "rgba(255,122,0,.06)",
  border:
    "1px solid rgba(255,122,0,.2)",
  color: "#aaa",
  fontSize: 12,
  lineHeight: 1.5,
};
const formActionsStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 22,
};
const cancelButtonStyle: CSSProperties = {
  padding: "12px 18px",
  borderRadius: 9,
  border: "1px solid #333",
  background: "#101010",
  color: "#aaa",
  fontWeight: 800,
  cursor: "pointer",
};
const saveButtonStyle: CSSProperties = {
  padding: "12px 20px",
  borderRadius: 9,
  border: 0,
  background: "#ff7a00",
  color: "#111",
  fontWeight: 900,
  cursor: "pointer",
};
const filterStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 180px",
  gap: 12,
  marginBottom: 18,
};
const searchInputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 14,
  borderRadius: 10,
  border: "1px solid #333",
  background: "#101010",
  color: "#fff",
  outline: "none",
  fontSize: 14,
};
const filterSelectStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 14,
  borderRadius: 10,
  border: "1px solid #333",
  background: "#101010",
  color: "#fff",
  outline: "none",
  fontSize: 14,
};
const listCardStyle: CSSProperties = {
  borderRadius: 16,
  border: "1px solid #292929",
  background: "#111",
  overflow: "hidden",
};
const listHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 20,
  borderBottom: "1px solid #292929",
};
const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 19,
  fontWeight: 900,
};
const countStyle: CSSProperties = {
  color: "#777",
  fontSize: 13,
};
const tableWrapperStyle: CSSProperties = {
  width: "100%",
  overflowX: "auto",
};
const tableStyle: CSSProperties = {
  width: "100%",
  minWidth: 950,
  borderCollapse: "collapse",
};
const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "14px 18px",
  color: "#777",
  fontSize: 12,
  fontWeight: 800,
  borderBottom: "1px solid #292929",
};
const tdStyle: CSSProperties = {
  padding: "15px 18px",
  color: "#ccc",
  fontSize: 13,
  borderBottom: "1px solid #202020",
};
const statusBadgeStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 20,
  border: "1px solid",
  fontSize: 11,
  fontWeight: 800,
  cursor: "pointer",
};
const actionGroupStyle: CSSProperties = {
  display: "flex",
  gap: 7,
};
const editButtonStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border:
    "1px solid rgba(255,122,0,.3)",
  background:
    "rgba(255,122,0,.06)",
  color: "#ff7a00",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};
const deleteButtonStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border:
    "1px solid rgba(255,70,70,.25)",
  background:
    "rgba(255,70,70,.06)",
  color: "#ff7070",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};
const emptyStyle: CSSProperties = {
  padding: 50,
  textAlign: "center",
};
const emptyIconStyle: CSSProperties = {
  fontSize: 36,
  marginBottom: 10,
};
const emptyTitleStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  marginBottom: 5,
};
const emptyTextStyle: CSSProperties = {
  margin: 0,
  color: "#777",
  fontSize: 13,
};
const footerStyle: CSSProperties = {
  padding: "35px 0 10px",
  textAlign: "center",
  color: "#444",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 2,
};