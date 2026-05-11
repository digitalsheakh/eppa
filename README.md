# Eppa's Shop

A full-stack fragrance e-commerce platform built with **Next.js 14**, **Firebase**, and **Stripe**.

---

## Project Structure

```
eppas-shop/
├── app/
│   ├── page.tsx                  # Homepage
│   ├── shop/page.tsx             # Product catalogue
│   ├── shop/[slug]/page.tsx      # Product detail page
│   ├── cart/page.tsx             # Shopping cart
│   ├── checkout/page.tsx         # Checkout
│   ├── account/page.tsx          # Customer account & orders
│   ├── track-order/page.tsx      # Order tracking
│   ├── contact/page.tsx          # Contact form
│   ├── refund-policy/page.tsx    # Refund policy
│   ├── delivery-policy/page.tsx  # Delivery policy
│   └── admin/
│       ├── page.tsx              # Admin login
│       ├── products/page.tsx     # Manage products (CRUD)
│       ├── orders/page.tsx       # Manage & update orders
│       ├── customers/page.tsx    # View customers
│       └── settings/page.tsx     # Admin settings
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── CartDrawer.tsx
│   ├── HeroSlider.tsx
│   ├── Testimonials.tsx
│   ├── AdminSidebar.tsx
│   └── ScrollReveal.tsx
└── lib/
    ├── firebase.ts     # Firebase client config
    ├── db.ts           # Firestore data layer
    └── cartStore.ts    # Zustand cart (persisted)
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env.local`
```env
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (server)
FIREBASE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"

# Admin panel password
ADMIN_PASSWORD=your_secure_password

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Resend (email)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@eppa.shop
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Admin Dashboard

Access the admin panel at `/admin`. Log in with the password set in `ADMIN_PASSWORD`.

Features:
- **Products** — add, edit, toggle active/inactive, upload images
- **Orders** — view all orders, update status, add courier tracking
- **Customers** — view registered customers
- **Settings** — site configuration

---

## Deploy to Vercel

1. Push to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Deploy

> For `FIREBASE_PRIVATE_KEY` on Vercel, paste the raw key with real newlines (not `\n`).
