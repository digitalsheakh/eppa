import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// ─── Admin SDK init ───────────────────────────────────────────────────────────

function getAdminDb() {
  const projectId   = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) return null;

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  image: string;
  stock: number;
  active: boolean;
  createdAt?: string;
}

export interface Order {
  id: string;
  reference?: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  total: number;
  status: string;
  paymentMethod?: string;
  createdAt: string;
  notes?: string;
  courier?: string;
  trackingNumber?: string;
}

export interface OrderItem {
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

// ─── Product cache ─────────────────────────────────────────────────────────────

let _cache: { data: Product[]; ts: number } | null = null;
const TTL = 60_000;

export function invalidateProductCache() { _cache = null; }

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  if (_cache && Date.now() - _cache.ts < TTL) return _cache.data;

  const db = getAdminDb();
  if (!db) return [];

  const snap = await db.collection('products').orderBy('createdAt', 'desc').get();
  const data = snap.docs.map(doc => {
    const d = doc.data();
    return {
      id:          doc.id,
      name:        d.name ?? '',
      category:    d.category ?? '',
      price:       Number(d.price) || 0,
      unit:        d.unit ?? '',
      description: d.description ?? '',
      image:       d.image ?? '',
      stock:       Number(d.stock) || 0,
      active:      d.active !== false,
      createdAt:   d.createdAt instanceof Timestamp ? d.createdAt.toDate().toISOString() : (d.createdAt ?? ''),
    } as Product;
  });

  _cache = { data, ts: Date.now() };
  return data;
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = getAdminDb();
  if (!db) return null;
  const doc = await db.collection('products').doc(id).get();
  if (!doc.exists) return null;
  const d = doc.data()!;
  return {
    id: doc.id,
    name: d.name ?? '',
    category: d.category ?? '',
    price: Number(d.price) || 0,
    unit: d.unit ?? '',
    description: d.description ?? '',
    image: d.image ?? '',
    stock: Number(d.stock) || 0,
    active: d.active !== false,
    createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toDate().toISOString() : (d.createdAt ?? ''),
  };
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const db = getAdminDb();
  if (!db) throw new Error('Firestore not configured');

  const ref = await db.collection('products').add({
    ...product,
    createdAt: Timestamp.now(),
  });

  invalidateProductCache();
  return { id: ref.id, ...product, createdAt: new Date().toISOString() };
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const db = getAdminDb();
  if (!db) throw new Error('Firestore not configured');
  const { id: _id, createdAt: _c, ...data } = updates as any;
  await db.collection('products').doc(id).update({ ...data, updatedAt: Timestamp.now() });
  invalidateProductCache();
}

export async function deleteProduct(id: string): Promise<void> {
  const db = getAdminDb();
  if (!db) throw new Error('Firestore not configured');
  await db.collection('products').doc(id).update({ active: false, updatedAt: Timestamp.now() });
  invalidateProductCache();
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = ['Bags', 'Paper Bags', 'Plastic Bags', 'Carrier Bags', 'Wet Towels', 'Food Packaging'];

export async function getCategories(): Promise<string[]> {
  const db = getAdminDb();
  if (!db) return DEFAULT_CATEGORIES;
  const doc = await db.collection('settings').doc('categories').get();
  if (!doc.exists) return DEFAULT_CATEGORIES;
  const data = doc.data()!;
  return Array.isArray(data.list) && data.list.length > 0 ? data.list : DEFAULT_CATEGORIES;
}

export async function saveCategories(list: string[]): Promise<void> {
  const db = getAdminDb();
  if (!db) throw new Error('Firestore not configured');
  await db.collection('settings').doc('categories').set({ list, updatedAt: Timestamp.now() });
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  const db = getAdminDb();
  if (!db) return [];

  const snap = await db.collection('orders').orderBy('createdAt', 'desc').limit(500).get();
  return snap.docs.map(doc => {
    const d = doc.data();
    return {
      id:            doc.id,
      reference:     d.reference ?? '',
      customerName:  d.customerName ?? '',
      email:         d.email ?? '',
      phone:         d.phone ?? '',
      address:       d.address ?? '',
      total:         Number(d.total) || 0,
      status:        d.status ?? 'pending',
      paymentMethod: d.paymentMethod ?? '',
      createdAt:     d.createdAt instanceof Timestamp ? d.createdAt.toDate().toISOString() : (d.createdAt ?? ''),
      notes:         d.notes ?? '',
    } as Order;
  });
}

export async function createOrder(
  order: Omit<Order, 'id' | 'createdAt' | 'status'>,
  items: Omit<OrderItem, 'orderId'>[]
): Promise<string> {
  const db = getAdminDb();
  if (!db) throw new Error('Firestore not configured');

  const ref = await db.collection('orders').add({
    ...order,
    status: order.paymentMethod === 'bank_transfer' ? 'pending_payment' : 'pending',
    createdAt: Timestamp.now(),
    items: items,
  });

  return ref.id;
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const db = getAdminDb();
  if (!db) throw new Error('Firestore not configured');
  await db.collection('orders').doc(id).update({ status, updatedAt: Timestamp.now() });
}

export async function updateOrderTracking(id: string, courier: string, trackingNumber: string): Promise<void> {
  const db = getAdminDb();
  if (!db) throw new Error('Firestore not configured');
  await db.collection('orders').doc(id).update({ courier, trackingNumber, updatedAt: Timestamp.now() });
}

export async function getOrderByReference(ref: string): Promise<Order | null> {
  const db = getAdminDb();
  if (!db) return null;
  const snap = await db.collection('orders').where('reference', '==', ref).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const d = doc.data();
  return {
    id: doc.id,
    reference:     d.reference ?? '',
    customerName:  d.customerName ?? '',
    email:         d.email ?? '',
    phone:         d.phone ?? '',
    address:       d.address ?? '',
    total:         Number(d.total) || 0,
    status:        d.status ?? 'pending',
    paymentMethod: d.paymentMethod ?? '',
    createdAt:     d.createdAt instanceof Timestamp ? d.createdAt.toDate().toISOString() : (d.createdAt ?? ''),
    notes:         d.notes ?? '',
    courier:       d.courier ?? '',
    trackingNumber: d.trackingNumber ?? '',
  };
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const db = getAdminDb();
  if (!db) return [];
  const doc = await db.collection('orders').doc(orderId).get();
  const items = doc.data()?.items ?? [];
  return items.map((item: any) => ({ ...item, orderId }));
}

// ─── RETURNS ──────────────────────────────────────────────────────────────────

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderReference: string;
  customerName: string;
  email: string;
  reason: string;
  status: string;
  createdAt: string;
}

