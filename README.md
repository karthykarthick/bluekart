# BlueCart Retail Store

A full-stack modern retail store web application with Stripe payment processing, Supabase backend integration, user & admin authentication, product & category inventory management, real-time parcel delivery tracking, and revenue analytics.

---

## Features

- **Stripe Payments**:
  - Express server integration (`/api/create-payment-intent`) and client-side checkout.
  - Test-mode card simulation with one-click autofill for instant testing (`4242 4242 4242 4242`).
  - Promo code discounts (e.g., `BLUE20` for 20% off).
  - Free express delivery threshold ($50+).

- **Authentication & Strict Role Separation**:
  - **Login Portal First**: Secure login gate requiring authentication before accessing the store catalog.
  - **Customer Experience**: Dedicated retail storefront without administrative controls, developer options, or internal revenue data.
  - **Admin Control Panel**: Guarded portal accessible only by authenticated store administrators, providing revenue analytics, delivery milestone tracking, and catalog controls.
  - Demo accounts provided for quick testing (`customer@bluecart.store` / `admin@bluecart.store`).

- **Admin Central**:
  - **Revenue & Metrics**: Real-time sales calculations, 7-day revenue trend chart, delivery status pipeline distribution.
  - **Product Catalog Management**: Add, edit, delete products, manage stock counts, SKUs, and pricing.
  - **Category Management**: Department categories with image covers and product counts.
  - **Delivery Operations**: Update order status, assign carriers & tracking numbers, append milestone checkpoint logs.

- **Parcel Delivery Tracker**:
  - Search any tracking number (e.g. `BL-98234812US`) or order number.
  - Visual 6-step progress pipeline: Placed ➔ Processing ➔ Shipped ➔ In Transit ➔ Out for Delivery ➔ Delivered.
  - Live carrier info and chronological waypoint logs.

- **Supabase Backend**:
  - `supabase-schema.sql` included with tables (`profiles`, `categories`, `products`, `orders`) and Row Level Security (RLS) policies.
  - Hybrid local storage synchronization ensures the app works interactively out-of-the-box in preview mode and connects directly when Supabase credentials are provided.

---

## 1. Running Locally

```bash
# Clone or export repository and install dependencies
npm install

# Run the development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 2. Deploying to Vercel

The repository includes a pre-configured `vercel.json` for seamless deployment.

### Option A: Via Vercel CLI
```bash
npm i -g vercel
vercel deploy --prod
```

### Option B: Via GitHub & Vercel Dashboard
1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Configure environment variables (see below).
4. Click **Deploy**.

---

## 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
```

---

## 4. Setting up Supabase Database

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** from the left navigation.
3. Paste the contents of `supabase-schema.sql` from this project and click **Run**.
4. Copy your **Project URL** and **anon public key** from Project Settings ➔ API into your `.env` file.
