"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
type Module = {
  title: string;
  description: string;
  icon: string;
  path: string;
};
const modules: Module[] = [
  {
    title: "Outlets",
    description: "सर्व outlets manage करा.",
    icon: "🏪",
    path: "/dashboard/outlets",
  },
  {
    title: "Products",
    description: "Products आणि categories manage करा.",
    icon: "📦",
    path: "/dashboard/products",
  },
  {
    title: "Stock",
    description: "Stock आणि inventory manage करा.",
    icon: "📊",
    path: "/dashboard/stock",
  },
  {
    title: "Prices",
    description: "Product prices आणि margins manage करा.",
    icon: "🏷️",
    path: "/dashboard/prices",
  },
  {
    title: "Orders",
    description: "सर्व outlet orders manage करा.",
    icon: "🧾",
    path: "/dashboard/orders",
  },
  {
    title: "Users",
    description: "Owner, Manager आणि Staff users manage करा.",
    icon: "👥",
    path: "/users",
  },
  {
    title: "Settings",
    description: "Business आणि account settings manage करा.",
    icon: "⚙️",
    path: "/dashboard/settings",
  },
];
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [role, setRole] = useState("Unknown");
  useEffect(() => {
    checkUser();
  }, []);
  async function checkUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setUserEmail(user.email ?? "");
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        console.error("Role error:", error);
        setRole("Unknown");
      } else {
        setRole(data?.role ?? "Unknown");
      }
    } catch (error) {
      console.error(error);
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }
  function openModule(path: string) {
    window.location.href = path;
  }
  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={loadingStyle}>
          <div style={loadingLogoStyle}>TEC MASALA</div>
          <div style={loadingTitleStyle}>
            Dashboard Loading...
          </div>
          <div style={loadingTextStyle}>
            Account permission तपासत आहोत...
          </div>
        </div>
      </main>
    );
  }
  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        {/* HEADER */}
        <header style={headerStyle}>
          <div>
            <div style={logoStyle}>
              TEC MASALA
            </div>
            <h1 style={titleStyle}>
              Dashboard
            </h1>
            <p style={subtitleStyle}>
              TEC Masala business management system
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={logoutButtonStyle}
          >
            Logout
          </button>
        </header>
        {/* ACCOUNT */}
        <section style={accountStyle}>
          <div>
            <div style={accountLabelStyle}>
              LOGGED IN AS
            </div>
            <div style={emailStyle}>
              {userEmail}
            </div>
          </div>
          <div style={roleBadgeStyle}>
            👑 {role}
          </div>
        </section>
        {/* WELCOME */}
        <section style={welcomeStyle}>
          <div style={welcomeSmallStyle}>
            WELCOME TO
          </div>
          <div style={welcomeTitleStyle}>
            TEC MASALA
          </div>
          <p style={welcomeTextStyle}>
            तुमच्या business मधील management modules खाली
            दिले आहेत.
          </p>
        </section>
        {/* OWNER */}
        {role === "Owner" && (
          <section style={ownerStyle}>
            <div style={ownerIconStyle}>
              👑
            </div>
            <div>
              <div style={ownerTitleStyle}>
                Owner Access
              </div>
              <div style={ownerTextStyle}>
                तुम्हाला सर्व management modules चा access आहे.
              </div>
            </div>
          </section>
        )}
        {/* MODULES */}
        <section>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>
                Management
              </h2>
              <p style={sectionTextStyle}>
                Business मधील सर्व मुख्य कामे.
              </p>
            </div>
            <div style={countStyle}>
              {modules.length} Modules
            </div>
          </div>
          <div style={gridStyle}>
            {modules.map((module) => (
              <button
                key={module.title}
                type="button"
                onClick={() => openModule(module.path)}
                style={cardStyle}
                onMouseEnter={(event) => {
                  event.currentTarget.style.borderColor =
                    "#ff7a00";
                  event.currentTarget.style.transform =
                    "translateY(-4px)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.borderColor =
                    "#292929";
                  event.currentTarget.style.transform =
                    "translateY(0)";
                }}
              >
                <div style={iconStyle}>
                  {module.icon}
                </div>
                <h3 style={cardTitleStyle}>
                  {module.title}
                </h3>
                <p style={cardDescriptionStyle}>
                  {module.description}
                </p>
                <div style={arrowStyle}>
                  →
                </div>
              </button>
            ))}
          </div>
        </section>
        {/* FOOTER */}
        <footer style={footerStyle}>
          TEC MASALA MANAGEMENT
        </footer>
      </div>
    </main>
  );
}
/* =========================
   STYLES
========================= */
const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#080808",
  color: "#fff",
  padding: 20,
  boxSizing: "border-box",
  fontFamily: "Arial, sans-serif",
};
const containerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 1200,
  margin: "0 auto",
};
const loadingStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};
const loadingLogoStyle: React.CSSProperties = {
  color: "#ff7a00",
  fontSize: 28,
  fontWeight: 900,
  letterSpacing: 4,
};
const loadingTitleStyle: React.CSSProperties = {
  marginTop: 18,
  fontSize: 20,
  fontWeight: 900,
};
const loadingTextStyle: React.CSSProperties = {
  marginTop: 8,
  color: "#777",
  fontSize: 13,
};
const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
  marginBottom: 22,
  flexWrap: "wrap",
};
const logoStyle: React.CSSProperties = {
  color: "#ff7a00",
  fontSize: 25,
  fontWeight: 900,
  letterSpacing: 3,
};
const titleStyle: React.CSSProperties = {
  margin: "7px 0 4px",
  fontSize: 34,
  fontWeight: 900,
};
const subtitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#888",
  fontSize: 14,
};
const logoutButtonStyle: React.CSSProperties = {
  padding: "11px 18px",
  borderRadius: 9,
  border: "1px solid #333",
  background: "#151515",
  color: "#aaa",
  fontWeight: 800,
  cursor: "pointer",
};
const accountStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 15,
  padding: 16,
  marginBottom: 18,
  borderRadius: 13,
  border: "1px solid #292929",
  background: "#101010",
  flexWrap: "wrap",
};
const accountLabelStyle: React.CSSProperties = {
  color: "#666",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: 1.5,
};
const emailStyle: React.CSSProperties = {
  marginTop: 5,
  color: "#ddd",
  fontSize: 13,
  fontWeight: 700,
};
const roleBadgeStyle: React.CSSProperties = {
  padding: "8px 13px",
  borderRadius: 20,
  background: "rgba(255,122,0,.10)",
  border: "1px solid rgba(255,122,0,.25)",
  color: "#ff7a00",
  fontSize: 12,
  fontWeight: 900,
};
const welcomeStyle: React.CSSProperties = {
  padding: 28,
  borderRadius: 18,
  border: "1px solid #292929",
  background:
    "linear-gradient(135deg,#181818,#101010)",
  marginBottom: 18,
};
const welcomeSmallStyle: React.CSSProperties = {
  color: "#777",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 2,
};
const welcomeTitleStyle: React.CSSProperties = {
  marginTop: 7,
  color: "#ff7a00",
  fontSize: 30,
  fontWeight: 900,
  letterSpacing: 2,
};
const welcomeTextStyle: React.CSSProperties = {
  margin: "9px 0 0",
  color: "#aaa",
  fontSize: 14,
};
const ownerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: 16,
  marginBottom: 28,
  borderRadius: 13,
  background:
    "linear-gradient(135deg,rgba(255,122,0,.13),rgba(255,122,0,.04))",
  border: "1px solid rgba(255,122,0,.25)",
};
const ownerIconStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 10,
  background: "rgba(255,122,0,.12)",
  fontSize: 20,
};
const ownerTitleStyle: React.CSSProperties = {
  color: "#ff7a00",
  fontSize: 14,
  fontWeight: 900,
};
const ownerTextStyle: React.CSSProperties = {
  marginTop: 4,
  color: "#999",
  fontSize: 12,
};
const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 20,
  marginBottom: 15,
};
const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 21,
  fontWeight: 900,
};
const sectionTextStyle: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#777",
  fontSize: 13,
};
const countStyle: React.CSSProperties = {
  color: "#777",
  fontSize: 12,
  fontWeight: 800,
};
const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 15,
};
const cardStyle: React.CSSProperties = {
  position: "relative",
  minHeight: 175,
  padding: 20,
  borderRadius: 15,
  border: "1px solid #292929",
  background: "#151515",
  color: "#fff",
  textAlign: "left",
  cursor: "pointer",
  transition:
    "border-color .2s ease,transform .2s ease",
};
const iconStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 12,
  background: "#202020",
  fontSize: 24,
  marginBottom: 20,
};
const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 19,
  fontWeight: 900,
};
const cardDescriptionStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#888",
  fontSize: 13,
  lineHeight: 1.5,
  paddingRight: 20,
};
const arrowStyle: React.CSSProperties = {
  position: "absolute",
  right: 18,
  bottom: 18,
  color: "#ff7a00",
  fontSize: 22,
  fontWeight: 900,
};
const footerStyle: React.CSSProperties = {
  padding: "40px 0 10px",
  textAlign: "center",
  color: "#444",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 2,
};