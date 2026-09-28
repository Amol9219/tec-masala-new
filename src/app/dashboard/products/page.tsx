"use client";
import { ChangeEvent, useEffect, useState } from "react";
import {
  db,
  makeId,
  nowIso,
  LocalProductPhoto,
} from "@/lib/db";
type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: string;
  status: "Available" | "Low Stock" | "Out of Stock";
  image?: string;
  photoId?: string;
};
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Masala Tea",
      category: "Beverages",
      price: "40",
      stock: "50",
      status: "Available",
    },
    {
      id: 2,
      name: "Special Masala",
      category: "Masala",
      price: "120",
      stock: "12",
      status: "Low Stock",
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    loadPhotos();
  }, []);
  async function loadPhotos() {
    try {
      const photos = await db.productPhotos.toArray();
      setProducts((current) =>
        current.map((product) => {
          const photo = photos.find(
            (item) => item.productId === String(product.id)
          );
          if (!photo) {
            return product;
          }
          return {
            ...product,
            image: photo.imageData,
            photoId: photo.id,
          };
        })
      );
    } catch (error) {
      console.error("Product photos load error:", error);
    }
  }
  function handlePhotoChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size maximum 5MB असावी.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setSelectedPhoto(result);
        setSelectedFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  }
  function removeSelectedPhoto() {
    setSelectedPhoto("");
    setSelectedFileName("");
  }
  async function saveProductPhoto(
    productId: number,
    imageData: string
  ) {
    const now = nowIso();
    const existing = await db.productPhotos
      .where("productId")
      .equals(String(productId))
      .first();
    if (existing) {
      await db.productPhotos.update(existing.id, {
        imageData,
        fileName: selectedFileName || existing.fileName,
        updatedAt: now,
      });
      return existing.id;
    }
    const photoId = makeId("product_photo");
    const photo: LocalProductPhoto = {
      id: photoId,
      productId: String(productId),
      imageData,
      fileName: selectedFileName || "product-image",
      createdAt: now,
      updatedAt: now,
    };
    await db.productPhotos.add(photo);
    return photoId;
  }
  function calculateStatus(stockValue: string): Product["status"] {
    const stockNumber = Number(stockValue);
    if (stockNumber === 0) {
      return "Out of Stock";
    }
    if (stockNumber <= 10) {
      return "Low Stock";
    }
    return "Available";
  }
  function resetForm() {
    setName("");
    setCategory("");
    setPrice("");
    setStock("");
    setSelectedPhoto("");
    setSelectedFileName("");
    setEditingId(null);
    setShowForm(false);
  }
  function startEdit(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price);
    setStock(product.stock);
    setSelectedPhoto(product.image || "");
    setSelectedFileName("");
    setShowForm(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  async function saveProduct(event: React.FormEvent) {
    event.preventDefault();
    if (
      !name.trim() ||
      !category.trim() ||
      !price ||
      !stock
    ) {
      alert("Product details पूर्ण भरा.");
      return;
    }
    try {
      setSaving(true);
      const status = calculateStatus(stock);
      /* =========================
         EDIT EXISTING PRODUCT
      ========================= */
      if (editingId !== null) {
        let photoId: string | undefined;
        if (selectedPhoto) {
          photoId = await saveProductPhoto(
            editingId,
            selectedPhoto
          );
        }
        setProducts((current) =>
          current.map((product) =>
            product.id === editingId
              ? {
                  ...product,
                  name: name.trim(),
                  category: category.trim(),
                  price,
                  stock,
                  status,
                  image:
                    selectedPhoto ||
                    product.image ||
                    undefined,
                  photoId:
                    photoId || product.photoId,
                }
              : product
          )
        );
        resetForm();
        return;
      }
      /* =========================
         ADD NEW PRODUCT
      ========================= */
      const productId = Date.now();
      const newProduct: Product = {
        id: productId,
        name: name.trim(),
        category: category.trim(),
        price,
        stock,
        status,
        image: selectedPhoto || undefined,
      };
      setProducts((current) => [
        ...current,
        newProduct,
      ]);
      if (selectedPhoto) {
        const photoId = await saveProductPhoto(
          productId,
          selectedPhoto
        );
        setProducts((current) =>
          current.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  photoId,
                }
              : product
          )
        );
      }
      resetForm();
    } catch (error) {
      console.error(
        "Product save error:",
        error
      );
      alert("Product save करताना समस्या आली.");
    } finally {
      setSaving(false);
    }
  }
  async function deleteProduct(id: number) {
    const confirmed = window.confirm(
      "हा product delete करायचा आहे का?"
    );
    if (!confirmed) {
      return;
    }
    try {
      const photo = await db.productPhotos
        .where("productId")
        .equals(String(id))
        .first();
      if (photo) {
        await db.productPhotos.delete(photo.id);
      }
      setProducts((current) =>
        current.filter(
          (product) => product.id !== id
        )
      );
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error(
        "Product delete error:",
        error
      );
      alert(
        "Product delete करताना समस्या आली."
      );
    }
  }
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#fff",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            marginBottom: 30,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                color: "#ff7a00",
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: 3,
                marginBottom: 8,
              }}
            >
              TEC MASALA
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 32,
                fontWeight: 900,
              }}
            >
              Products
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                color: "#888",
                fontSize: 14,
              }}
            >
              Products, photos, prices आणि stock
              manage करा.
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
            style={{
              border: 0,
              borderRadius: 10,
              background: "#ff7a00",
              color: "#111",
              padding: "13px 20px",
              fontSize: 14,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {showForm
              ? "Close"
              : "+ Add Product"}
          </button>
        </div>
        {/* ADD / EDIT FORM */}
        {showForm && (
          <form
            onSubmit={saveProduct}
            style={{
              background: "#151515",
              border: "1px solid #292929",
              borderRadius: 16,
              padding: 22,
              marginBottom: 25,
            }}
          >
            <h2
              style={{
                margin: "0 0 20px",
                fontSize: 20,
              }}
            >
              {editingId !== null
                ? "Edit Product"
                : "Add New Product"}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 15,
              }}
            >
              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Product name"
                style={inputStyle}
              />
              <input
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                placeholder="Category"
                style={inputStyle}
              />
              <input
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                placeholder="Price"
                type="number"
                min="0"
                style={inputStyle}
              />
              <input
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value)
                }
                placeholder="Stock"
                type="number"
                min="0"
                style={inputStyle}
              />
            </div>
            {/* PHOTO */}
            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>
                Product Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={fileInputStyle}
              />
              {selectedPhoto && (
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <img
                    src={selectedPhoto}
                    alt="Product preview"
                    style={previewImageStyle}
                  />
                  <div>
                    {selectedFileName && (
                      <div
                        style={{
                          color: "#ddd",
                          fontSize: 13,
                          marginBottom: 8,
                        }}
                      >
                        {selectedFileName}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={removeSelectedPhoto}
                      style={
                        removePhotoButtonStyle
                      }
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* SAVE */}
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  border: 0,
                  borderRadius: 9,
                  background: saving
                    ? "#884400"
                    : "#ff7a00",
                  color: "#111",
                  padding: "12px 22px",
                  fontWeight: 900,
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "Update Product"
                  : "Save Product"}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    border: "1px solid #333",
                    borderRadius: 9,
                    background: "#111",
                    color: "#aaa",
                    padding: "12px 20px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        )}
        {/* SUMMARY */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 15,
            marginBottom: 25,
          }}
        >
          <SummaryCard
            title="Total Products"
            value={products.length.toString()}
          />
          <SummaryCard
            title="Available"
            value={products
              .filter(
                (p) => p.status === "Available"
              )
              .length.toString()}
          />
          <SummaryCard
            title="Low Stock"
            value={products
              .filter(
                (p) => p.status === "Low Stock"
              )
              .length.toString()}
          />
          <SummaryCard
            title="Out of Stock"
            value={products
              .filter(
                (p) =>
                  p.status === "Out of Stock"
              )
              .length.toString()}
          />
        </div>
        {/* PRODUCTS */}
        <div
          style={{
            background: "#111",
            border: "1px solid #292929",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: 20,
              borderBottom:
                "1px solid #292929",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 19,
              }}
            >
              Product List
            </h2>
          </div>
          {products.length === 0 ? (
            <div
              style={{
                padding: 50,
                textAlign: "center",
                color: "#777",
              }}
            >
              <div
                style={{
                  fontSize: 35,
                  marginBottom: 10,
                }}
              >
                📦
              </div>
              <div
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 900,
                  marginBottom: 5,
                }}
              >
                No Products
              </div>
              <div style={{ fontSize: 13 }}>
                Add your first product.
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                  minWidth: 950,
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>
                      Photo
                    </th>
                    <th style={thStyle}>
                      Product
                    </th>
                    <th style={thStyle}>
                      Category
                    </th>
                    <th style={thStyle}>
                      Price
                    </th>
                    <th style={thStyle}>
                      Stock
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
                        {/* PHOTO */}
                        <td style={tdStyle}>
                          {product.image ? (
                            <img
                              src={
                                product.image
                              }
                              alt={
                                product.name
                              }
                              style={
                                productImageStyle
                              }
                            />
                          ) : (
                            <div
                              style={
                                noPhotoStyle
                              }
                            >
                              📷
                            </div>
                          )}
                        </td>
                        {/* PRODUCT */}
                        <td style={tdStyle}>
                          <strong>
                            {product.name}
                          </strong>
                        </td>
                        {/* CATEGORY */}
                        <td style={tdStyle}>
                          {product.category}
                        </td>
                        {/* PRICE */}
                        <td style={tdStyle}>
                          ₹{product.price}
                        </td>
                        {/* STOCK */}
                        <td style={tdStyle}>
                          {product.stock}
                        </td>
                        {/* STATUS */}
                        <td style={tdStyle}>
                          <span
                            style={statusStyle(
                              product.status
                            )}
                          >
                            {product.status}
                          </span>
                        </td>
                        {/* ACTION */}
                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap:
                                "wrap",
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
        </div>
        {/* BACK */}
        <button
          type="button"
          onClick={() => {
            window.location.href =
              "/dashboard";
          }}
          style={{
            marginTop: 20,
            border: "1px solid #333",
            borderRadius: 9,
            background: "#111",
            color: "#aaa",
            padding: "11px 17px",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </main>
  );
}
/* =========================================================
   SUMMARY CARD
========================================================= */
function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#151515",
        border: "1px solid #292929",
        borderRadius: 14,
        padding: 20,
      }}
    >
      <div
        style={{
          color: "#888",
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 9,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 27,
          fontWeight: 900,
          color: "#ff7a00",
        }}
      >
        {value}
      </div>
    </div>
  );
}
/* =========================================================
   STATUS
========================================================= */
function statusStyle(
  status: Product["status"]
): React.CSSProperties {
  if (status === "Available") {
    return {
      display: "inline-block",
      padding: "5px 9px",
      borderRadius: 20,
      background:
        "rgba(50,200,100,.1)",
      color: "#60d890",
      fontSize: 11,
      fontWeight: 800,
    };
  }
  if (status === "Low Stock") {
    return {
      display: "inline-block",
      padding: "5px 9px",
      borderRadius: 20,
      background:
        "rgba(255,180,0,.1)",
      color: "#ffbd45",
      fontSize: 11,
      fontWeight: 800,
    };
  }
  return {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 20,
    background:
      "rgba(255,70,70,.1)",
    color: "#ff7070",
    fontSize: 11,
    fontWeight: 800,
  };
}
/* =========================================================
   STYLES
========================================================= */
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
const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  color: "#aaa",
  fontSize: 13,
  fontWeight: 800,
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
const previewImageStyle: React.CSSProperties = {
  width: 90,
  height: 90,
  objectFit: "cover",
  borderRadius: 10,
  border: "1px solid #333",
};
const productImageStyle: React.CSSProperties = {
  width: 52,
  height: 52,
  objectFit: "cover",
  borderRadius: 9,
  border: "1px solid #333",
};
const noPhotoStyle: React.CSSProperties = {
  width: 52,
  height: 52,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 9,
  background: "#1b1b1b",
  color: "#777",
  fontSize: 20,
};
const removePhotoButtonStyle: React.CSSProperties = {
  border: "1px solid #482020",
  borderRadius: 7,
  background: "#211010",
  color: "#ff7070",
  padding: "7px 10px",
  cursor: "pointer",
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
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 18px",
  color: "#777",
  fontSize: 12,
  fontWeight: 800,
  borderBottom:
    "1px solid #292929",
};
const tdStyle: React.CSSProperties = {
  padding: "16px 18px",
  color: "#ccc",
  fontSize: 13,
  borderBottom:
    "1px solid #202020",
};