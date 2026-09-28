"use client";
import { useState } from "react";
export default function HomePage() {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          height: 70,
          padding: "0 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #252525",
          background: "#111",
        }}
      >
        <div>
          <div
            style={{
              color: "#ff7a00",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 3,
            }}
          >
            TEC MASALA
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#777",
              marginTop: 3,
            }}
          >
            Management System
          </div>
        </div>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#191919",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Menu
        </button>
      </header>
      {/* Main */}
      <section
        style={{
          minHeight: "calc(100vh - 70px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 30,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: 48,
              lineHeight: 1.1,
              margin: "0 0 35px",
              fontWeight: 900,
            }}
          >
            Welcome to
            <br />
            <span style={{ color: "#ff7a00" }}>Tec Masala</span>
          </h1>
          {/* Cards */}
          <div
            style={{
              marginTop: 20,
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 15,
            }}
          >
            <InfoCard
              title="Outlets"
              text="Outlet management"
            />
            <InfoCard
              title="Products"
              text="Products & photos"
            />
            <InfoCard
              title="Stock"
              text="Stock management"
            />
            <InfoCard
              title="Orders"
              text="Order management"
            />
          </div>
          {/* Login Button */}
          <button
            onClick={() => {
              window.location.href = "/login";
            }}
            style={{
              marginTop: 40,
              padding: "14px 35px",
              border: 0,
              borderRadius: 10,
              background: "#ff7a00",
              color: "#111",
              fontSize: 16,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Outlet Login
          </button>
          {showMenu && (
            <div
              style={{
                margin: "25px auto 0",
                maxWidth: 300,
                padding: 18,
                borderRadius: 12,
                background: "#151515",
                border: "1px solid #292929",
                color: "#aaa",
              }}
            >
              <div style={{ marginBottom: 10 }}>Dashboard</div>
              <div style={{ marginBottom: 10 }}>Outlets</div>
              <div style={{ marginBottom: 10 }}>Products</div>
              <div style={{ marginBottom: 10 }}>Stock</div>
              <div>Orders</div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
function InfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        padding: 22,
        background: "#121212",
        border: "1px solid #282828",
        borderRadius: 14,
        textAlign: "left",
      }}
    >
      <div
        style={{
          color: "#ff7a00",
          fontSize: 18,
          fontWeight: 900,
          marginBottom: 7,
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: "#777",
          fontSize: 13,
        }}
      >
        {text}
      </div>
    </div>
  );
}