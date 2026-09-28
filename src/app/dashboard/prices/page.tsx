"use client";
import { useMemo, useState } from "react";
type PriceItem = {
  id: number;
  productName: string;
  category: string;
  unit: string;
  sellingPrice: number;
  purchasePrice: number;
  updatedAt: string;
};
const initialPrices: PriceItem[] = [
  {
    id: 1,
    productName: "Masala Tea",
    category: "Beverages",
    unit: "Pack",
    sellingPrice: 40,
    purchasePrice: 25,
    updatedAt: "Today",
  },
  {
    id: 2,
    productName: "Special Masala",
    category: "Masala",
    unit: "Kg",
    sellingPrice: 120,
    purchasePrice: 80,
    updatedAt: "Today",
  },
];
export default function PricesPage() {
  const [prices, setPrices] =
    useState<PriceItem[]>(initialPrices);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("Pack");
  const [sellingPrice, setSellingPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [editingId, setEditingId] =
    useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const filteredPrices = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return prices;
    return prices.filter(
      (item) =>
        item.productName
          .toLowerCase()
          .includes(value) ||
        item.category
          .toLowerCase()
          .includes(value)
    );
  }, [prices, search]);
  const totalProducts = prices.length;
  const averageSellingPrice =
    totalProducts === 0
      ? 0
      : prices.reduce(
          (total, item) =>
            total + item.sellingPrice,
          0
        ) / totalProducts;
  const averageMargin =
    totalProducts === 0
      ? 0
      : prices.reduce(
          (total, item) =>
            total +
            (item.sellingPrice -
              item.purchasePrice),
          0
        ) / totalProducts;
  function resetForm() {
    setProductName("");
    setCategory("");
    setUnit("Pack");
    setSellingPrice("");
    setPurchasePrice("");
    setEditingId(null);
    setError("");
  }
  function savePrice(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const cleanName = productName.trim();
    const cleanCategory = category.trim();
    const sell = Number(sellingPrice);
    const purchase = Number(purchasePrice);
    if (!cleanName) {
      setError("Product name टाका.");
      return;
    }
    if (!cleanCategory) {
      setError("Category टाका.");
      return;
    }
    if (
      sellingPrice === "" ||
      Number.isNaN(sell) ||
      sell < 0
    ) {
      setError("Selling price योग्य टाका.");
      return;
    }
    if (
      purchasePrice === "" ||
      Number.isNaN(purchase) ||
      purchase < 0
    ) {
      setError("Purchase price योग्य टाका.");
      return;
    }
    if (sell < purchase) {
      setError(
        "Selling price purchase price पेक्षा कमी आहे."
      );
      return;
    }
    if (editingId !== null) {
      setPrices((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                productName: cleanName,
                category: cleanCategory,
                unit,
                sellingPrice: sell,
                purchasePrice: purchase,
                updatedAt: "Just now",
              }
            : item
        )
      );
      setMessage("Price successfully updated.");
    } else {
      const newPrice: PriceItem = {
        id: Date.now(),
        productName: cleanName,
        category: cleanCategory,
        unit,
        sellingPrice: sell,
        purchasePrice: purchase,
        updatedAt: "Just now",
      };
      setPrices((current) => [
        newPrice,
        ...current,
      ]);
      setMessage("New price successfully added.");
    }
    resetForm();
    setShowForm(false);
  }
  function editPrice(item: PriceItem) {
    setEditingId(item.id);
    setProductName(item.productName);
    setCategory(item.category);
    setUnit(item.unit);
    setSellingPrice(item.sellingPrice.toString());
    setPurchasePrice(
      item.purchasePrice.toString()
    );
    setError("");
    setMessage("");
    setShowForm(true);
  }
  function deletePrice(id: number) {
    const item = prices.find(
      (price) => price.id === id
    );
    if (!item) return;
    const confirmed = window.confirm(
      `"${item.productName}" ची price record delete करायची आहे का?`
    );
    if (!confirmed) return;
    setPrices((current) =>
      current.filter((price) => price.id !== id)
    );
    setMessage("Price record deleted.");
  }
  function margin(item: PriceItem) {
    return (
      item.sellingPrice - item.purchasePrice
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
                window.location.href = "/dashboard";
              }}
              style={backButtonStyle}
            >
              ← Dashboard
            </button>
            <div style={brandStyle}>
              TEC MASALA
            </div>
            <h1 style={titleStyle}>Prices</h1>
            <p style={subtitleStyle}>
              Product prices आणि margin एकाच ठिकाणी
              manage करा.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMessage("");
              setError("");
              if (showForm) {
                resetForm();
              }
              setShowForm((value) => !value);
            }}
            style={addButtonStyle}
          >
            {showForm ? "Close" : "+ Add Price"}
          </button>
        </header>
        {/* MESSAGES */}
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
            title="Total Products"
            value={totalProducts.toString()}
            icon="📦"
          />
          <SummaryCard
            title="Avg. Selling Price"
            value={`₹${averageSellingPrice.toFixed(
              0
            )}`}
            icon="₹"
          />
          <SummaryCard
            title="Avg. Margin"
            value={`₹${averageMargin.toFixed(0)}`}
            icon="📈"
          />
          <SummaryCard
            title="Price Records"
            value={prices.length.toString()}
            icon="🏷️"
          />
        </section>
        {/* FORM */}
        {showForm && (
          <section style={formCardStyle}>
            <h2 style={formTitleStyle}>
              {editingId !== null
                ? "Edit Price"
                : "Add New Price"}
            </h2>
            <form onSubmit={savePrice}>
              <div style={formGridStyle}>
                <Field
                  label="Product Name"
                  value={productName}
                  placeholder="उदा. Special Masala"
                  onChange={setProductName}
                />
                <Field
                  label="Category"
                  value={category}
                  placeholder="उदा. Masala"
                  onChange={setCategory}
                />
                <div>
                  <label style={labelStyle}>
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(event) =>
                      setUnit(event.target.value)
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
                <Field
                  label="Purchase Price"
                  value={purchasePrice}
                  placeholder="0"
                  type="number"
                  onChange={setPurchasePrice}
                />
                <Field
                  label="Selling Price"
                  value={sellingPrice}
                  placeholder="0"
                  type="number"
                  onChange={setSellingPrice}
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
                  {editingId !== null
                    ? "Update Price"
                    : "Save Price"}
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
            placeholder="Product किंवा category search करा..."
            style={searchInputStyle}
          />
        </section>
        {/* PRICE LIST */}
        <section style={listCardStyle}>
          <div style={listHeaderStyle}>
            <h2 style={sectionTitleStyle}>
              Price List
            </h2>
            <span style={countStyle}>
              {filteredPrices.length} Records
            </span>
          </div>
          {filteredPrices.length === 0 ? (
            <div style={emptyStyle}>
              <div style={emptyIconStyle}>
                🏷️
              </div>
              <div style={emptyTitleStyle}>
                No price records found
              </div>
              <p style={emptyTextStyle}>
                Add Price वर click करून price तयार
                करा.
              </p>
            </div>
          ) : (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>
                      Product
                    </th>
                    <th style={thStyle}>
                      Category
                    </th>
                    <th style={thStyle}>
                      Unit
                    </th>
                    <th style={thStyle}>
                      Purchase
                    </th>
                    <th style={thStyle}>
                      Selling
                    </th>
                    <th style={thStyle}>
                      Margin
                    </th>
                    <th style={thStyle}>
                      Updated
                    </th>
                    <th style={thStyle}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrices.map((item) => (
                    <tr key={item.id}>
                      <td style={tdStyle}>
                        <strong>
                          {item.productName}
                        </strong>
                      </td>
                      <td style={tdStyle}>
                        {item.category}
                      </td>
                      <td style={tdStyle}>
                        {item.unit}
                      </td>
                      <td style={tdStyle}>
                        ₹{item.purchasePrice}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          color: "#ff7a00",
                          fontWeight: 900,
                        }}
                      >
                        ₹{item.sellingPrice}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            ...marginBadgeStyle,
                            color:
                              margin(item) >= 0
                                ? "#69d98a"
                                : "#ff7070",
                          }}
                        >
                          ₹{margin(item)}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {item.updatedAt}
                      </td>
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: 7,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              editPrice(item)
                            }
                            style={editButtonStyle}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              deletePrice(item.id)
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
        min={type === "number" ? "0" : undefined}
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
  border: "1px solid rgba(80,200,120,.25)",
  color: "#69d98a",
  fontSize: 13,
  fontWeight: 700,
};
const errorStyle: React.CSSProperties = {
  marginBottom: 15,
  padding: 13,
  borderRadius: 10,
  background: "rgba(255,70,70,.08)",
  border: "1px solid rgba(255,70,70,.25)",
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
const marginBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "5px 8px",
  borderRadius: 20,
  background: "rgba(80,200,120,.08)",
  fontSize: 12,
  fontWeight: 900,
};
const editButtonStyle: React.CSSProperties = {
  padding: "8px 11px",
  borderRadius: 8,
  border: "1px solid #333",
  background: "#191919",
  color: "#ddd",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};
const deleteButtonStyle: React.CSSProperties = {
  padding: "8px 11px",
  borderRadius: 8,
  border: "1px solid rgba(255,70,70,.25)",
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