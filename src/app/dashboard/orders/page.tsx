"use client";
import { useMemo, useState } from "react";
type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Completed"
  | "Cancelled";
type Order = {
  id: number;
  orderNumber: string;
  outlet: string;
  items: number;
  total: number;
  status: OrderStatus;
  orderDate: string;
};
const initialOrders: Order[] = [
  {
    id: 1,
    orderNumber: "ORD-1001",
    outlet: "Pune Outlet",
    items: 5,
    total: 1250,
    status: "Pending",
    orderDate: "Today",
  },
  {
    id: 2,
    orderNumber: "ORD-1002",
    outlet: "Mumbai Outlet",
    items: 8,
    total: 2480,
    status: "Confirmed",
    orderDate: "Today",
  },
  {
    id: 3,
    orderNumber: "ORD-1003",
    outlet: "Nashik Outlet",
    items: 3,
    total: 840,
    status: "Processing",
    orderDate: "Yesterday",
  },
];
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"All" | OrderStatus>("All");
  const [showForm, setShowForm] = useState(false);
  const [editingOrderId, setEditingOrderId] =
    useState<number | null>(null);
  const [outlet, setOutlet] = useState("");
  const [items, setItems] = useState("");
  const [total, setTotal] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !searchValue ||
        order.orderNumber
          .toLowerCase()
          .includes(searchValue) ||
        order.outlet
          .toLowerCase()
          .includes(searchValue);
      const matchesStatus =
        statusFilter === "All" ||
        order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;
  const completedOrders = orders.filter(
    (order) => order.status === "Completed"
  ).length;
  const totalSales = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce((sum, order) => sum + order.total, 0);
  function resetForm() {
    setOutlet("");
    setItems("");
    setTotal("");
    setError("");
    setEditingOrderId(null);
  }
  function openAddForm() {
    resetForm();
    setMessage("");
    setError("");
    setShowForm(true);
  }
  function openEditForm(order: Order) {
    setEditingOrderId(order.id);
    setOutlet(order.outlet);
    setItems(order.items.toString());
    setTotal(order.total.toString());
    setMessage("");
    setError("");
    setShowForm(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  function saveOrder(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");
    const cleanOutlet = outlet.trim();
    const itemCount = Number(items);
    const orderTotal = Number(total);
    if (!cleanOutlet) {
      setError("Outlet name टाका.");
      return;
    }
    if (
      items === "" ||
      Number.isNaN(itemCount) ||
      itemCount <= 0
    ) {
      setError("Items ची संख्या योग्य टाका.");
      return;
    }
    if (
      total === "" ||
      Number.isNaN(orderTotal) ||
      orderTotal < 0
    ) {
      setError("Order total योग्य टाका.");
      return;
    }
    // EDIT EXISTING ORDER
    if (editingOrderId !== null) {
      setOrders((current) =>
        current.map((order) =>
          order.id === editingOrderId
            ? {
                ...order,
                outlet: cleanOutlet,
                items: itemCount,
                total: orderTotal,
                orderDate: "Just now",
              }
            : order
        )
      );
      const editedOrder = orders.find(
        (order) => order.id === editingOrderId
      );
      resetForm();
      setShowForm(false);
      setMessage(
        `${editedOrder?.orderNumber || "Order"} successfully updated.`
      );
      return;
    }
    // CREATE NEW ORDER
    const nextNumber =
      1001 + orders.length;
    const newOrder: Order = {
      id: Date.now(),
      orderNumber: `ORD-${nextNumber}`,
      outlet: cleanOutlet,
      items: itemCount,
      total: orderTotal,
      status: "Pending",
      orderDate: "Just now",
    };
    setOrders((current) => [
      newOrder,
      ...current,
    ]);
    resetForm();
    setShowForm(false);
    setMessage(
      `${newOrder.orderNumber} successfully created.`
    );
  }
  function changeStatus(
    id: number,
    status: OrderStatus
  ) {
    setOrders((current) =>
      current.map((order) =>
        order.id === id
          ? {
              ...order,
              status,
              orderDate: "Just now",
            }
          : order
      )
    );
    setMessage(
      `Order status changed to ${status}.`
    );
  }
  function deleteOrder(id: number) {
    const order = orders.find(
      (item) => item.id === id
    );
    if (!order) return;
    const confirmed = window.confirm(
      `${order.orderNumber} delete करायचा आहे का?`
    );
    if (!confirmed) return;
    setOrders((current) =>
      current.filter((item) => item.id !== id)
    );
    setMessage(
      `${order.orderNumber} deleted.`
    );
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
              Orders
            </h1>
            <p style={subtitleStyle}>
              Outlet orders एकाच ठिकाणी manage करा.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (showForm) {
                resetForm();
                setShowForm(false);
              } else {
                openAddForm();
              }
            }}
            style={addButtonStyle}
          >
            {showForm
              ? "Close"
              : "+ New Order"}
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
            title="Total Orders"
            value={totalOrders.toString()}
            icon="🧾"
          />
          <SummaryCard
            title="Pending"
            value={pendingOrders.toString()}
            icon="⏳"
          />
          <SummaryCard
            title="Completed"
            value={completedOrders.toString()}
            icon="✅"
          />
          <SummaryCard
            title="Total Sales"
            value={`₹${totalSales.toLocaleString(
              "en-IN"
            )}`}
            icon="₹"
          />
        </section>
        {/* ADD / EDIT FORM */}
        {showForm && (
          <section style={formCardStyle}>
            <h2 style={formTitleStyle}>
              {editingOrderId !== null
                ? "Edit Order"
                : "Create New Order"}
            </h2>
            <form onSubmit={saveOrder}>
              <div style={formGridStyle}>
                <Field
                  label="Outlet Name"
                  value={outlet}
                  placeholder="उदा. Pune Outlet"
                  onChange={setOutlet}
                />
                <Field
                  label="Number of Items"
                  value={items}
                  placeholder="उदा. 5"
                  type="number"
                  onChange={setItems}
                />
                <Field
                  label="Order Total"
                  value={total}
                  placeholder="उदा. 1250"
                  type="number"
                  onChange={setTotal}
                />
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
                  {editingOrderId !== null
                    ? "Update Order"
                    : "Create Order"}
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
            placeholder="Order ID किंवा outlet search करा..."
            style={searchInputStyle}
          />
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "All"
                  | OrderStatus
              )
            }
            style={filterSelectStyle}
          >
            <option value="All">
              All Status
            </option>
            <option value="Pending">
              Pending
            </option>
            <option value="Confirmed">
              Confirmed
            </option>
            <option value="Processing">
              Processing
            </option>
            <option value="Completed">
              Completed
            </option>
            <option value="Cancelled">
              Cancelled
            </option>
          </select>
        </section>
        {/* ORDERS LIST */}
        <section style={listCardStyle}>
          <div style={listHeaderStyle}>
            <h2 style={sectionTitleStyle}>
              Order List
            </h2>
            <span style={countStyle}>
              {filteredOrders.length} Records
            </span>
          </div>
          {filteredOrders.length === 0 ? (
            <div style={emptyStyle}>
              <div style={emptyIconStyle}>
                🧾
              </div>
              <div style={emptyTitleStyle}>
                No orders found
              </div>
              <p style={emptyTextStyle}>
                New Order वर click करून order तयार करा.
              </p>
            </div>
          ) : (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>
                      Order
                    </th>
                    <th style={thStyle}>
                      Outlet
                    </th>
                    <th style={thStyle}>
                      Items
                    </th>
                    <th style={thStyle}>
                      Total
                    </th>
                    <th style={thStyle}>
                      Status
                    </th>
                    <th style={thStyle}>
                      Date
                    </th>
                    <th style={thStyle}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(
                    (order) => (
                      <tr key={order.id}>
                        <td style={tdStyle}>
                          <strong>
                            {order.orderNumber}
                          </strong>
                        </td>
                        <td style={tdStyle}>
                          {order.outlet}
                        </td>
                        <td style={tdStyle}>
                          {order.items}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            color: "#ff7a00",
                            fontWeight: 900,
                          }}
                        >
                          ₹
                          {order.total.toLocaleString(
                            "en-IN"
                          )}
                        </td>
                        <td style={tdStyle}>
                          <select
                            value={order.status}
                            onChange={(event) =>
                              changeStatus(
                                order.id,
                                event.target
                                  .value as OrderStatus
                              )
                            }
                            style={{
                              ...statusSelectStyle,
                              color:
                                statusColor(
                                  order.status
                                ),
                            }}
                          >
                            <option value="Pending">
                              Pending
                            </option>
                            <option value="Confirmed">
                              Confirmed
                            </option>
                            <option value="Processing">
                              Processing
                            </option>
                            <option value="Completed">
                              Completed
                            </option>
                            <option value="Cancelled">
                              Cancelled
                            </option>
                          </select>
                        </td>
                        <td style={tdStyle}>
                          {order.orderDate}
                        </td>
                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              gap: 7,
                              flexWrap: "wrap",
                            }}
                          >
                            {/* EDIT */}
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(order)
                              }
                              style={
                                editButtonStyle
                              }
                            >
                              Edit
                            </button>
                            {/* DELETE */}
                            <button
                              type="button"
                              onClick={() =>
                                deleteOrder(
                                  order.id
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
        min={
          type === "number"
            ? "0"
            : undefined
        }
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
   STATUS COLOR
========================================================= */
function statusColor(
  status: OrderStatus
) {
  switch (status) {
    case "Pending":
      return "#ffbd45";
    case "Confirmed":
      return "#6db7ff";
    case "Processing":
      return "#c18cff";
    case "Completed":
      return "#69d98a";
    case "Cancelled":
      return "#ff7070";
    default:
      return "#aaa";
  }
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
const formTitleStyle: React.CSSProperties = {
  margin: "0 0 20px",
  fontSize: 20,
  fontWeight: 900,
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
    "1fr 190px",
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
  minWidth: 1000,
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
const statusSelectStyle: React.CSSProperties = {
  padding: "7px 9px",
  borderRadius: 8,
  border: "1px solid #333",
  background: "#191919",
  outline: "none",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};
const editButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,122,0,.3)",
  background: "rgba(255,122,0,.08)",
  color: "#ff9a3d",
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