"use client";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  image: string | null;
  weight: number | null;
  is_active: boolean;
  status: string;
  created_at: string;
};
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    loadProducts();
  }, []);
  async function loadProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select(
        "id,name,description,category,image,weight,is_active,status,created_at"
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      alert("Products load झाले नाहीत.");
      setLoading(false);
      return;
    }
    setProducts(data || []);
    setLoading(false);
  }
  function resetForm() {
    setName("");
    setCategory("");
    setDescription("");
    setWeight("");
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);
  }
  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("फक्त image file निवडा.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.onerror = () => {
      setImageFile(null);
      setImagePreview(null);
      alert("Photo read झाला नाही.");
    };
    reader.readAsDataURL(file);
  }
  function editProduct(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setDescription(product.description || "");
    setWeight(
      product.weight !== null
        ? String(product.weight)
        : ""
    );
    setImageFile(null);
    setImagePreview(product.image);
    setShowForm(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  async function saveProduct(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    if (!name.trim()) {
      alert("Product Name भरा.");
      return;
    }
    if (!category.trim()) {
      alert("Category भरा.");
      return;
    }
    if (!weight || Number(weight) <= 0) {
      alert("KG / Weight भरा.");
      return;
    }
    if (!imagePreview) {
      alert("Product Photo निवडा.");
      return;
    }
    setSaving(true);
    try {
      const productData = {
        name: name.trim(),
        category: category.trim(),
        description: description.trim() || null,
        image: imagePreview,
        weight: Number(weight),
        is_active: true,
        status: "Available",
        updated_at: new Date().toISOString(),
      };
      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingId);
        if (error) {
          console.error(error);
          alert(
            `Product update झाला नाही.\n\n${error.message}`
          );
          return;
        }
        alert("Product updated successfully.");
      } else {
        const { error } = await supabase
          .from("products")
          .insert({
            ...productData,
            created_at: new Date().toISOString(),
          });
        if (error) {
          console.error(error);
          alert(
            `Product save झाला नाही.\n\n${error.message}`
          );
          return;
        }
        alert("Product added successfully.");
      }
      resetForm();
      await loadProducts();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }
  async function deleteProduct(id: string) {
    const confirmed = window.confirm(
      "हा Product delete करायचा आहे का?"
    );
    if (!confirmed) return;
    const { error } = await supabase
      .from("products")
      .update({
        is_active: false,
        status: "Deleted",
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      console.error(error);
      alert(
        `Product delete झाला नाही.\n\n${error.message}`
      );
      return;
    }
    await loadProducts();
  }
  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
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
            <h1 style={titleStyle}>
              Products
            </h1>
            <p style={subtitleStyle}>
              Product master manage करा.
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
            {showForm ? "Close" : "+ Add Product"}
          </button>
        </header>
        {showForm && (
          <form
            onSubmit={saveProduct}
            style={formStyle}
          >
            <h2 style={formTitleStyle}>
              {editingId
                ? "Edit Product"
                : "Add Product"}
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
                  KG / Weight
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={weight}
                  onChange={(e) =>
                    setWeight(e.target.value)
                  }
                  placeholder="उदा. 1"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  Product Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={fileInputStyle}
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    style={previewStyle}
                  />
                )}
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
                rows={3}
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
        <section style={listStyle}>
          <div style={listHeaderStyle}>
            <h2 style={sectionTitleStyle}>
              Product List
            </h2>
            <span style={countStyle}>
              {products.length} Products
            </span>
          </div>
          {loading ? (
            <div style={emptyStyle}>
              Loading...
            </div>
          ) : products.length === 0 ? (
            <div style={emptyStyle}>
              <div style={{ fontSize: 40 }}>
                📦
              </div>
              <h3>No Products</h3>
              <p>
                + Add Product करा.
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
                      Photo
                    </th>
                    <th style={thStyle}>
                      Category
                    </th>
                    <th style={thStyle}>
                      Weight
                    </th>
                    <th style={thStyle}>
                      Description
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
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td style={tdStyle}>
                        <strong>
                          {product.name}
                        </strong>
                      </td>
                      <td style={tdStyle}>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            style={listImageStyle}
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td style={tdStyle}>
                        {product.category}
                      </td>
                      <td style={tdStyle}>
                        {product.weight} KG
                      </td>
                      <td style={tdStyle}>
                        {product.description || "-"}
                      </td>
                      <td style={tdStyle}>
                        <span style={statusStyle}>
                          {product.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              editProduct(product)
                            }
                            style={editButtonStyle}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              deleteProduct(product.id)
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
const fileInputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 11,
  borderRadius: 9,
  border: "1px solid #333",
  background: "#0d0d0d",
  color: "#aaa",
  fontSize: 13,
};
const previewStyle: React.CSSProperties = {
  display: "block",
  width: 90,
  height: 90,
  objectFit: "cover",
  borderRadius: 10,
  marginTop: 10,
  border: "1px solid #333",
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
  minWidth: 1000,
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
const listImageStyle: React.CSSProperties = {
  width: 55,
  height: 55,
  objectFit: "cover",
  borderRadius: 8,
  border: "1px solid #333",
};
const statusStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 20,
  background: "rgba(50,200,100,.1)",
  color: "#60d890",
  fontSize: 11,
  fontWeight: 800,
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