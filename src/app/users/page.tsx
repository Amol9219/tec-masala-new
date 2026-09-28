"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  db,
  LocalUser,
  UserRole,
  makeId,
  nowIso,
  deleteUser as deleteUserFromDb,
} from "@/lib/db";
const initialUsers: LocalUser[] = [
  {
    id: "user_admin_default",
    name: "Admin User",
    email: "admin@tecmasala.com",
    phone: "9876543210",
    role: "Admin",
    isActive: true,
    status: "active",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "user_manager_default",
    name: "Pune Manager",
    email: "pune@tecmasala.com",
    phone: "9876543211",
    role: "Manager",
    isActive: true,
    status: "active",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "user_staff_default",
    name: "Outlet Staff",
    email: "staff@tecmasala.com",
    phone: "9876543212",
    role: "Staff",
    isActive: false,
    status: "active",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];
export default function UsersPage() {
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState<"All" | UserRole>("All");
  const [statusFilter, setStatusFilter] =
    useState<"All" | "Active" | "Inactive">("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("Staff");
  const [status, setStatus] =
    useState<"Active" | "Inactive">("Active");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  /* =========================================================
     LOAD USERS
  ========================================================= */
  useEffect(() => {
    loadUsers();
  }, []);
  async function loadUsers() {
    try {
      setLoadingUsers(true);
      setError("");
      let databaseUsers = await db.users
        .where("status")
        .equals("active")
        .toArray();
      /*
       * First time database is empty:
       * create the demo/default users.
       */
      if (databaseUsers.length === 0) {
        await db.users.bulkPut(initialUsers);
        databaseUsers = await db.users
          .where("status")
          .equals("active")
          .toArray();
      }
      setUsers(databaseUsers);
    } catch (err) {
      console.error(err);
      setError("Users load करताना problem आला.");
    } finally {
      setLoadingUsers(false);
    }
  }
  /* =========================================================
     FILTER
  ========================================================= */
  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !searchValue ||
        user.name.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue) ||
        user.phone.includes(searchValue);
      const matchesRole =
        roleFilter === "All" ||
        user.role === roleFilter;
      const userStatus =
        user.isActive ? "Active" : "Inactive";
      const matchesStatus =
        statusFilter === "All" ||
        userStatus === statusFilter;
      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);
  /* =========================================================
     SUMMARY
  ========================================================= */
  const totalUsers = users.length;
  const activeUsers = users.filter(
    (user) => user.isActive
  ).length;
  const inactiveUsers = users.filter(
    (user) => !user.isActive
  ).length;
  const adminUsers = users.filter(
    (user) => user.role === "Admin"
  ).length;
  /* =========================================================
     FORM RESET
  ========================================================= */
  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setRole("Staff");
    setStatus("Active");
    setEditingId(null);
    setError("");
  }
  /* =========================================================
     ADD
  ========================================================= */
  function openAddForm() {
    resetForm();
    setMessage("");
    setShowForm(true);
  }
  /* =========================================================
     EDIT
  ========================================================= */
  function openEditForm(user: LocalUser) {
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setRole(user.role);
    setStatus(user.isActive ? "Active" : "Inactive");
    setEditingId(user.id);
    setMessage("");
    setError("");
    setShowForm(true);
  }
  /* =========================================================
     SAVE
  ========================================================= */
  async function saveUser(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");
    setError("");
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    if (!cleanName) {
      setError("User name टाका.");
      return;
    }
    if (!cleanEmail) {
      setError("Email टाका.");
      return;
    }
    if (!cleanEmail.includes("@")) {
      setError("Valid email टाका.");
      return;
    }
    if (!cleanPhone) {
      setError("Phone number टाका.");
      return;
    }
    if (cleanPhone.length < 10) {
      setError("Valid phone number टाका.");
      return;
    }
    try {
      const currentTime = nowIso();
      /* EDIT */
      if (editingId !== null) {
        await db.users.update(editingId, {
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          role,
          isActive: status === "Active",
          status: "active",
          updatedAt: currentTime,
          deletedAt: undefined,
        });
        setMessage("User successfully updated.");
      }
      /* ADD */
      else {
        const newUser: LocalUser = {
          id: makeId("user"),
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          role,
          isActive: status === "Active",
          status: "active",
          createdAt: currentTime,
          updatedAt: currentTime,
        };
        await db.users.add(newUser);
        setMessage("User successfully added.");
      }
      await loadUsers();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("User save करताना problem आला.");
    }
  }
  /* =========================================================
     DELETE
  ========================================================= */
  async function deleteUser(id: string) {
    const user = users.find(
      (item) => item.id === id
    );
    if (!user) return;
    const confirmed = window.confirm(
      `"${user.name}" delete करायचा आहे का?`
    );
    if (!confirmed) return;
    try {
      await deleteUserFromDb(
        id,
        "Deleted from Users page"
      );
      setMessage("User successfully deleted.");
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("User delete करताना problem आला.");
    }
  }
  /* =========================================================
     STATUS TOGGLE
  ========================================================= */
  async function toggleStatus(id: string) {
    const user = users.find(
      (item) => item.id === id
    );
    if (!user) return;
    try {
      await db.users.update(id, {
        isActive: !user.isActive,
        updatedAt: nowIso(),
      });
      setMessage("User status updated.");
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(
        "User status update करताना problem आला."
      );
    }
  }
  /* =========================================================
     LOADING
  ========================================================= */
  if (loadingUsers) {
    return (
      <main style={pageStyle}>
        <div style={loadingStyle}>
          <div style={loadingLogoStyle}>
            TEC MASALA
          </div>
          <div style={loadingTextStyle}>
            Loading Users...
          </div>
        </div>
      </main>
    );
  }
  /* =========================================================
     PAGE
  ========================================================= */
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
              Users आणि staff accounts manage करा.
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
        {/* MESSAGE */}
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
        {/* SUMMARY */}
        <section style={summaryGridStyle}>
          <SummaryCard
            title="Total Users"
            value={totalUsers.toString()}
            icon="👥"
          />
          <SummaryCard
            title="Active"
            value={activeUsers.toString()}
            icon="✅"
          />
          <SummaryCard
            title="Inactive"
            value={inactiveUsers.toString()}
            icon="⏸️"
          />
          <SummaryCard
            title="Admins"
            value={adminUsers.toString()}
            icon="🛡️"
          />
        </section>
        {/* USER FORM */}
        {showForm && (
          <section style={formCardStyle}>
            <div style={formHeaderStyle}>
              <h2 style={formTitleStyle}>
                {editingId !== null
                  ? "Edit User"
                  : "Add New User"}
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
            <form onSubmit={saveUser}>
              <div style={formGridStyle}>
                <Field
                  label="Full Name"
                  value={name}
                  placeholder="उदा. Rahul Patil"
                  onChange={setName}
                />
                <Field
                  label="Email"
                  value={email}
                  placeholder="उदा. rahul@tecmasala.com"
                  type="email"
                  onChange={setEmail}
                />
                <Field
                  label="Phone"
                  value={phone}
                  placeholder="उदा. 9876543210"
                  type="tel"
                  onChange={setPhone}
                />
                <div>
                  <label style={labelStyle}>
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(event) =>
                      setRole(
                        event.target.value as UserRole
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
                <div>
                  <label style={labelStyle}>
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target.value as
                          | "Active"
                          | "Inactive"
                      )
                    }
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
                    ? "Update User"
                    : "Save User"}
                </button>
              </div>
            </form>
          </section>
        )}
        {/* FILTERS */}
        <section style={filterSectionStyle}>
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Name, email किंवा phone search करा..."
            style={searchInputStyle}
          />
          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value as
                  | "All"
                  | UserRole
              )
            }
            style={filterSelectStyle}
          >
            <option value="All">
              All Roles
            </option>
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
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "All"
                  | "Active"
                  | "Inactive"
              )
            }
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
        {/* USER LIST */}
        <section style={listCardStyle}>
          <div style={listHeaderStyle}>
            <h2 style={sectionTitleStyle}>
              User List
            </h2>
            <span style={countStyle}>
              {filteredUsers.length} Records
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
                      User
                    </th>
                    <th style={thStyle}>
                      Email
                    </th>
                    <th style={thStyle}>
                      Phone
                    </th>
                    <th style={thStyle}>
                      Role
                    </th>
                    <th style={thStyle}>
                      Status
                    </th>
                    <th style={thStyle}>
                      Created
                    </th>
                    <th style={thStyle}>
                      Action
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
                        {user.email}
                      </td>
                      <td style={tdStyle}>
                        {user.phone}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            ...roleBadgeStyle,
                            color:
                              roleColor(user.role),
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() =>
                            toggleStatus(user.id)
                          }
                          style={{
                            ...statusBadgeStyle,
                            color:
                              user.isActive
                                ? "#69d98a"
                                : "#ff7070",
                            background:
                              user.isActive
                                ? "rgba(80,200,120,.08)"
                                : "rgba(255,70,70,.08)",
                            borderColor:
                              user.isActive
                                ? "rgba(80,200,120,.25)"
                                : "rgba(255,70,70,.25)",
                          }}
                        >
                          {user.isActive
                            ? "Active"
                            : "Inactive"}
                        </button>
                      </td>
                      <td style={tdStyle}>
                        {formatCreatedDate(
                          user.createdAt
                        )}
                      </td>
                      <td style={tdStyle}>
                        <div
                          style={actionGroupStyle}
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
                            style={deleteButtonStyle}
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
   ROLE COLOR
