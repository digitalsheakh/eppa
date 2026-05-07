import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export function getGoogleAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });
  return auth;
}

export async function getSheets() {
  const auth = getGoogleAuth();
  return google.sheets({ version: 'v4', auth });
}

export const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;

// ─── Sheet names ──────────────────────────────────────────────
export const SHEETS = {
  PRODUCTS: 'Products',
  ORDERS:   'Orders',
  ORDER_ITEMS: 'OrderItems',
};

// ─── Product helpers ──────────────────────────────────────────
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
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  total: number;
  status: string;
  createdAt: string;
  notes: string;
}

export interface OrderItem {
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

// Row → Product
function rowToProduct(row: string[]): Product {
  return {
    id:          row[0] || '',
    name:        row[1] || '',
    category:    row[2] || '',
    price:       parseFloat(row[3]) || 0,
    unit:        row[4] || '',
    description: row[5] || '',
    image:       row[6] || '',
    stock:       parseInt(row[7]) || 0,
    active:      row[8]?.toLowerCase() === 'true',
  };
}

// ─── Sheet initialisation ─────────────────────────────────────
async function ensureSheets(): Promise<void> {
  const sheets = await getSheets();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existing = (meta.data.sheets || []).map((s: any) => s.properties?.title);

  const toCreate = [
    { title: SHEETS.PRODUCTS,    headers: ['id','name','category','price','unit','description','image','stock','active'] },
    { title: SHEETS.ORDERS,      headers: ['id','customerName','email','phone','address','total','status','createdAt','notes'] },
    { title: SHEETS.ORDER_ITEMS, headers: ['orderId','productId','productName','quantity','price'] },
  ].filter(s => !existing.includes(s.title));

  if (toCreate.length === 0) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: toCreate.map(s => ({ addSheet: { properties: { title: s.title } } })),
    },
  });

  for (const s of toCreate) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${s.title}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [s.headers] },
    });
  }
}

// ─── In-memory cache (60 s TTL) ───────────────────────────────
let _productCache: { data: Product[]; ts: number } | null = null;
const PRODUCT_TTL = 60_000;

export function invalidateProductCache() { _productCache = null; }

// ─── PRODUCTS ─────────────────────────────────────────────────
export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.id === id) ?? null;
}

export async function getProducts(): Promise<Product[]> {
  if (_productCache && Date.now() - _productCache.ts < PRODUCT_TTL) {
    return _productCache.data;
  }
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEETS.PRODUCTS}!A2:I`,
  });
  const rows = res.data.values || [];
  const data = rows.map(rowToProduct).filter(p => p.id);
  _productCache = { data, ts: Date.now() };
  return data;
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const sheets = await getSheets();
  const id = `P${Date.now()}`;
  const row = [
    id,
    product.name,
    product.category,
    product.price,
    product.unit,
    product.description,
    product.image,
    product.stock,
    product.active,
  ];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEETS.PRODUCTS}!A:I`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
  return { id, ...product };
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEETS.PRODUCTS}!A:A`,
  });
  const ids = (res.data.values || []).map(r => r[0]);
  const rowIndex = ids.indexOf(id);
  if (rowIndex === -1) throw new Error('Product not found');

  const allRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEETS.PRODUCTS}!A${rowIndex + 1}:I${rowIndex + 1}`,
  });
  const existing = allRes.data.values?.[0] || [];
  const merged = [
    id,
    updates.name        ?? existing[1],
    updates.category    ?? existing[2],
    updates.price       ?? existing[3],
    updates.unit        ?? existing[4],
    updates.description ?? existing[5],
    updates.image       ?? existing[6],
    updates.stock       ?? existing[7],
    updates.active      ?? existing[8],
  ];
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEETS.PRODUCTS}!A${rowIndex + 1}:I${rowIndex + 1}`,
    valueInputOption: 'RAW',
    requestBody: { values: [merged] },
  });
}

export async function deleteProduct(id: string): Promise<void> {
  const sheets = await getSheets();
  // Mark as inactive rather than hard delete
  await updateProduct(id, { active: false });
}

// ─── ORDERS ───────────────────────────────────────────────────
export async function getOrders(): Promise<Order[]> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEETS.ORDERS}!A2:I`,
  });
  return (res.data.values || []).map(row => ({
    id:           row[0] || '',
    customerName: row[1] || '',
    email:        row[2] || '',
    phone:        row[3] || '',
    address:      row[4] || '',
    total:        parseFloat(row[5]) || 0,
    status:       row[6] || 'pending',
    createdAt:    row[7] || '',
    notes:        row[8] || '',
  }));
}

export async function createOrder(
  order: Omit<Order, 'id' | 'createdAt' | 'status'>,
  items: Omit<OrderItem, 'orderId'>[]
): Promise<string> {
  const sheets = await getSheets();
  const orderId = `ORD-${Date.now()}`;
  const now = new Date().toISOString();

  // Write order row
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEETS.ORDERS}!A:I`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        orderId,
        order.customerName,
        order.email,
        order.phone,
        order.address,
        order.total,
        'pending',
        now,
        order.notes,
      ]],
    },
  });

  // Write order items
  const itemRows = items.map(item => [
    orderId,
    item.productId,
    item.productName,
    item.quantity,
    item.price,
  ]);
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEETS.ORDER_ITEMS}!A:E`,
    valueInputOption: 'RAW',
    requestBody: { values: itemRows },
  });

  return orderId;
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEETS.ORDERS}!A:A`,
  });
  const ids = (res.data.values || []).map(r => r[0]);
  const rowIndex = ids.indexOf(id);
  if (rowIndex === -1) throw new Error('Order not found');

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEETS.ORDERS}!G${rowIndex + 1}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[status]] },
  });
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEETS.ORDER_ITEMS}!A2:E`,
  });
  return (res.data.values || [])
    .filter(row => row[0] === orderId)
    .map(row => ({
      orderId:     row[0],
      productId:   row[1],
      productName: row[2],
      quantity:    parseInt(row[3]) || 0,
      price:       parseFloat(row[4]) || 0,
    }));
}
