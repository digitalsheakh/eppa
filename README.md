# 🍽️ CaterPro Supply — Next.js Catering E-Commerce

A full-stack catering supplies e-commerce website using **Next.js 14** with **Google Sheets as the backend database**.

---

## 🗂️ Project Structure

```
catering-shop/
├── app/
│   ├── page.tsx              # Homepage
│   ├── shop/page.tsx         # Product catalogue
│   ├── cart/page.tsx         # Shopping cart
│   ├── checkout/page.tsx     # Checkout form
│   ├── admin/
│   │   ├── page.tsx          # Admin login
│   │   ├── products/page.tsx # Manage products (CRUD)
│   │   └── orders/page.tsx   # Manage & update orders
│   └── api/
│       ├── products/route.ts         # GET all / POST new
│       ├── products/[id]/route.ts    # PATCH / DELETE
│       ├── orders/route.ts           # GET all / POST new
│       ├── orders/[id]/route.ts      # PATCH status / GET items
│       └── admin/route.ts            # Auth
├── components/
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   └── Footer.tsx
└── lib/
    ├── googleSheets.ts   # All Google Sheets API logic
    └── cartStore.ts      # Zustand cart (persisted)
```

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Google Sheets (see full guide below)

### 3. Create `.env.local`
```bash
cp .env.local.example .env.local
# Fill in your credentials
```

### 4. Run development server
```bash
npm run dev
```

Open http://localhost:3000

---

## 📊 Google Sheets Setup (Step-by-Step)

### Step 1: Create your Google Spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Name it **"CaterPro Supply"**
3. Create **3 sheets** (tabs at the bottom):
   - `Products`
   - `Orders`
   - `OrderItems`

### Step 2: Set up sheet headers

**Products sheet** — Row 1 headers:
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| id | name | category | price | unit | description | image | stock | active |

**Orders sheet** — Row 1 headers:
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| id | customerName | email | phone | address | total | status | createdAt | notes |

**OrderItems sheet** — Row 1 headers:
| A | B | C | D | E |
|---|---|---|---|---|
| orderId | productId | productName | quantity | price |

### Step 3: Add sample products (optional)

Add a row in the Products sheet:
```
P001 | Kraft Takeaway Boxes (50pk) | Packaging | 12.99 | pack | Premium kraft paper boxes | | 200 | TRUE
P002 | Plastic Cutlery Set (100pk) | Disposables | 8.50 | pack | Individually wrapped cutlery | | 500 | TRUE
P003 | Chef's Frying Pan 28cm | Equipment | 45.00 | each | Heavy duty non-stick | | 30 | TRUE
```

### Step 4: Create a Google Cloud Service Account

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable **Google Sheets API**:
   - Search "Google Sheets API" → Enable
4. Go to **IAM & Admin** → **Service Accounts**
5. Click **Create Service Account**
   - Name: `caterpro-sheets`
   - Click Create and Continue → Done
6. Click on the service account → **Keys** tab → **Add Key** → **JSON**
7. Download the JSON file — keep it safe!

### Step 5: Share your spreadsheet with the service account

1. Open your JSON file and copy the `client_email` value
   (looks like: `caterpro-sheets@your-project.iam.gserviceaccount.com`)
2. Open your Google Spreadsheet
3. Click **Share** → paste the email → give **Editor** access → Share

### Step 6: Fill in `.env.local`

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=caterpro-sheets@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nABC123...\n-----END RSA PRIVATE KEY-----"
GOOGLE_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
ADMIN_PASSWORD=your-secure-password
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Finding your Spreadsheet ID:**
```
https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
```

**Copying the private key:**
From the downloaded JSON file, copy the `private_key` field (including the `-----BEGIN...-----END-----` parts).
Replace actual newlines with `\n` in the .env file.

---

## 🛠️ Features

### Customer-facing
- 🏠 **Homepage** with hero, categories & CTA
- 🛒 **Product catalogue** with search, filter by category, sort
- 🛍️ **Shopping cart** with persistent storage (survives page refresh)
- ✅ **Checkout** — collects delivery details, saves order to Google Sheets

### Admin Dashboard (`/admin`)
- 🔐 **Password-protected login**
- 📦 **Products CRUD** — add, edit, deactivate products
- 📋 **Orders management** — view all orders, update status, see order items
- 📊 **Stats** — total orders, pending, delivered, revenue

---

## 🚀 Deploy to Vercel

1. Push code to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Deploy!

> ⚠️ For `GOOGLE_PRIVATE_KEY` in Vercel, paste the raw key with real newlines, not `\n`

---

## 💡 Tips

- Products marked `active: FALSE` in the sheet won't appear in the store
- "Deleting" a product just sets it to inactive (data is preserved)
- Orders are sorted newest-first in the admin panel
- Free delivery threshold is £75 (edit in `cart/page.tsx` and `checkout/page.tsx`)
- Admin session lasts 8 hours (cookie-based)