========================================================= */
function roleColor(role: UserRole) {
  switch (role) {
    case "Admin":
      return "#ff7a00";
    case "Manager":
      return "#6db7ff";
    case "Staff":
      return "#c18cff";
    default:
      return "#aaa";
  }
}
/* =========================================================
   CREATED DATE
========================================================= */
function formatCreatedDate(
  value: string
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}
/* =========================================================
   LOADING
========================================================= */
const loadingStyle: React.CSSProperties = {
  minHeight: "80vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};
const loadingLogoStyle: React.CSSProperties = {
  color: "#ff7a00",
  fontSize: 28,
  fontWeight: 1000,
  letterSpacing: 4,
};
const loadingTextStyle: React.CSSProperties = {
  marginTop: 12,
  color: "#777",
  fontSize: 13,
};
/* =========================================================
   PAGE
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
  display: "block",
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
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "1px solid #333",
  background: "#101010",
  color: "#aaa",
  fontSize: 20,
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
const filterSectionStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "1fr 180px 180px",
  gap: 12,
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
const filterSelectStyle: React.CSSProperties = {
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
  minWidth: 1050,
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
  padding: "6px 10px",
  borderRadius: 20,
  background: "#191919",
  border: "1px solid #333",
  fontSize: 11,
  fontWeight: 800,
};
const statusBadgeStyle: React.CSSProperties = {
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
};
const editButtonStyle: React.CSSProperties = {
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
const deleteButtonStyle: React.CSSProperties = {
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