export async function createReturnRequest(data: Omit<ReturnRequest, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const db = getAdminDb();
  if (!db) throw new Error('Firestore not configured');
  const ref = await db.collection('returns').add({ ...data, status: 'pending', createdAt: Timestamp.now() });
  return ref.id;
}

export async function getReturnRequests(): Promise<ReturnRequest[]> {
  const db = getAdminDb();
  if (!db) return [];
  const snap = await db.collection('returns').orderBy('createdAt', 'desc').get();
  return snap.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id,
      orderId: d.orderId ?? '',
      orderReference: d.orderReference ?? '',
      customerName: d.customerName ?? '',
      email: d.email ?? '',
      reason: d.reason ?? '',
      status: d.status ?? 'pending',
      createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toDate().toISOString() : (d.createdAt ?? ''),
    };
  });
}

export async function updateReturnStatus(id: string, status: string): Promise<void> {
  const db = getAdminDb();
  if (!db) throw new Error('Firestore not configured');
  await db.collection('returns').doc(id).update({ status, updatedAt: Timestamp.now() });
}

// ─── SEQUENTIAL ORDER REFERENCE ───────────────────────────────────────────────

export async function getNextOrderRef(): Promise<string> {
  const db = getAdminDb();
  if (!db) return `ES${Math.floor(Math.random() * 9000) + 1000}`;
  const counterRef = db.collection('counters').doc('orders');
  const count = await db.runTransaction(async tx => {
    const doc = await tx.get(counterRef);
    const next = (doc.exists ? (doc.data()?.count || 0) : 0) + 1;
    tx.set(counterRef, { count: next }, { merge: true });
    return next;
  });
  return `ES${String(count).padStart(3, '0')}`;
}

// ─── SUBSCRIBERS ──────────────────────────────────────────────────────────────

export interface Subscriber {
  email: string;
  subscribedAt: string;
}

export async function addSubscriber(email: string): Promise<void> {
  const db = getAdminDb();
  if (!db) throw new Error('Firestore not configured');
  await db.collection('subscribers').doc(email.toLowerCase()).set({
    email: email.toLowerCase(),
    subscribedAt: Timestamp.now(),
  }, { merge: true });
}

export async function getSubscribers(): Promise<Subscriber[]> {
  const db = getAdminDb();
  if (!db) return [];
  const snap = await db.collection('subscribers').orderBy('subscribedAt', 'desc').get();
  return snap.docs.map(doc => {
    const d = doc.data();
    return {
      email: d.email ?? doc.id,
      subscribedAt: d.subscribedAt instanceof Timestamp
        ? d.subscribedAt.toDate().toISOString()
        : (d.subscribedAt ?? ''),
    };
  });
}
