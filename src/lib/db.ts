import Dexie, { Table } from "dexie";
/* =========================================================
   COMMON TYPES
========================================================= */
export type RecordStatus = "active" | "deleted";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";
/* =========================================================
   USER
========================================================= */
export type UserRole = "Admin" | "Manager" | "Staff";
export interface LocalUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
/* =========================================================
   OUTLET
========================================================= */
export interface LocalOutlet {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
/* =========================================================
   OUTLET LOGIN
========================================================= */
export interface LocalOutletLogin {
  id: string;
  outletId: string;
  loginId: string;
  passwordHash: string;
  isActive: boolean;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
/* =========================================================
   PRODUCT
========================================================= */
export interface LocalProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  isActive: boolean;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
/* =========================================================
   PRODUCT PHOTO
========================================================= */
export interface LocalProductPhoto {
  id: string;
  productId: string;
  imageData: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
}
/* =========================================================
   PRICE
========================================================= */
export interface LocalPrice {
  id: string;
  productId: string;
  price: number;
  isActive: boolean;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
/* =========================================================
   STOCK
========================================================= */
export interface LocalStock {
  id: string;
  outletId: string;
  productId: string;
  quantity: number;
  minimumQuantity: number;
  updatedAt: string;
}
/* =========================================================
   ORDER
========================================================= */
export interface LocalOrder {
  id: string;
  outletId: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
/* =========================================================
   ORDER ITEM
========================================================= */
export interface LocalOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
}
/* =========================================================
   DELETED RECORD LOG
========================================================= */
export interface LocalDeletedRecord {
  id: string;
  recordType:
    | "user"
    | "outlet"
    | "outletLogin"
    | "product"
    | "productPhoto"
    | "price"
    | "stock"
    | "order"
    | "orderItem";
  recordId: string;
  deletedAt: string;
  reason: string;
}
/* =========================================================
   DATABASE
========================================================= */
class TecMasalaDB extends Dexie {
  users!: Table<LocalUser, string>;
  outlets!: Table<LocalOutlet, string>;
  outletLogins!: Table<LocalOutletLogin, string>;
  products!: Table<LocalProduct, string>;
  productPhotos!: Table<LocalProductPhoto, string>;
  prices!: Table<LocalPrice, string>;
  stocks!: Table<LocalStock, string>;
  orders!: Table<LocalOrder, string>;
  orderItems!: Table<LocalOrderItem, string>;
  deletedRecords!: Table<LocalDeletedRecord, string>;
  constructor() {
    super("tec_masala_database");
    this.version(1).stores({
      users:
        "id, name, email, phone, role, isActive, status, createdAt, updatedAt",
      outlets:
        "id, name, phone, isActive, status, createdAt, updatedAt",
      outletLogins:
        "id, outletId, loginId, isActive, status, createdAt, updatedAt",
      products:
        "id, name, category, isActive, status, createdAt, updatedAt",
      productPhotos:
        "id, productId, createdAt, updatedAt",
      prices:
        "id, productId, price, isActive, status, createdAt, updatedAt",
      stocks:
        "id, outletId, productId, quantity, updatedAt",
      orders:
        "id, outletId, orderNumber, status, createdAt, updatedAt",
      orderItems:
        "id, orderId, productId",
      deletedRecords:
        "id, recordType, recordId, deletedAt",
    });
  }
}
/* =========================================================
   DATABASE INSTANCE
========================================================= */
export const db = new TecMasalaDB();
/* =========================================================
   ID GENERATOR
========================================================= */
export function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
/* =========================================================
   DATE
========================================================= */
export function nowIso(): string {
  return new Date().toISOString();
}
/* =========================================================
   PASSWORD HASH
========================================================= */
export async function hashPassword(
  password: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    data
  );
  const hashArray = Array.from(
    new Uint8Array(hashBuffer)
  );
  return hashArray
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}
/* =========================================================
   PASSWORD VERIFY
========================================================= */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === passwordHash;
}
/* =========================================================
   LOGIN ID NORMALIZER
========================================================= */
export function normalizeLoginId(
  loginId: string
): string {
  return loginId.trim().toLowerCase();
}
/* =========================================================
   SOFT DELETE HELPERS
========================================================= */
export async function markDeleted(
  recordType: LocalDeletedRecord["recordType"],
  recordId: string,
  reason = ""
): Promise<void> {
  await db.deletedRecords.put({
    id: makeId("deleted"),
    recordType,
    recordId,
    deletedAt: nowIso(),
    reason,
  });
}
/* =========================================================
   USER DELETE
========================================================= */
export async function deleteUser(
  userId: string,
  reason = "Deleted by user"
): Promise<void> {
  const user = await db.users.get(userId);
  if (!user) {
    throw new Error("User not found.");
  }
  const deletedAt = nowIso();
  await db.users.update(userId, {
    status: "deleted",
    isActive: false,
    updatedAt: deletedAt,
    deletedAt,
  });
  await markDeleted(
    "user",
    userId,
    reason
  );
}
/* =========================================================
   USER RESTORE
========================================================= */
export async function restoreUser(
  userId: string
): Promise<void> {
  const user = await db.users.get(userId);
  if (!user) {
    throw new Error("User not found.");
  }
  await db.users.update(userId, {
    status: "active",
    isActive: true,
    updatedAt: nowIso(),
    deletedAt: undefined,
  });
}
/* =========================================================
   OUTLET DELETE
========================================================= */
export async function deleteOutlet(
  outletId: string,
  reason = "Deleted by user"
): Promise<void> {
  const outlet = await db.outlets.get(outletId);
  if (!outlet) {
    throw new Error("Outlet not found.");
  }
  const deletedAt = nowIso();
  await db.outlets.update(outletId, {
    status: "deleted",
    isActive: false,
    updatedAt: deletedAt,
    deletedAt,
  });
  await db.outletLogins
    .where("outletId")
    .equals(outletId)
    .modify({
      status: "deleted",
      isActive: false,
      updatedAt: deletedAt,
      deletedAt,
    });
  await markDeleted(
    "outlet",
    outletId,
    reason
  );
}
/* =========================================================
   PRODUCT DELETE
========================================================= */
export async function deleteProduct(
  productId: string,
  reason = "Deleted by user"
): Promise<void> {
  const product = await db.products.get(productId);
  if (!product) {
    throw new Error("Product not found.");
  }
  const deletedAt = nowIso();
  await db.products.update(productId, {
    status: "deleted",
    isActive: false,
    updatedAt: deletedAt,
    deletedAt,
  });
  await db.prices
    .where("productId")
    .equals(productId)
    .modify({
      status: "deleted",
      isActive: false,
      updatedAt: deletedAt,
      deletedAt,
    });
  await markDeleted(
    "product",
    productId,
    reason
  );
}
/* =========================================================
   PRICE DELETE
========================================================= */
export async function deletePrice(
  priceId: string,
  reason = "Deleted by user"
): Promise<void> {
  const price = await db.prices.get(priceId);
  if (!price) {
    throw new Error("Price not found.");
  }
  const deletedAt = nowIso();
  await db.prices.update(priceId, {
    status: "deleted",
    isActive: false,
    updatedAt: deletedAt,
    deletedAt,
  });
  await markDeleted(
    "price",
    priceId,
    reason
  );
}
/* =========================================================
   ORDER DELETE
========================================================= */
export async function deleteOrder(
  orderId: string,
  reason = "Deleted by user"
): Promise<void> {
  const order = await db.orders.get(orderId);
  if (!order) {
    throw new Error("Order not found.");
  }
  const deletedAt = nowIso();
  await db.orders.update(orderId, {
    status: "cancelled",
    updatedAt: deletedAt,
    deletedAt,
  });
  await markDeleted(
    "order",
    orderId,
    reason
  );
}
/* =========================================================
   RESTORE OUTLET
========================================================= */
export async function restoreOutlet(
  outletId: string
): Promise<void> {
  const outlet = await db.outlets.get(outletId);
  if (!outlet) {
    throw new Error("Outlet not found.");
  }
  await db.outlets.update(outletId, {
    status: "active",
    isActive: true,
    updatedAt: nowIso(),
    deletedAt: undefined,
  });
}
/* =========================================================
   RESTORE PRODUCT
========================================================= */
export async function restoreProduct(
  productId: string
): Promise<void> {
  const product = await db.products.get(productId);
  if (!product) {
    throw new Error("Product not found.");
  }
  await db.products.update(productId, {
    status: "active",
    isActive: true,
    updatedAt: nowIso(),
    deletedAt: undefined,
  });
}
/* =========================================================
   RESTORE PRICE
========================================================= */
export async function restorePrice(
  priceId: string
): Promise<void> {
  const price = await db.prices.get(priceId);
  if (!price) {
    throw new Error("Price not found.");
  }
  await db.prices.update(priceId, {
    status: "active",
    isActive: true,
    updatedAt: nowIso(),
    deletedAt: undefined,
  });
}