"use client";
import { useMemo, useState } from "react";
type StockItem = {
  id: number;
  productName: string;
  category: string;
  quantity: number;
  minimumQuantity: number;
  unit: string;
  updatedAt: string;
};
const initialStock: StockItem[] = [
  {
    id: 1,
    productName: "Masala Tea",
    category: "Beverages",
    quantity: 50,
    minimumQuantity: 10,
    unit: "Pack",
    updatedAt: "Today",
  },
  {
    id: 2,
    productName: "Special Masala",
    category: "Masala",
    quantity: 12,
    minimumQuantity: 10,
    unit: "Kg",
    updatedAt: "Today",
  },
];
export default function StockPage() {
  const [stock, setStock] =
    useState<StockItem[]>(initialStock);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] =
    useState(false);
  const [editingId, setEditingId] =
    useState<number | null>(null);
  const [productName, setProductName] =
    useState("");
  const [category, setCategory] =
    useState("");
  const [quantity, setQuantity] =
    useState("");
  const [minimumQuantity, setMinimumQuantity] =
    useState("");
  const [unit, setUnit] =
    useState("Pack");
  const [message, setMessage] =
    useState("");
  const [error, setError] =
    useState("");
  const filteredStock = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();
    if (!value) return stock;
    return stock.filter(
      (item) =>
        item.productName
          .toLowerCase()
          .includes(value) ||
        item.category
          .toLowerCase()
          .includes(value)
    );
  }, [stock, search]);
  const totalQuantity = stock.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );
  const availableCount = stock.filter(
    (item) =>
      item.quantity >
      item.minimumQuantity
  ).length;
  const lowStockCount = stock.filter(
    (item) =>
      item.quantity > 0 &&
      item.quantity <=
        item.minimumQuantity
  ).length;
  const outOfStockCount = stock.filter(
    (item) =>
      item.quantity === 0
  ).length;
  function resetForm() {
    setProductName("");
    setCategory("");
    setQuantity("");
    setMinimumQuantity("");
    setUnit("Pack");
    setError("");
    setEditingId(null);
  }
  function openAddForm() {
    resetForm();
    setMessage("");
    setError("");
    setShowForm(true);
  }
  function openEditForm(item: StockItem) {
    setProductName(item.productName);
    setCategory(item.category);
    setQuantity(
      item.quantity.toString()
    );
    setMinimumQuantity(
      item.minimumQuantity.toString()
    );
    setUnit(item.unit);
    setEditingId(item.id);
    setMessage("");
    setError("");
    setShowForm(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  function saveStock(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const cleanProductName =
      productName.trim();
    const cleanCategory =
      category.trim();
    const stockQuantity =
      Number(quantity);
    const minimum =
      Number(minimumQuantity);
    if (!cleanProductName) {
      setError(
        "Product name टाका."
      );
      return;
    }
    if (!cleanCategory) {
      setError(
        "Category टाका."
      );
      return;
    }
    if (
      quantity === "" ||
      Number.isNaN(stockQuantity)
    ) {
      setError(
        "Quantity टाका."
      );
      return;
    }
    if (stockQuantity < 0) {
      setError(
        "Quantity 0 पेक्षा कमी असू शकत नाही."
      );
      return;
    }
    if (
      minimumQuantity === "" ||
      Number.isNaN(minimum) ||
      minimum < 0
    ) {
      setError(
        "Minimum stock quantity योग्य टाका."
      );
      return;
    }
    if (editingId !== null) {
      setStock((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                productName:
                  cleanProductName,
                category:
                  cleanCategory,
                quantity:
                  stockQuantity,
                minimumQuantity:
                  minimum,
                unit,
                updatedAt:
                  "Just now",
              }
            : item
        )
      );
      setMessage(
        "Stock item successfully updated."
      );
    } else {
      const newItem: StockItem = {
        id: Date.now(),
        productName:
          cleanProductName,
        category:
          cleanCategory,
        quantity:
          stockQuantity,
        minimumQuantity:
          minimum,
        unit,
        updatedAt:
          "Just now",
      };
      setStock((current) => [
        newItem,
        ...current,
      ]);
      setMessage(
        "Stock item successfully added."
      );
    }
    resetForm();
    setShowForm(false);
  }
  function increaseStock(id: number) {
    setStock((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
              updatedAt:
                "Just now",
            }
          : item
      )
    );
    setMessage(
      "Stock increased."
    );
  }
  function decreaseStock(id: number) {
    setStock((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                Math.max(
                  0,
                  item.quantity - 1
                ),
              updatedAt:
                "Just now",
            }
          : item
      )
    );
    setMessage(
      "Stock decreased."
    );
  }
  function removeStock(id: number) {
    const item = stock.find(
      (stockItem) =>
        stockItem.id === id
    );
    if (!item) return;
    const confirmed =
      window.confirm(
        `"${item.productName}" stock record delete करायचा आहे का?`
      );
    if (!confirmed) return;
    setStock((current) =>
      current.filter(
        (stockItem) =>
          stockItem.id !== id
      )
    );
    setMessage(
      "Stock record deleted."
    );
  }
  function clearMessages() {
    setMessage("");
    setError("");
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
              Stock
            </h1>
            <p style={subtitleStyle}>
              Product stock आणि inventory
              manage करा.
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
              : "+ Add Stock"}
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
        <section
          style={summaryGridStyle}
        >
          <SummaryCard
            title="Total Quantity"
            value={totalQuantity.toString()}
            icon="📦"
          />
          <SummaryCard
            title="Available"
            value={availableCount.toString()}
            icon="✅"
          />
          <SummaryCard
            title="Low Stock"
            value={lowStockCount.toString()}
            icon="⚠️"
          />
          <SummaryCard
            title="Out of Stock"
            value={outOfStockCount.toString()}
            icon="❌"
          />
        </section>
        {/* ADD / EDIT FORM */}
        {showForm && (
          <section
            style={formCardStyle}
          >
            <div
              style={formHeaderStyle}
            >
              <div>
                <h2
                  style={formTitleStyle}
                >
                  {editingId !== null
                    ? "Edit Stock"
                    : "Add Stock"}
                </h2>
                <p
                  style={formSubtitleStyle}
                >
                  {editingId !== null
                    ? "Stock details update करा."
                    : "नवीन stock record तयार करा."}
                </p>
              </div>
              {editingId !== null && (
                <span
                  style={editBadgeStyle}
                >
                  EDITING
                </span>
              )}
            </div>
            <form
              onSubmit={saveStock}
            >
              <div
                style={formGridStyle}
              >
                <Field
                  label="Product Name"
                  value={productName}
                  placeholder="उदा. Special Masala"
                  onChange={
                    setProductName
                  }
                />
                <Field
                  label="Category"
                  value={category}
                  placeholder="उदा. Masala"
                  onChange={
                    setCategory
                  }
                />
                <Field
                  label="Quantity"
                  value={quantity}
                  placeholder="0"
                  type="number"
                  onChange={
                    setQuantity
                  }
                />
                <Field
                  label="Minimum Stock"
                  value={
                    minimumQuantity
                  }
                  placeholder="10"
                  type="number"
                  onChange={
                    setMinimumQuantity
                  }
                />
                <div>
                  <label
                    style={labelStyle}
                  >
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(event) =>
                      setUnit(
                        event.target
                          .value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="Pack">
                      Pack
                    </option>
                    <option value="Kg">
                      Kg
                    </option>
                    <option value="Gram">
                      Gram
                    </option>
                    <option value="Piece">
                      Piece
                    </option>
                    <option value="Box">
                      Box
                    </option>
                    <option value="Litre">
                      Litre
                    </option>
                  </select>
                </div>
              </div>
              <div
                style={formActionsStyle}
              >
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  style={
                    cancelButtonStyle
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={saveButtonStyle}
                >
                  {editingId !== null
                    ? "Save Changes"
                    : "Save Stock"}
                </button>
              </div>
            </form>
          </section>
        )}
        {/* SEARCH */}
        <section
          style={searchSectionStyle}
        >
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Product किंवा category search करा..."
            style={searchInputStyle}
          />
        </section>
        {/* STOCK LIST */}
        <section
          style={listCardStyle}
        >
          <div
            style={listHeaderStyle}
          >
            <h2
              style={sectionTitleStyle}
            >
              Stock List
            </h2>
            <span style={countStyle}>
              {filteredStock.length}{" "}
              Records
            </span>
          </div>
          {filteredStock.length ===
          0 ? (
            <div style={emptyStyle}>
              <div
                style={emptyIconStyle}
              >
                📦
              </div>
              <div
                style={emptyTitleStyle}
              >
                No stock records found
              </div>
              <p
                style={emptyTextStyle}
              >
                Add Stock वर click करून
                stock तयार करा.
              </p>
            </div>
          ) : (
            <div
              style={
                tableWrapperStyle
              }
            >
              <table
                style={tableStyle}
              >
                <thead>
                  <tr>
                    <th
                      style={thStyle}
                    >
                      Product
                    </th>
                    <th
                      style={thStyle}
                    >
                      Category
                    </th>
                    <th
                      style={thStyle}
                    >
                      Quantity
                    </th>
                    <th
                      style={thStyle}
                    >
                      Minimum
                    </th>
                    <th
                      style={thStyle}
                    >
                      Status
                    </th>
                    <th
                      style={thStyle}
                    >
                      Updated
                    </th>
                    <th
                      style={thStyle}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStock.map(
                    (item) => (
                      <tr
                        key={item.id}
                      >
                        <td
                          style={tdStyle}
                        >
                          <strong>
                            {
                              item.productName
                            }
                          </strong>
                        </td>
                        <td
                          style={tdStyle}
                        >
                          {item.category}
                        </td>
                        <td
                          style={tdStyle}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 8,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                decreaseStock(
                                  item.id
                                )
                              }
                              style={
                                quantityButtonStyle
                              }
                            >
                              −
                            </button>
                            <strong
                              style={{
                                minWidth: 55,
                                textAlign:
                                  "center",
                              }}
                            >
                              {
                                item.quantity
                              }{" "}
                              {item.unit}
                            </strong>
                            <button
                              type="button"
                              onClick={() =>
                                increaseStock(
                                  item.id
                                )
                              }
                              style={
                                quantityButtonStyle
                              }
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td
                          style={tdStyle}
                        >
                          {
                            item.minimumQuantity
                          }{" "}
                          {item.unit}
                        </td>
                        <td
                          style={tdStyle}
                        >
                          <StockStatus
                            quantity={
                              item.quantity
                            }
                            minimum={
                              item.minimumQuantity
                            }
                          />
                        </td>
                        <td
                          style={tdStyle}
                        >
                          {
                            item.updatedAt
                          }
                        </td>
                        <td
                          style={tdStyle}
                        >
                          <div
                            style={
                              actionGroupStyle
                            }
                          >
                            {/* EDIT */}
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  item
                                )
                              }
                              style={
                                editButtonStyle
                              }
                            >
                              ✏️ Edit
                            </button>
                            {/* DELETE */}
                            <button
                              type="button"
                              onClick={() =>
                                removeStock(
                                  item.id
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
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <label
        style={labelStyle}
      >
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
          onChange(
            event.target.value
          )
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
    <div
      style={
        summaryCardStyle
      }
    >
      <div
        style={
          summaryTopStyle
        }
      >
        <span
          style={
            summaryIconStyle
          }
        >
          {icon}
        </span>
        <span
          style={
            summaryLabelStyle
          }
        >
          {title}
        </span>
      </div>
      <div
        style={
          summaryValueStyle
        }
      >
        {value}
      </div>
    </div>
  );
}
/* =========================================================
   STOCK STATUS
========================================================= */
function StockStatus({
  quantity,
  minimum,
}: {
  quantity: number;
  minimum: number;
}) {
  if (quantity === 0) {
    return (
      <span
        style={{
          ...statusStyle,
          color: "#ff7070",
          background:
            "rgba(255,70,70,.08)",
          borderColor:
            "rgba(255,70,70,.25)",
        }}
      >
        Out of Stock
      </span>
    );
  }
  if (quantity <= minimum) {
    return (
      <span
        style={{
          ...statusStyle,
          color: "#ffbd45",
          background:
            "rgba(255,180,0,.08)",
          borderColor:
            "rgba(255,180,0,.25)",
        }}
      >
        Low Stock
      </span>
    );
  }
  return (
    <span
      style={{
        ...statusStyle,
        color: "#69d98a",
        background:
          "rgba(80,200,120,.08)",
        borderColor:
          "rgba(80,200,120,.25)",
      }}
    >
      Available
    </span>
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
  fontFamily:
    "Arial, sans-serif",
  boxSizing: "border-box",
};
const containerStyle: React.CSSProperties =
  {
    width: "100%",
    maxWidth: 1200,
    margin: "0 auto",
  };
const headerStyle: React.CSSProperties =
  {
    display: "flex",
    alignItems: "flex-end",
    justifyContent:
      "space-between",
    gap: 20,
    marginBottom: 28,
    flexWrap: "wrap",
  };
const backButtonStyle: React.CSSProperties =
  {
    border: 0,
    background:
      "transparent",
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
const subtitleStyle: React.CSSProperties =
  {
    margin: 0,
    color: "#888",
    fontSize: 14,
  };
const addButtonStyle: React.CSSProperties =
  {
    border: 0,
    borderRadius: 10,
    padding: "13px 18px",
    background: "#ff7a00",
    color: "#111",
    fontWeight: 900,
    cursor: "pointer",
  };
const successStyle: React.CSSProperties =
  {
    marginBottom: 15,
    padding: 13,
    borderRadius: 10,
    background:
      "rgba(80,200,120,.08)",
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
  background:
    "rgba(255,70,70,.08)",
  border:
    "1px solid rgba(255,70,70,.25)",
  color: "#ff7070",
  fontSize: 13,
  fontWeight: 700,
};
const summaryGridStyle: React.CSSProperties =
  {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 15,
    marginBottom: 22,
  };
const summaryCardStyle: React.CSSProperties =
  {
    padding: 19,
    borderRadius: 14,
    border: "1px solid #292929",
    background: "#151515",
  };
const summaryTopStyle: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 9,
  };
const summaryIconStyle: React.CSSProperties =
  {
    fontSize: 19,
  };
const summaryLabelStyle: React.CSSProperties =
  {
    color: "#888",
    fontSize: 12,
    fontWeight: 800,
  };
const summaryValueStyle: React.CSSProperties =
  {
    marginTop: 10,
    color: "#ff7a00",
    fontSize: 28,
    fontWeight: 900,
  };
const formCardStyle: React.CSSProperties =
  {
    marginBottom: 22,
    padding: 22,
    borderRadius: 16,
    border: "1px solid #292929",
    background: "#151515",
  };
const formHeaderStyle: React.CSSProperties =
  {
    display: "flex",
    alignItems: "flex-start",
    justifyContent:
      "space-between",
    gap: 15,
    marginBottom: 20,
  };
const formTitleStyle: React.CSSProperties =
  {
    margin: 0,
    fontSize: 20,
    fontWeight: 900,
  };
const formSubtitleStyle: React.CSSProperties =
  {
    margin:
      "5px 0 0",
    color: "#777",
    fontSize: 12,
  };
const editBadgeStyle: React.CSSProperties =
  {
    padding:
      "6px 9px",
    borderRadius: 20,
    background:
      "rgba(255,122,0,.1)",
    border:
      "1px solid rgba(255,122,0,.25)",
    color: "#ff7a00",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1,
  };
const formGridStyle: React.CSSProperties =
  {
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
const formActionsStyle: React.CSSProperties =
  {
    display: "flex",
    justifyContent:
      "flex-end",
    gap: 10,
    marginTop: 22,
  };
const cancelButtonStyle: React.CSSProperties =
  {
    padding:
      "12px 18px",
    borderRadius: 9,
    border: "1px solid #333",
    background: "#101010",
    color: "#aaa",
    fontWeight: 800,
    cursor: "pointer",
  };
const saveButtonStyle: React.CSSProperties =
  {
    padding:
      "12px 20px",
    borderRadius: 9,
    border: 0,
    background: "#ff7a00",
    color: "#111",
    fontWeight: 900,
    cursor: "pointer",
  };
const searchSectionStyle: React.CSSProperties =
  {
    marginBottom: 18,
  };
const searchInputStyle: React.CSSProperties =
  {
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
const listCardStyle: React.CSSProperties =
  {
    borderRadius: 16,
    border: "1px solid #292929",
    background: "#111",
    overflow: "hidden",
  };
const listHeaderStyle: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    padding: 20,
    borderBottom:
      "1px solid #292929",
  };
const sectionTitleStyle: React.CSSProperties =
  {
    margin: 0,
    fontSize: 19,
    fontWeight: 900,
  };
const countStyle: React.CSSProperties = {
  color: "#777",
  fontSize: 13,
};
const tableWrapperStyle: React.CSSProperties =
  {
    width: "100%",
    overflowX: "auto",
  };
const tableStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 1000,
  borderCollapse:
    "collapse",
};
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding:
    "14px 18px",
  color: "#777",
  fontSize: 12,
  fontWeight: 800,
  borderBottom:
    "1px solid #292929",
};
const tdStyle: React.CSSProperties = {
  padding:
    "15px 18px",
  color: "#ccc",
  fontSize: 13,
  borderBottom:
    "1px solid #202020",
};
const quantityButtonStyle: React.CSSProperties =
  {
    width: 28,
    height: 28,
    borderRadius: 7,
    border: "1px solid #333",
    background: "#191919",
    color: "#fff",
    fontSize: 17,
    fontWeight: 900,
    cursor: "pointer",
  };
const statusStyle: React.CSSProperties = {
  display:
    "inline-block",
  padding:
    "6px 9px",
  borderRadius: 20,
  border: "1px solid",
  fontSize: 11,
  fontWeight: 800,
};
const actionGroupStyle: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
  };
const editButtonStyle: React.CSSProperties =
  {
    padding:
      "8px 12px",
    borderRadius: 8,
    border:
      "1px solid rgba(255,122,0,.25)",
    background:
      "rgba(255,122,0,.06)",
    color: "#ff7a00",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  };
const deleteButtonStyle: React.CSSProperties =
  {
    padding:
      "8px 12px",
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
const emptyIconStyle: React.CSSProperties =
  {
    fontSize: 36,
    marginBottom: 10,
  };
const emptyTitleStyle: React.CSSProperties =
  {
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 5,
  };
const emptyTextStyle: React.CSSProperties =
  {
    margin: 0,
    color: "#777",
    fontSize: 13,
  };