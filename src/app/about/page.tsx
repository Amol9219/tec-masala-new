"use client";
import { useMemo, useState } from "react";
type UserRole = "Admin" | "Manager" | "Staff";
type UserItem = {
  id: number;
  name: string;
  loginId: string;
  role: UserRole;
  active: boolean;
  updatedAt: string;
};
const initialUsers: UserItem[] = [
  {
    id: 1,
    name: "Admin",
    loginId: "admin",
    role: "Admin",
    active: true,
    updatedAt: "Today",
  },
  {
    id: 2,
    name: "Outlet Manager",
    loginId: "manager",
    role: "Manager",
    active: true,
    updatedAt: "Today",
  },
];
export default function UsersPage() {
  const [users, setUsers] =
    useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] =
    useState<number | null>(null);
  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] =
    useState<UserRole>("Staff");
  const [showPassword, setShowPassword] =
    useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(value) ||
        user.loginId.toLowerCase().includes(value) ||
        user.role.toLowerCase().includes(value)
    );
  }, [users, search]);
  const activeCount = users.filter(
    (user) => user.active
  ).length;
  const inactiveCount = users.filter(
    (user) => !user.active
  ).length;
  function resetForm() {
    setName("");
    setLoginId("");
    setPassword("");
    setRole("Staff");
    setEditingId(null);
    setShowPassword(false);
    setError("");
  }
  function openAddForm() {
    resetForm();
    setMessage("");
    setShowForm(true);
  }
  function openEditForm(user: UserItem) {
    setMessage("");
    setError("");
    setEditingId(user.id);
    setName(user.name);
    setLoginId(user.loginId);
    setPassword("");
    setRole(user.role);
    setShowPassword(false);
    setShowForm(true);
  }
  function saveUser(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setMessage("");
    const cleanName = name.trim();
    const cleanLoginId = loginId.trim();
    if (!cleanName) {
      setError("Name टाका.");
      return;
    }
    if (!cleanLoginId) {
      setError("Login ID टाका.");
      return;
    }
    if (editingId === null && !password) {
      setError("Password टाका.");
      return;
    }
    const duplicate = users.find(
      (user) =>
        user.loginId.toLowerCase() ===
          cleanLoginId.toLowerCase() &&
        user.id !== editingId
    );
    if (duplicate) {
      setError("हा Login ID आधीपासून वापरात आहे.");
      return;
    }
    if (editingId !== null) {
      setUsers((current) =>
        current.map((user) =>
          user.id === editingId
            ? {
                ...user,
                name: cleanName,
                loginId: cleanLoginId,
                role,
                updatedAt: "Just now",
              }
            : user
        )
      );
      setMessage("User successfully updated.");
    } else {
      const newUser: UserItem = {
        id: Date.now(),
        name: cleanName,
        loginId: cleanLoginId,
        role,
        active: true,
        updatedAt: "Just now",
      };
      setUsers((current) => [
        newUser,
        ...current,
      ]);
      setMessage("User successfully added.");
    }
    resetForm();
    setShowForm(false);
  }
  function toggleUser(userId: number) {
    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              active: !user.active,
              updatedAt: "Just now",
            }
          : user
      )
    );
    setMessage("User status updated.");
  }
  function deleteUser(userId: number) {
    const user = users.find(
      (item) => item.id === userId
    );
    if (!user) return;
    const confirmed = window.confirm(
      `"${user.name}" user delete करायचा आहे का?`
    );
    if (!confirmed) return;
    setUsers((current) =>
      current.filter(
        (item) => item.id !== userId
      )
    );
    setMessage("User deleted successfully.");
  }
  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        {/* HEADER */}
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
            <div style={brandStyle}>
              TEC MASALA
            </div>
            <h1 style={titleStyle}>
              Users
            </h1>
            <p style={subtitleStyle}>
              Users आणि access manage करा.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddForm}
            style={addButtonStyle}
          >
            + Add User
          </button>
        </header>
        {/* MESSAGES */}
        {message && (
          <div style={successStyle}>
            ✓ {message}
          </div>
        )}
        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}
        {/* SUMMARY */}
        <section style={summaryGridStyle}>
          <SummaryCard
            title="Total Users"
            value={users.length.toString()}
            icon="👥"
          />
          <SummaryCard
            title="Active"
            value={activeCount.toString()}
            icon="🟢"
          />
          <SummaryCard
            title="Inactive"
            value={inactiveCount.toString()}
            icon="🔴"
          />
        </section>
        {/* ADD / EDIT FORM */}
        {showForm && (
          <section style={formCardStyle}>
            <div style={formHeaderStyle}>
              <h2 style={formTitleStyle}>
                {editingId !== null
                  ? "Edit User"
                  : "Add User"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                style={closeButtonStyle}
              >
                ✕
              </button>
            </div>
            <form onSubmit={saveUser}>
              <div style={formGridStyle}>
                <Field
                  label="Name"
                  value={name}
                  placeholder="उदा. Amol"
                  onChange={setName}
                />
                <Field
                  label="Login ID"
                  value={loginId}
                  placeholder="उदा. amol"
                  onChange={setLoginId}
                />
                <div>
                  <label style={labelStyle}>
                    Password
                  </label>
                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      placeholder={
                        editingId !== null
                          ? "नवीन password असल्यास टाका"
                          : "Password"
                      }
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      style={{
                        ...inputStyle,
                        paddingRight: 65,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      style={showButtonStyle}
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(event) =>
                      setRole(
                        event.target
                          .value as UserRole
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="Admin">
                      Admin
                    </option>
                    <option value="Manager">
                      Manager
                    </option>
                    <option value="Staff">
                      Staff
                    </option>
                  </select>
                </div>
              </div>
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
                  style={saveButtonStyle}
                >
                  {editingId !== null
                    ? "Save Changes"
                    : "Add User"}
                </button>
              </div>
            </form>
          </section>
        )}
        {/* SEARCH */}
        <section style={searchSectionStyle}>
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Name, Login ID किंवा Role search करा..."
            style={searchInputStyle}
          />
        </section>
        {/* USERS LIST */}
        <section style={listCardStyle}>
          <div style={listHeaderStyle}>
            <h2 style={sectionTitleStyle}>
              User List
            </h2>
            <span style={countStyle}>
              {filteredUsers.length} Users
            </span>
          </div>
          {filteredUsers.length === 0 ? (
            <div style={emptyStyle}>
              <div style={emptyIconStyle}>
                👥
              </div>
              <div style={emptyTitleStyle}>
                No users found
              </div>
              <p style={emptyTextStyle}>
                Add User वर click करून user तयार करा.
              </p>
            </div>
          ) : (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>
                      Name
                    </th>
                    <th style={thStyle}>
                      Login ID
                    </th>
                    <th style={thStyle}>
                      Role
                    </th>
                    <th style={thStyle}>
                      Status
                    </th>
                    <th style={thStyle}>
                      Updated
                    </th>
                    <th style={thStyle}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td style={tdStyle}>
                        <strong>
                          {user.name}
                        </strong>
                      </td>
                      <td style={tdStyle}>
                        {user.loginId}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={
                            roleBadgeStyle
                          }
                        >
                          {user.role}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() =>
                            toggleUser(user.id)
                          }
                          style={{
                            ...statusButtonStyle,
                            color: user.active
                              ? "#69d98a"
                              : "#ff7070",
                            borderColor:
                              user.active
                                ? "rgba(80,200,120,.25)"
                                : "rgba(255,70,70,.25)",
                            background:
                              user.active
                                ? "rgba(80,200,120,.08)"
                                : "rgba(255,70,70,.08)",
                          }}
                        >
                          {user.active
                            ? "Active"
                            : "Inactive"}
                        </button>
                      </td>
                      <td style={tdStyle}>
                        {user.updatedAt}
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
                              openEditForm(user)
                            }
                            style={editButtonStyle}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              deleteUser(user.id)
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
/* =========================================================
   FIELD
========================================================= */
function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>
      <input
        type="text"
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
/* =========================================================
   SUMMARY CARD
========================================================= */
function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
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
  maxWidth: 1200,
  margin: "0 auto",
};
const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 20,
  marginBottom: 28,
  flexWrap: "wrap",
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
  fontSize: 24,
  fontWeight: 1000,
  letterSpacing: 3,
};
const titleStyle: React.CSSProperties = {
  margin: "8px 0 4px",
  fontSize: 32,
  fontWeight: 900,
};
const subtitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#888",
  fontSize: 14,
};
const addButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 10,
  padding: "13px 18px",
  background: "#ff7a00",
  color: "#111",
  fontWeight: 900,
  cursor: "pointer",
};
const successStyle: React.CSSProperties = {
  marginBottom: 15,
  padding: 13,
  borderRadius: 10,
  background: "rgba(80,200,120,.08)",
  border:
    "1px solid rgba(80,200,120,.25)",
  color: "#69d98a",
  fontSize: 13,
  fontWeight: 700,
};
const errorStyle: React.CSSProperties = {
  marginBottom: 15,
  padding: 13,
  borderRadius: 10,
  background: "rgba(255,70,70,.08)",
  border:
    "1px solid rgba(255,70,70,.25)",
  color: "#ff7070",
  fontSize: 13,
  fontWeight: 700,
};
const summaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 15,
  marginBottom: 22,
};
const summaryCardStyle: React.CSSProperties = {
  padding: 19,
  borderRadius: 14,
  border: "1px solid #292929",
  background: "#151515",
};
const summaryTopStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
};
const summaryIconStyle: React.CSSProperties = {
  fontSize: 19,
};
const summaryLabelStyle: React.CSSProperties = {
  color: "#888",
  fontSize: 12,
  fontWeight: 800,
};
const summaryValueStyle: React.CSSProperties = {
  marginTop: 10,
  color: "#ff7a00",
  fontSize: 28,
  fontWeight: 900,
};
const formCardStyle: React.CSSProperties = {
  marginBottom: 22,
  padding: 22,
  borderRadius: 16,
  border: "1px solid #292929",
  background: "#151515",
};
const formHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 20,
};
const formTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 900,
};
const closeButtonStyle: React.CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#777",
  fontSize: 18,
  cursor: "pointer",
};
const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 18,
};
const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 7,
  color: "#aaa",
  fontSize: 13,
  fontWeight: 700,
};
const inputStyle: React.CSSProperties = {
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
const showButtonStyle: React.CSSProperties = {
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
const formActionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 22,
};
const cancelButtonStyle: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 9,
  border: "1px solid #333",
  background: "#101010",
  color: "#aaa",
  fontWeight: 800,
  cursor: "pointer",
};
const saveButtonStyle: React.CSSProperties = {
  padding: "12px 20px",
  borderRadius: 9,
  border: 0,
  background: "#ff7a00",
  color: "#111",
  fontWeight: 900,
  cursor: "pointer",
};
const searchSectionStyle: React.CSSProperties = {
  marginBottom: 18,
};
const searchInputStyle: React.CSSProperties = {
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
const listCardStyle: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid #292929",
  background: "#111",
  overflow: "hidden",
};
const listHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 20,
  borderBottom: "1px solid #292929",
};
const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 19,
  fontWeight: 900,
};
const countStyle: React.CSSProperties = {
  color: "#777",
  fontSize: 13,
};
const tableWrapperStyle: React.CSSProperties = {
  width: "100%",
  overflowX: "auto",
};
const tableStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 900,
  borderCollapse: "collapse",
};
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 18px",
  color: "#777",
  fontSize: 12,
  fontWeight: 800,
  borderBottom: "1px solid #292929",
};
const tdStyle: React.CSSProperties = {
  padding: "15px 18px",
  color: "#ccc",
  fontSize: 13,
  borderBottom: "1px solid #202020",
};
const roleBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 9px",
  borderRadius: 20,
  background: "rgba(255,122,0,.08)",
  border: "1px solid rgba(255,122,0,.2)",
  color: "#ff7a00",
  fontSize: 11,
  fontWeight: 800,
};
const statusButtonStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 20,
  border: "1px solid",
  fontSize: 11,
  fontWeight: 800,
  cursor: "pointer",
};
const actionGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: 7,
  alignItems: "center",
};
const editButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #333",
  background: "#191919",
  color: "#ff7a00",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};
const deleteButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border:
    "1px solid rgba(255,70,70,.25)",
  background: "rgba(255,70,70,.06)",
  color: "#ff7070",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};
const emptyStyle: React.CSSProperties = {
  padding: 50,
  textAlign: "center",
};
const emptyIconStyle: React.CSSProperties = {
  fontSize: 36,
  marginBottom: 10,
};
const emptyTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  marginBottom: 5,
};
const emptyTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#777",
  fontSize: 13,
};