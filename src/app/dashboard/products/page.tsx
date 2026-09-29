"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string | null;
  is_active: boolean;
  status: string;
  price?: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Products load झाले नाहीत.");
      setLoading(false);
      return;
    }

    const productIds = (data || []).map((p) => p.id);

    let priceData: any[] = [];

    if (productIds.length > 0) {
      const { data: prices, error: priceError } =
        await supabase
          .from("prices")
          .select("*")
          .in("product_id", productIds)
          .eq("is_active", true);

      if (!priceError) {
        priceData = prices || [];
      }
    }

    const finalProducts: Product[] = (data || []).map(
      (product) => {
        const productPrice = priceData.find(
          (p) => p.product_id === product.id
        );

        return {
          ...product,
          price: productPrice?.price || 0,
        };
      }
    );

    setProducts(finalProducts);
    setLoading(false);
  }

  function resetForm() {
    setName("");
    setDescription("");
    setCategory("");
    setPrice("");
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || "");
    setCategory(product.category || "");
    setPrice(String(product.price || ""));
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveProduct(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!name.trim()) {
      alert("Product name भरा.");
      return;
    }

    if (!category.trim()) {
      alert("Category भरा.");
      return;
    }

    if (!price) {
      alert("Price भरा.");
      return;
    }

    setSaving(true);

    try {
      /* =========================
         UPDATE PRODUCT
      ========================= */

      if (editingId) {
        const { error: productError } =
          await supabase
            .from("products")
            .update({
              name: name.trim(),
              description: description.trim(),
              category: category.trim(),
              status: "Available",
              is_active: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", editingId);

        if (productError) {
          console.error(productError);
          alert("Product update झाला नाही.");
          return;
        }

        const { data: existingPrice } =
          await supabase
            .from("prices")
            .select("id")
            .eq("product_id", editingId)
            .eq("is_active", true)
            .maybeSingle();

        if (existingPrice) {
          await supabase
            .from("prices")
            .update({
              price: Number(price),
              updated_at:
                new Date().toISOString(),
              status: "Active",
              is_active: true,
            })
            .eq("id", existingPrice.id);
        } else {
          await supabase.from("prices").insert({
            product_id: editingId,
            price: Number(price),
            is_active: true,
            status: "Active",
            created_at:
              new Date().toISOString(),
            updated_at:
              new Date().toISOString(),
          });
        }

        alert("Product updated successfully.");
        resetForm();
        await loadProducts();
        return;
      }

      /* =========================
         ADD PRODUCT
      ========================= */

      const { data: newProduct, error } =
        await supabase
          .from("products")
          .insert({
            name: name.trim(),
            description: description.trim(),
            category: category.trim(),
            image: null,
            is_active: true,
            status: "Available",
            created_at:
              new Date().toISOString(),
            updated_at:
              new Date().toISOString(),
          })
          .select()
          .single();

      if (error || !newProduct) {
        console.error(error);
        alert("Product save झाला नाही.");
        return;
      }

      /* =========================
         SAVE FINAL SELLING PRICE
      ========================= */

      const { error: priceError } =
        await supabase.from("prices").insert({
          product_id: newProduct.id,
          price: Number(price),
          is_active: true,
          status: "Active",
          created_at:
            new Date().toISOString(),
          updated_at:
            new Date().toISOString(),
        });

      if (priceError) {
        console.error(priceError);
        alert(
          "Product save झाला पण Price save झाला नाही."
        );
        return;
      }

      alert("Product successfully added.");

      resetForm();
      await loadProducts();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: string) {
    const confirmed = window.confirm(
      "हा product delete करायचा आहे का?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .update({
        is_active: false,
        status: "Deleted",
        deleted_at:
          new Date().toISOString(),
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Product delete झाला नाही.");
      return;
    }

    await supabase
      .from("prices")
      .update({
        is_active: false,
        updated_at:
          new Date().toISOString(),
      })
      .eq("product_id", id);

    await loadProducts();
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
              Products
            </h1>

            <p style={subtitleStyle}>
              Final products manage करा.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            style={addButtonStyle}
          >
            {showForm
              ? "Close"
              : "+ Add Product"}
          </button>
        </header>

        {/* FORM */}

        {showForm && (
          <form
            onSubmit={saveProduct}
            style={formStyle}
          >
            <h2 style={formTitleStyle}>
              {editingId
                ? "Edit Product"
                : "Add New Product"}
            </h2>

            <div style={gridStyle}>

              <div>
                <label style={labelStyle}>
                  Product Name
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="उदा. Fine Masala"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Category
                </label>

                <input
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  placeholder="उदा. Masala"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Price
                </label>

                <input
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  type="number"
                  min="0"
                  placeholder="100"
                  style={inputStyle}
                />
              </div>

            </div>

            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Product description"
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />
            </div>

            <div style={buttonRowStyle}>

              <button
                type="submit"
                disabled={saving}
                style={saveButtonStyle}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Product"
                  : "Save Product"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                style={cancelButtonStyle}
              >
                Cancel
              </button>

            </div>
          </form>
        )}

        {/* SUMMARY */}

        <div style={summaryGridStyle}>
          <SummaryCard
            title="Total Products"
            value={products.length}
          />

          <SummaryCard
            title="Available"
            value={
              products.filter(
                (p) =>
                  p.status ===
                  "Available"
              ).length
            }
          />

          <SummaryCard
            title="Low Stock"
            value={
              products.filter(
                (p) =>
                  p.status ===
                  "Low Stock"
              ).length
            }
          />

          <SummaryCard
            title="Out of Stock"
            value={
              products.filter(
                (p) =>
                  p.status ===
                  "Out of Stock"
              ).length
            }
          />
        </div>

        {/* LIST */}

        <section style={listStyle}>
          <div style={listHeaderStyle}>
            <h2 style={sectionTitleStyle}>
              Product List
            </h2>

            <span style={countStyle}>
              {products.length} Records
            </span>
          </div>

          {loading ? (
            <div style={emptyStyle}>
              Loading Products...
            </div>
          ) : products.length === 0 ? (
            <div style={emptyStyle}>
              <div style={{ fontSize: 35 }}>
                📦
              </div>

              <h3>No Products</h3>

              <p>
                + Add Product वर click करा.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>
                      Product
                    </th>

                    <th style={thStyle}>
                      Description
                    </th>

                    <th style={thStyle}>
                      Category
                    </th>

                    <th style={thStyle}>
                      Price
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
                  {products.map(
                    (product) => (
                      <tr key={product.id}>

                        <td style={tdStyle}>
                          <strong>
                            {product.name}
                          </strong>
                        </td>

                        <td style={tdStyle}>
                          {product.description ||
                            "-"}
                        </td>

                        <td style={tdStyle}>
                          {product.category}
                        </td>

                        <td style={tdStyle}>
                          ₹
                          {product.price ||
                            0}
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={statusStyle(
                              product.status
                            )}
                          >
                            {product.status}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          <div
                            style={{
                              display:
                                "flex",
                              gap: 8,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                startEdit(
                                  product
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
                                deleteProduct(
                                  product.id
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

        <button
          type="button"
          onClick={() => {
            window.location.href =
              "/dashboard";
          }}
          style={backDashboardStyle}
        >
          ← Back to Dashboard
        </button>

      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div style={summaryCardStyle}>
      <div style={summaryLabelStyle}>
        {title}
      </div>

      <div style={summaryValueStyle}>
        {value}
      </div>
    </div>
  );
}

function statusStyle(
  status: string
): React.CSSProperties {
  if (status === "Available") {
    return {
      padding: "6px 10px",
      borderRadius: 20,
      background: "rgba(50,200,100,.1)",
      color: "#60d890",
      fontSize: 11,
      fontWeight: 800,
    };
  }

  if (status === "Low Stock") {
    return {
      padding: "6px 10px",
      borderRadius: 20,
      background: "rgba(255,180,0,.1)",
      color: "#ffbd45",
      fontSize: 11,
      fontWeight: 800,
    };
  }

  return {
    padding: "6px 10px",
    borderRadius: 20,
    background: "rgba(255,70,70,.1)",
    color: "#ff7070",
    fontSize: 11,
    fontWeight: 800,
  };
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#080808",
  color: "#fff",
  padding: 30,
  fontFamily: "Arial, sans-serif",
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 20,
  marginBottom: 30,
  flexWrap: "wrap",
};

const backButtonStyle: React.CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#888",
  padding: 0,
  marginBottom: 15,
  cursor: "pointer",
};

const brandStyle: React.CSSProperties = {
  color: "#ff7a00",
  fontSize: 13,
  fontWeight: 900,
  letterSpacing: 3,
};

const titleStyle: React.CSSProperties = {
  margin: "7px 0 4px",
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
  background: "#ff7a00",
  color: "#111",
  padding: "13px 20px",
  fontWeight: 900,
  cursor: "pointer",
};

const formStyle: React.CSSProperties = {
  background: "#151515",
  border: "1px solid #292929",
  borderRadius: 16,
  padding: 22,
  marginBottom: 25,
};

const formTitleStyle: React.CSSProperties = {
  margin: "0 0 20px",
  fontSize: 20,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 15,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#aaa",
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 7,
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

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 20,
};

const saveButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 9,
  background: "#ff7a00",
  color: "#111",
  padding: "12px 22px",
  fontWeight: 900,
  cursor: "pointer",
};

const cancelButtonStyle: React.CSSProperties = {
  border: "1px solid #333",
  borderRadius: 9,
  background: "#111",
  color: "#aaa",
  padding: "12px 20px",
  fontWeight: 800,
  cursor: "pointer",
};

const summaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 15,
  marginBottom: 25,
};

const summaryCardStyle: React.CSSProperties = {
  background: "#151515",
  border: "1px solid #292929",
  borderRadius: 14,
  padding: 20,
};

const summaryLabelStyle: React.CSSProperties = {
  color: "#888",
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 9,
};

const summaryValueStyle: React.CSSProperties = {
  color: "#ff7a00",
  fontSize: 27,
  fontWeight: 900,
};

const listStyle: React.CSSProperties = {
  background: "#111",
  border: "1px solid #292929",
  borderRadius: 16,
  overflow: "hidden",
};

const listHeaderStyle: React.CSSProperties = {
  padding: 20,
  borderBottom: "1px solid #292929",
  display: "flex",
  justifyContent: "space-between",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 19,
};

const countStyle: React.CSSProperties = {
  color: "#777",
  fontSize: 13,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 850,
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 18px",
  color: "#777",
  fontSize: 12,
  borderBottom: "1px solid #292929",
};

const tdStyle: React.CSSProperties = {
  padding: "16px 18px",
  color: "#ccc",
  fontSize: 13,
  borderBottom: "1px solid #202020",
};

const editButtonStyle: React.CSSProperties = {
  border: "1px solid #4b351f",
  borderRadius: 7,
  background: "#21180f",
  color: "#ff9a3d",
  padding: "7px 12px",
  cursor: "pointer",
  fontWeight: 800,
};

const deleteButtonStyle: React.CSSProperties = {
  border: "1px solid #482020",
  borderRadius: 7,
  background: "#211010",
  color: "#ff7070",
  padding: "7px 12px",
  cursor: "pointer",
  fontWeight: 700,
};

const emptyStyle: React.CSSProperties = {
  padding: 50,
  textAlign: "center",
  color: "#777",
};

const backDashboardStyle: React.CSSProperties = {
  marginTop: 20,
  border: "1px solid #333",
  borderRadius: 9,
  background: "#111",
  color: "#aaa",
  padding: "11px 17px",
  cursor: "pointer",
};