"use client";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
export default function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const email = loginId.trim();
    if (!email || !password) {
      setError("Login ID आणि Password दोन्ही टाका.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("SUPABASE LOGIN ERROR:", error);
        setError(
          `Login failed: ${error.message}`
        );
        setLoading(false);
        return;
      }
      console.log("LOGIN SUCCESS:", data);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(
        "Login करताना unexpected error आला."
      );
      setLoading(false);
    }
  }
  return (
    <main style={pageStyle}>
      {/* BACKGROUND LOGO */}
      <div style={backgroundLogoWrapperStyle}>
        <img
          src="/logo.png"
          alt=""
          style={backgroundLogoStyle}
        />
      </div>
      {/* OVERLAY */}
      <div style={overlayStyle} />
      {/* LOGIN CONTENT */}
      <div style={contentWrapperStyle}>
        <div style={loginCardStyle}>
          <div style={brandStyle}>
            TEC MASALA
          </div>
          <h1 style={titleStyle}>
            Outlet Login
          </h1>
          <p style={subtitleStyle}>
            तुमचा Login ID आणि Password वापरा.
          </p>
          {/* ERROR */}
          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            {/* LOGIN ID */}
            <label style={labelStyle}>
              Login ID
              <input
                type="email"
                value={loginId}
                onChange={(event) =>
                  setLoginId(event.target.value)
                }
                placeholder="admin@tecmasala.com"
                autoComplete="username"
                style={inputStyle}
              />
            </label>
            {/* PASSWORD */}
            <label style={labelStyle}>
              Password
              <div style={passwordWrapperStyle}>
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="तुमचा Password टाका"
                  autoComplete="current-password"
                  style={{
                    ...inputStyle,
                    marginTop: 0,
                    paddingRight: 70,
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  style={
                    showPasswordButtonStyle
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </label>
            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...loginButtonStyle,
                opacity: loading ? 0.7 : 1,
                cursor: loading
                  ? "default"
                  : "pointer",
              }}
            >
              {loading
                ? "Checking..."
                : "Login"}
            </button>
          </form>
          {/* BACK */}
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            style={backButtonStyle}
          >
            ← Back to Home
          </button>
          <div style={footerStyle}>
            Tec Masala Management
          </div>
        </div>
      </div>
      {/* ANIMATION */}
      <style jsx>{`
        @keyframes logoZoom {
          0% {
            transform: scale(0.85);
          }
          50% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(0.85);
          }
        }
      `}</style>
    </main>
  );
}
/* =========================================================
   PAGE
========================================================= */
const pageStyle: React.CSSProperties = {
  position: "relative",
  minHeight: "100vh",
  width: "100%",
  overflow: "hidden",
  background: "#050505",
  color: "#fff",
  fontFamily: "Arial, sans-serif",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  boxSizing: "border-box",
};
/* =========================================================
   BACKGROUND LOGO
========================================================= */
const backgroundLogoWrapperStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
  overflow: "hidden",
};
const backgroundLogoStyle: React.CSSProperties = {
  width: "min(950px, 75vw)",
  height: "auto",
  objectFit: "contain",
  opacity: 0.6,
  filter: "grayscale(20%)",
  animation: "logoZoom 6s ease-in-out infinite",
};
/* =========================================================
   OVERLAY
========================================================= */
const overlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(circle at center, rgba(255,122,0,.08), rgba(0,0,0,.82) 65%)",
  pointerEvents: "none",
};
/* =========================================================
   CONTENT
========================================================= */
const contentWrapperStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  display: "flex",
  justifyContent: "center",
};
const loginCardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 430,
  padding: 30,
  boxSizing: "border-box",
  background: "rgba(21,21,21,.94)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 18,
  boxShadow:
    "0 25px 80px rgba(0,0,0,.65)",
  backdropFilter: "blur(12px)",
};
/* =========================================================
   HEADER
========================================================= */
const brandStyle: React.CSSProperties = {
  color: "#ff7a00",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 3,
  marginBottom: 10,
};
const titleStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: 30,
  fontWeight: 900,
};
const subtitleStyle: React.CSSProperties = {
  margin: "0 0 25px",
  color: "#888",
  fontSize: 14,
};
/* =========================================================
   ERROR
========================================================= */
const errorStyle: React.CSSProperties = {
  marginBottom: 18,
  padding: 12,
  borderRadius: 9,
  background: "rgba(255,70,70,.08)",
  border:
    "1px solid rgba(255,70,70,.25)",
  color: "#ff7070",
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1.5,
};
/* =========================================================
   FORM
========================================================= */
const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#aaa",
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 18,
};
const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  marginTop: 7,
  padding: 13,
  borderRadius: 9,
  border: "1px solid #333",
  background: "#0d0d0d",
  color: "#fff",
  outline: "none",
  fontSize: 15,
};
const passwordWrapperStyle: React.CSSProperties = {
  position: "relative",
  marginTop: 7,
};
const showPasswordButtonStyle: React.CSSProperties = {
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
  border: 0,
  background: "transparent",
  color: "#ff7a00",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};
/* =========================================================
   BUTTONS
========================================================= */
const loginButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  border: 0,
  borderRadius: 10,
  background: "#ff7a00",
  color: "#111",
  fontWeight: 900,
  fontSize: 15,
};
const backButtonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 14,
  padding: 12,
  border: "1px solid #333",
  borderRadius: 10,
  background: "#101010",
  color: "#aaa",
  fontWeight: 700,
  cursor: "pointer",
};
/* =========================================================
   FOOTER
========================================================= */
const footerStyle: React.CSSProperties = {
  marginTop: 22,
  textAlign: "center",
  color: "#555",
  fontSize: 11,
};