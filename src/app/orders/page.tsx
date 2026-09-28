"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  db,
  makeId,
  nowIso,
  LocalOrder,
  LocalOrderItem,
  LocalProduct,
} from "@/lib/db";

type CartItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
};

type OrderForm = {
  notes: string;
};

const emptyForm: OrderForm = {
  notes: "",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [orderItems, setOrderItems] = useState<
    Record<string, LocalOrderItem[]>
  >({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<OrderForm>(emptyForm);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [orderData, productData, itemData] = await Promise.all([
        db.orders
          .where("status")
          .anyOf([
            "pending",
            "confirmed",
            "completed",
            "cancelled",
          ])
          .reverse()
          .sortBy("createdAt"),

        db.products
          .where("status")
          .equals("active")
          .filter((product) => product.isActive)
          .toArray(),

        db.orderItems.toArray(),
      ]);

      setOrders(orderData);
      setProducts(productData);

      const grouped: Record<string, LocalOrderItem[]> = {};

      for (const item of itemData) {
        if (!grouped[item.orderId]) {
          grouped[item.orderId] = [];
        }

        grouped[item.orderId].push(item);
      }

      setOrderItems(grouped);
    } catch (err) {
      console.error(err);
      setError("Orders load करताना समस्या आली.");
    } finally {
      setLoading(false);
    }
  }

  function openNewOrder() {
    setForm(emptyForm);
    setCart([]);
    setSelectedProductId("");
    setSelectedQuantity(1);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setForm(emptyForm);
    setCart([]);
    setSelectedProductId("");
    setSelectedQuantity(1);
    setError("");
  }

  async function getProductPrice(productId: string) {
    const price = await db.prices
      .where("productId")
      .equals(productId)
      .filter((item) => item.status === "active" && item.isActive)
      .first();

    return price?.price ?? 0;
  }

  async function addProductToCart() {
    if (!selectedProductId) {
      setError("Product select करा.");
      return;
    }

    if (selectedQuantity < 1) {
      setError("Quantity कमीत कमी 1 असावी.");
      return;
    }

    const product = products.find(
      (item) => item.id === selectedProductId
    );

    if (!product) {
      setError("Product सापडला नाही.");
      return;
    }

    const price = await getProductPrice(product.id);

    if (price <= 0) {
      setError(
        `"${product.name}" साठी active price उपलब्ध नाही.`
      );
      return;
    }

    setCart((current) => {
      const existing = current.find(
        (item) => item.productId === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + selectedQuantity,
                total:
                  (item.quantity + selectedQuantity) *
                  item.price,
              }
            : item
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          productName: product.name,
          quantity: selectedQuantity,
          price,
          total: selectedQuantity * price,
        },
      ];
    });

    setSelectedProductId("");
    setSelectedQuantity(1);
    setError("");
  }

  function updateCartQuantity(
    productId: string,
    quantity: number
  ) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              total: quantity * item.price,
            }
          : item
      )
    );
  }

  function removeFromCart(productId: string) {
    setCart((current) =>
      current.filter((item) => item.productId !== productId)
    );
  }

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.total,
        0
      ),
    [cart]
  );

  async function handleCreateOrder(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (cart.length === 0) {
      setError("कमीत कमी एक product add करा.");
      return;
    }

    try {
      setSaving(true);

      const now = nowIso();

      const orderId = makeId("order");

      const orderNumber =
        "ORD-" +
        new Date()
          .toISOString()
          .replace(/\D/g, "")
          .slice(0, 14);

      const order: LocalOrder = {
        id: orderId,
        outletId: "",
        orderNumber,
        status: "pending",
        totalAmount: cartTotal,
        notes: form.notes.trim(),
        createdAt: now,
        updatedAt: now,
      };

      await db.orders.add(order);

      const items: LocalOrderItem[] = cart.map(
        (item) => ({
          id: makeId("orderitem"),
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })
      );

      await db.orderItems.bulkAdd(items);

      setMessage(
        `Order ${orderNumber} successfully created.`
      );

      closeForm();
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Order save करताना समस्या आली.");
    } finally {
      setSaving(false);
    }
  }

  async function updateOrderStatus(
    order: LocalOrder,
    status: LocalOrder["status"]
  ) {
    try {
      setError("");
      setMessage("");

      await db.orders.update(order.id, {
        status,
        updatedAt: nowIso(),
      });

      await loadData();

      setMessage(
        `Order ${order.orderNumber} status updated.`
      );
    } catch (err) {
      console.error(err);
      setError("Order status बदलताना समस्या आली.");
    }
  }

  async function deleteOrder(order: LocalOrder) {
    const confirmed = window.confirm(
      `"${order.orderNumber}" cancel करायचा आहे का?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await db.orders.update(order.id, {
        status: "cancelled",
        deletedAt: nowIso(),
        updatedAt: nowIso(),
      });

      await loadData();

      setMessage(
        `Order ${order.orderNumber} cancelled.`
      );
    } catch (err) {
      console.error(err);
      setError("Order cancel करताना समस्या आली.");
    }
  }

  const filteredOrders = orders.filter((order) => {
    const text = search.trim().toLowerCase();

    const matchesSearch =
      !text ||
      order.orderNumber.toLowerCase().includes(text) ||
      order.notes.toLowerCase().includes(text);

    const matchesStatus =
      statusFilter === "all" ||
      order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function getStatusColor(
    status: LocalOrder["status"]
  ) {
    if (status === "pending") return "#ffb84d";
    if (status === "confirmed") return "#62b5ff";
    if (status === "completed") return "#69d98a";
    return "#ff7070";
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

            <h1 style={titleStyle}>
              Orders
            </h1>

            <p style={subtitleStyle}>
              Customer orders create आणि manage करा.
            </p>
          </div>

          <button
            type="button"
            onClick={openNewOrder}
            style={addButtonStyle}
          >
            + New Order
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

        {/* SEARCH / FILTER */}
        <div style={toolbarStyle}>
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Order search करा..."
            style={searchInputStyle}
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            style={selectStyle}
          >
            <option value="all">
              All Status
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="confirmed">
              Confirmed
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>

        {/* NEW ORDER FORM */}
        {showForm && (
          <section style={formCardStyle}>
            <div style={formHeaderStyle}>
              <div>
                <h2 style={formTitleStyle}>
                  New Order
                </h2>

                <p style={formSubtitleStyle}>
                  Products add करून order तयार करा.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                style={closeButtonStyle}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateOrder}>
              {/* PRODUCT ADD */}
              <div style={productAddBoxStyle}>
                <div style={productSelectWrapStyle}>
                  <label style={labelStyle}>
                    Product
                  </label>

                  <select
                    value={selectedProductId}
                    onChange={(event) =>
                      setSelectedProductId(
                        event.target.value
                      )
                    }
                    style={selectStyle}
                  >
                    <option value="">
                      Product select करा
                    </option>

                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={quantityWrapStyle}>
                  <label style={labelStyle}>
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(event) =>
                      setSelectedQuantity(
                        Math.max(
                          1,
                          Number(event.target.value)
                        )
                      )
                    }
                    style={inputStyle}
                  />
                </div>

                <button
                  type="button"
                  onClick={addProductToCart}
                  style={addProductButtonStyle}
                >
                  Add
                </button>
              </div>

              {/* CART */}
              <div style={cartSectionStyle}>
                <div style={cartHeaderStyle}>
                  <h3 style={cartTitleStyle}>
                    Order Items
                  </h3>

                  <span style={countStyle}>
                    {cart.length} Item
                    {cart.length === 1 ? "" : "s"}
                  </span>
                </div>

                {cart.length === 0 ? (
                  <div style={cartEmptyStyle}>
                    अजून product add केलेला नाही.
                  </div>
                ) : (
                  <div style={cartListStyle}>
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        style={cartItemStyle}
                      >
                        <div
                          style={{
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={cartProductNameStyle}
                          >
                            {item.productName}
                          </div>

                          <div
                            style={cartPriceStyle}
                          >
                            ₹
                            {item.price.toFixed(2)} /
                            item
                          </div>
                        </div>

                        <div
                          style={cartControlsStyle}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                            style={quantityButtonStyle}
                          >
                            −
                          </button>

                          <span
                            style={
                              quantityTextStyle
                            }
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.quantity + 1
                              )
                            }
                            style={quantityButtonStyle}
                          >
                            +
                          </button>

                          <strong
                            style={itemTotalStyle}
                          >
                            ₹
                            {item.total.toFixed(2)}
                          </strong>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(
                                item.productId
                              )
                            }
                            style={
                              removeButtonStyle
                            }
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* NOTES */}
              <div style={notesBoxStyle}>
                <label style={labelStyle}>
                  Notes
                </label>

                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      notes: event.target.value,
                    })
                  }
                  placeholder="Order notes..."
                  style={textareaStyle}
                />
              </div>

              {/* TOTAL */}
              <div style={totalBoxStyle}>
                <span>
                  Total Amount
                </span>

                <strong>
                  ₹{cartTotal.toFixed(2)}
                </strong>
              </div>

              {/* ACTIONS */}
              <div style={formActionsStyle}>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={saveButtonStyle}
                >
                  {saving
                    ? "Creating..."
                    : "Create Order"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ORDER LIST */}
        <section>
          <div style={listHeaderStyle}>
            <h2 style={sectionTitleStyle}>
              Order List
            </h2>

            <span style={countStyle}>
              {filteredOrders.length} Order
              {filteredOrders.length === 1
                ? ""
                : "s"}
            </span>
          </div>

          {loading ? (
            <div style={emptyStyle}>
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={emptyStyle}>
              <div style={emptyIconStyle}>
                🧾
              </div>

              <div style={emptyTitleStyle}>
                No orders found
              </div>

              <p style={emptyTextStyle}>
                + New Order वर click करून पहिला
                order तयार करा.
              </p>
            </div>
          ) : (
            <div style={listStyle}>
              {filteredOrders.map((order) => {
                const items =
                  orderItems[order.id] || [];

                const expanded =
                  expandedOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    style={orderCardStyle}
                  >
                    <div style={orderMainStyle}>
                      <div style={orderIconStyle}>
                        🧾
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <div
                          style={
                            orderTopLineStyle
                          }
                        >
                          <h3
                            style={
                              orderNumberStyle
                            }
                          >
                            {order.orderNumber}
                          </h3>

                          <span
                            style={{
                              ...statusBadgeStyle,
                              color:
                                getStatusColor(
                                  order.status
                                ),
                              borderColor:
                                getStatusColor(
                                  order.status
                                ),
                            }}
                          >
                            {order.status
                              .charAt(0)
                              .toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </div>

                        <div
                          style={orderMetaStyle}
                        >
                          {formatDate(
                            order.createdAt
                          )}
                        </div>

                        <div
                          style={
                            orderBottomStyle
                          }
                        >
                          <strong>
                            ₹
                            {order.totalAmount.toFixed(
                              2
                            )}
                          </strong>

                          <span>
                            {items.length} product
                            {items.length === 1
                              ? ""
                              : "s"}
                          </span>
                        </div>

                        {expanded && (
                          <div
                            style={
                              expandedItemsStyle
                            }
                          >
                            {items.length === 0 ? (
                              <div
                                style={
                                  emptyItemStyle
                                }
                              >
                                No items
                              </div>
                            ) : (
                              items.map((item) => {
                                const product =
                                  products.find(
                                    (p) =>
                                      p.id ===
                                      item.productId
                                  );

                                return (
                                  <div
                                    key={item.id}
                                    style={
                                      orderItemRowStyle
                                    }
                                  >
                                    <span>
                                      {product?.name ||
                                        "Product"}
                                    </span>

                                    <span>
                                      {item.quantity} ×
                                      ₹
                                      {item.price.toFixed(
                                        2
                                      )}
                                    </span>

                                    <strong>
                                      ₹
                                      {item.total.toFixed(
                                        2
                                      )}
                                    </strong>
                                  </div>
                                );
                              })
                            )}

                            {order.notes && (
                              <div
                                style={
                                  orderNotesStyle
                                }
                              >
                                <strong>
                                  Note:
                                </strong>{" "}
                                {order.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={orderActionsStyle}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedOrderId(
                            expanded
                              ? null
                              : order.id
                          )
                        }
                        style={viewButtonStyle}
                      >
                        {expanded
                          ? "Hide"
                          : "View"}
                      </button>

                      {order.status ===
                        "pending" && (
                        <button
                          type="button"
                          onClick={() =>
                            updateOrderStatus(
                              order,
                              "confirmed"
                            )
                          }
                          style={confirmButtonStyle}
                        >
                          Confirm
                        </button>
                      )}

                      {order.status ===
                        "confirmed" && (
                        <button
                          type="button"
                          onClick={() =>
                            updateOrderStatus(
                              order,
                              "completed"
                            )
                          }
                          style={completeButtonStyle}
                        >
                          Complete
                        </button>
                      )}

                      {order.status !==
                        "completed" &&
                        order.status !==
                          "cancelled" && (
                          <button
                            type="button"
                            onClick={() =>
                              deleteOrder(order)
                            }
                            style={
                              deleteButtonStyle
                            }
                          >
                            Cancel
                          </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
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
  maxWidth: 1100,
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 20,
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
  padding: 13,
  marginBottom: 15,
  borderRadius: 10,
  background: "rgba(80,200,120,.08)",
  border: "1px solid rgba(80,200,120,.25)",
  color: "#69d98a",
  fontSize: 13,
  fontWeight: 700,
};

const errorStyle: React.CSSProperties = {
  padding: 13,
  marginBottom: 15,
  borderRadius: 10,
  background: "rgba(255,70,70,.08)",
  border: "1px solid rgba(255,70,70,.25)",
  color: "#ff7070",
  fontSize: 13,
  fontWeight: 700,
};

const toolbarStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1fr) 180px",
  gap: 12,
  marginBottom: 20,
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

const selectStyle: React.CSSProperties = {
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

const formCardStyle: React.CSSProperties = {
  padding: 22,
  marginBottom: 25,
  borderRadius: 16,
  border: "1px solid #292929",
  background: "#151515",
};

const formHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 22,
};

const formTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 21,
  fontWeight: 900,
};

const formSubtitleStyle: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#777",
  fontSize: 13,
};

const closeButtonStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 8,
  border: "1px solid #333",
  background: "#101010",
  color: "#aaa",
  fontSize: 22,
  cursor: "pointer",
};

const productAddBoxStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1fr) 130px auto",
  gap: 12,
  alignItems: "end",
  padding: 15,
  borderRadius: 12,
  border: "1px solid #292929",
  background: "#101010",
};

const productSelectWrapStyle: React.CSSProperties = {
  minWidth: 0,
};

const quantityWrapStyle: React.CSSProperties = {
  minWidth: 0,
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

const addProductButtonStyle: React.CSSProperties = {
  padding: "13px 20px",
  borderRadius: 9,
  border: 0,
  background: "#ff7a00",
  color: "#111",
  fontWeight: 900,
  cursor: "pointer",
};

const cartSectionStyle: React.CSSProperties = {
  marginTop: 22,
};

const cartHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};

const cartTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 900,
};

const countStyle: React.CSSProperties = {
  color: "#777",
  fontSize: 13,
};

const cartEmptyStyle: React.CSSProperties = {
  padding: 25,
  borderRadius: 10,
  border: "1px dashed #333",
  color: "#777",
  textAlign: "center",
  fontSize: 13,
};

const cartListStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const cartItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 15,
  padding: 13,
  borderRadius: 10,
  background: "#101010",
  border: "1px solid #292929",
};

const cartProductNameStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
};

const cartPriceStyle: React.CSSProperties = {
  marginTop: 4,
  color: "#777",
  fontSize: 12,
};

const cartControlsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const quantityButtonStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 7,
  border: "1px solid #333",
  background: "#151515",
  color: "#fff",
  cursor: "pointer",
  fontSize: 16,
};

const quantityTextStyle: React.CSSProperties = {
  minWidth: 24,
  textAlign: "center",
  fontWeight: 800,
};

const itemTotalStyle: React.CSSProperties = {
  minWidth: 75,
  textAlign: "right",
  fontSize: 14,
};

const removeButtonStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 7,
  border: "1px solid rgba(255,70,70,.25)",
  background: "rgba(255,70,70,.06)",
  color: "#ff7070",
  cursor: "pointer",
  fontSize: 18,
};

const notesBoxStyle: React.CSSProperties = {
  marginTop: 20,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 80,
  boxSizing: "border-box",
  padding: 13,
  borderRadius: 9,
  border: "1px solid #333",
  background: "#0d0d0d",
  color: "#fff",
  outline: "none",
  fontSize: 14,
  resize: "vertical",
};

const totalBoxStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 20,
  padding: 16,
  borderRadius: 10,
  background: "#0d0d0d",
  border: "1px solid #292929",
  fontSize: 15,
};

const formActionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 20,
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

const listHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 14,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 900,
};

const emptyStyle: React.CSSProperties = {
  padding: 45,
  borderRadius: 14,
  border: "1px dashed #333",
  background: "#101010",
  textAlign: "center",
};

const emptyIconStyle: React.CSSProperties = {
  fontSize: 35,
  marginBottom: 12,
};

const emptyTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  marginBottom: 6,
};

const emptyTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#777",
  fontSize: 13,
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const orderCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 20,
  padding: 18,
  borderRadius: 14,
  border: "1px solid #292929",
  background: "#151515",
};

const orderMainStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 15,
  minWidth: 0,
  flex: 1,
};

const orderIconStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 12,
  background: "#101010",
  fontSize: 22,
};

const orderTopLineStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const orderNumberStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 900,
};

const statusBadgeStyle: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: 20,
  background: "#101010",
  border: "1px solid",
  fontSize: 11,
  fontWeight: 900,
};

const orderMetaStyle: React.CSSProperties = {
  marginTop: 5,
  color: "#777",
  fontSize: 12,
};

const orderBottomStyle: React.CSSProperties = {
  display: "flex",
  gap: 14,
  marginTop: 9,
  color: "#aaa",
  fontSize: 12,
};

const orderActionsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  flexShrink: 0,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const viewButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #333",
  background: "#101010",
  color: "#ddd",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};

const confirmButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(98,181,255,.3)",
  background: "rgba(98,181,255,.06)",
  color: "#62b5ff",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};

const completeButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(105,217,138,.3)",
  background: "rgba(105,217,138,.06)",
  color: "#69d98a",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};

const deleteButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,70,70,.25)",
  background: "rgba(255,70,70,.06)",
  color: "#ff7070",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};

const expandedItemsStyle: React.CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 10,
  background: "#0d0d0d",
  border: "1px solid #292929",
};

const orderItemRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1fr) auto auto",
  gap: 15,
  padding: "9px 0",
  borderBottom: "1px solid #222",
  fontSize: 12,
  color: "#bbb",
};

const emptyItemStyle: React.CSSProperties = {
  color: "#666",
  fontSize: 12,
};

const orderNotesStyle: React.CSSProperties = {
  marginTop: 12,
  color: "#777",
  fontSize: 12,
  lineHeight: 1.5,
};