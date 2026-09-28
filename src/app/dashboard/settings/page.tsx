"use client";
import { useState } from "react";
export default function AboutPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState("9834580376");
  const [email, setEmail] = useState(
    "amolkarbhari252000@gmail.com"
  );
  const [address, setAddress] = useState(
    "Sant Tukaram Nagar, Pimpri, Pune - 411018"
  );
  const [gstin, setGstin] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  function saveDetails() {
    setIsEditing(false);
    setSavedMessage("Company details successfully updated.");
    setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  }
  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        {/* HEADER */}
        <header style={headerStyle}>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
            style={backButtonStyle}
          >
            ← Dashboard
          </button>
          <div style={brandStyle}>
            TEC MASALA’S
          </div>
          <h1 style={titleStyle}>
            About TEC MASALA’S
          </h1>
          <p style={subtitleStyle}>
            Taste, Quality & Consistency
          </p>
        </header>
        {/* SUCCESS MESSAGE */}
        {savedMessage && (
          <div style={successStyle}>
            ✓ {savedMessage}
          </div>
        )}
        {/* COMPANY STORY */}
        <section style={cardStyle}>
          <div style={sectionBadgeStyle}>
            OUR STORY
          </div>
          <h2 style={headingStyle}>
            About TEC MASALA’S
          </h2>
          <div style={storyStyle}>
            <p>
              TEC MASALA’S started its journey in
              <strong> 2019</strong> with one simple
              goal — to provide our outlet partners
              and customers with delicious,
              high-quality and trusted spice blends.
            </p>
            <p>
              Every masala is prepared with great
              care, dedication and passion. We focus
              on taste, quality and consistency to
              create a flavour that stands apart.
            </p>
            <p>
              Many of our customers share the same
              feedback:
            </p>
            <div style={quoteStyle}>
              “Your masalas have a unique taste.
              It feels like the special touch of your
              hands. Can we get these masalas for
              home use as well?”
            </div>
            <p>
              This love and trust from our customers
              is our biggest achievement.
            </p>
            <p>
              Currently, TEC MASALA’S masalas are
              specially prepared for our outlet
              partners. Seeing the response and
              demand, we are working towards making
              our authentic masalas available for
              home use in the future as well.
            </p>
            <div style={beliefBoxStyle}>
              <div style={beliefLabelStyle}>
                OUR BELIEF
              </div>
              <div style={beliefTextStyle}>
                A great taste is one that creates
                memories and stays with you.
              </div>
            </div>
          </div>
        </section>
        {/* CONTACT DETAILS */}
        <section style={cardStyle}>
          <div style={contactHeaderStyle}>
            <div>
              <div style={sectionBadgeStyle}>
                CONTACT US
              </div>
              <h2 style={sectionTitleStyle}>
                Get In Touch
              </h2>
            </div>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setSavedMessage("");
                  setIsEditing(true);
                }}
                style={editButtonStyle}
              >
                ✏️ Edit Details
              </button>
            ) : (
              <div style={editActionsStyle}>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                  }}
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveDetails}
                  style={saveButtonStyle}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
          {isEditing ? (
            /* EDIT FORM */
            <div style={editFormStyle}>
              <EditableField
                label="Phone Number"
                value={phone}
                placeholder="9834580376"
                onChange={setPhone}
                type="tel"
              />
              <EditableField
                label="Email Address"
                value={email}
                placeholder="example@gmail.com"
                onChange={setEmail}
                type="email"
              />
              <EditableField
                label="Address"
                value={address}
                placeholder="Company address"
                onChange={setAddress}
              />
              <EditableField
                label="GSTIN"
                value={gstin}
                placeholder="Enter GSTIN"
                onChange={setGstin}
              />
            </div>
          ) : (
            /* DISPLAY */
            <div style={contactGridStyle}>
              {/* PHONE */}
              <a
                href={`tel:${phone}`}
                style={contactCardStyle}
              >
                <div style={contactIconStyle}>
                  📞
                </div>
                <div>
                  <div style={contactLabelStyle}>
                    Call
                  </div>
                  <div style={contactValueStyle}>
                    {phone || "Not Provided"}
                  </div>
                </div>
              </a>
              {/* EMAIL */}
              <a
                href={`mailto:${email}`}
                style={contactCardStyle}
              >
                <div style={contactIconStyle}>
                  ✉️
                </div>
                <div>
                  <div style={contactLabelStyle}>
                    Email
                  </div>
                  <div style={contactValueStyle}>
                    {email || "Not Provided"}
                  </div>
                </div>
              </a>
              {/* ADDRESS */}
              <div style={contactCardStyle}>
                <div style={contactIconStyle}>
                  📍
                </div>
                <div>
                  <div style={contactLabelStyle}>
                    Address
                  </div>
                  <div style={contactValueStyle}>
                    {address || "Not Provided"}
                  </div>
                </div>
              </div>
              {/* GSTIN */}
              <div style={contactCardStyle}>
                <div style={contactIconStyle}>
                  🧾
                </div>
                <div>
                  <div style={contactLabelStyle}>
                    GSTIN
                  </div>
                  <div style={contactValueStyle}>
                    {gstin || "Not Provided"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
        {/* COMPANY HIGHLIGHTS */}
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            What We Believe In
          </h2>
          <div style={featureGridStyle}>
            <Feature
              icon="🌶️"
              title="Authentic Taste"
              text="Authentic masala blends prepared with care and passion."
            />
            <Feature
              icon="⭐"
              title="Quality"
              text="We focus on maintaining high quality in every blend."
            />
            <Feature
              icon="🤝"
              title="Trust"
              text="Customer and outlet partner trust is our biggest achievement."
            />
            <Feature
              icon="❤️"
              title="Made With Passion"
              text="Every masala is prepared with dedication and attention to taste."
            />
          </div>
        </section>
        {/* FOOTER */}
        <footer style={footerStyle}>
          <div style={footerBrandStyle}>
            TEC MASALA’S
          </div>
          <p style={footerTextStyle}>
            Taste • Quality • Consistency
          </p>
          <p style={copyrightStyle}>
            © {new Date().getFullYear()} TEC MASALA’S.
            All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
/* =========================================================
   EDITABLE FIELD
========================================================= */
function EditableField({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label style={editLabelStyle}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={editInputStyle}
      />
    </div>
  );
}
/* =========================================================
   FEATURE
========================================================= */
function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div style={featureStyle}>
      <div style={featureIconStyle}>
        {icon}
      </div>
      <div>
        <div style={featureTitleStyle}>
          {title}
        </div>
        <div style={featureTextStyle}>
          {text}
        </div>
      </div>
    </div>
  );
}
/* =========================================================
   STYLES
========================================================= */
const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#080808",
  color: "#fff",
  padding: 20,
  fontFamily: "Arial, sans-serif",
  boxSizing: "border-box",
};
const containerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 1000,
  margin: "0 auto",
};
const headerStyle: React.CSSProperties = {
  marginBottom: 28,
};
const backButtonStyle: React.CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#888",
  padding: 0,
  marginBottom: 18,
  cursor: "pointer",
  fontSize: 13,
};
const brandStyle: React.CSSProperties = {
  color: "#ff7a00",
  fontSize: 25,
  fontWeight: 1000,
  letterSpacing: 3,
};
const titleStyle: React.CSSProperties = {
  margin: "9px 0 5px",
  fontSize: 32,
  fontWeight: 900,
};
const subtitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#888",
  fontSize: 14,
};
const successStyle: React.CSSProperties = {
  marginBottom: 18,
  padding: 13,
  borderRadius: 10,
  background: "rgba(80,200,120,.08)",
  border: "1px solid rgba(80,200,120,.25)",
  color: "#69d98a",
  fontSize: 13,
  fontWeight: 700,
};
const cardStyle: React.CSSProperties = {
  marginBottom: 20,
  padding: 28,
  borderRadius: 17,
  border: "1px solid #292929",
  background: "#151515",
};
const sectionBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  marginBottom: 12,
  padding: "6px 10px",
  borderRadius: 20,
  background: "rgba(255,122,0,.08)",
  border: "1px solid rgba(255,122,0,.2)",
  color: "#ff7a00",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: 1.5,
};
const headingStyle: React.CSSProperties = {
  margin: "0 0 20px",
  fontSize: 25,
  fontWeight: 900,
};
const storyStyle: React.CSSProperties = {
  color: "#aaa",
  fontSize: 14,
  lineHeight: 1.8,
};
const quoteStyle: React.CSSProperties = {
  margin: "20px 0",
  padding: "18px 20px",
  borderLeft: "3px solid #ff7a00",
  borderRadius: "0 10px 10px 0",
  background: "#101010",
  color: "#ddd",
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1.7,
  fontStyle: "italic",
};
const beliefBoxStyle: React.CSSProperties = {
  marginTop: 25,
  padding: 20,
  borderRadius: 12,
  background: "rgba(255,122,0,.06)",
  border: "1px solid rgba(255,122,0,.2)",
};
const beliefLabelStyle: React.CSSProperties = {
  color: "#ff7a00",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.5,
  marginBottom: 8,
};
const beliefTextStyle: React.CSSProperties = {
  color: "#fff",
  fontSize: 17,
  fontWeight: 800,
  lineHeight: 1.5,
};
const sectionTitleStyle: React.CSSProperties = {
  margin: "0 0 20px",
  fontSize: 21,
  fontWeight: 900,
};
const contactHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 15,
  marginBottom: 20,
  flexWrap: "wrap",
};
const editButtonStyle: React.CSSProperties = {
  border: "1px solid #333",
  borderRadius: 9,
  padding: "10px 14px",
  background: "#101010",
  color: "#ff7a00",
  fontWeight: 900,
  cursor: "pointer",
};
const editActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};
const cancelButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 9,
  border: "1px solid #333",
  background: "#101010",
  color: "#aaa",
  fontWeight: 800,
  cursor: "pointer",
};
const saveButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 9,
  border: 0,
  background: "#ff7a00",
  color: "#111",
  fontWeight: 900,
  cursor: "pointer",
};
const editFormStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 18,
};
const editLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 7,
  color: "#aaa",
  fontSize: 12,
  fontWeight: 800,
};
const editInputStyle: React.CSSProperties = {
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
const contactGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 14,
};
const contactCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 14,
  padding: 17,
  borderRadius: 11,
  background: "#101010",
  border: "1px solid #242424",
  textDecoration: "none",
  boxSizing: "border-box",
};
const contactIconStyle: React.CSSProperties = {
  fontSize: 22,
  minWidth: 28,
};
const contactLabelStyle: React.CSSProperties = {
  color: "#777",
  fontSize: 11,
  fontWeight: 800,
  marginBottom: 6,
};
const contactValueStyle: React.CSSProperties = {
  color: "#ddd",
  fontSize: 13,
  fontWeight: 800,
  lineHeight: 1.5,
};
const featureGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};
const featureStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 13,
  padding: 16,
  borderRadius: 11,
  background: "#101010",
  border: "1px solid #242424",
};
const featureIconStyle: React.CSSProperties = {
  fontSize: 23,
  minWidth: 28,
};
const featureTitleStyle: React.CSSProperties = {
  color: "#fff",
  fontSize: 14,
  fontWeight: 900,
  marginBottom: 5,
};
const featureTextStyle: React.CSSProperties = {
  color: "#777",
  fontSize: 12,
  lineHeight: 1.5,
};
const footerStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "28px 10px",
};
const footerBrandStyle: React.CSSProperties = {
  color: "#ff7a00",
  fontSize: 16,
  fontWeight: 1000,
  letterSpacing: 3,
};
const footerTextStyle: React.CSSProperties = {
  margin: "7px 0 0",
  color: "#777",
  fontSize: 12,
};
const copyrightStyle: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#555",
  fontSize: 11,
};