# NovaMarket - Professional E-Commerce & Digital Marketing Platform

NovaMarket is a full-stack, production-oriented, responsive e-commerce web platform engineered with **Vue 3, Vite, Node.js, Express, PostgreSQL / Prisma ORM**, and modern responsive design. It provides a complete online shopping experience for customers and a comprehensive business owner administration dashboard for product management, sales analytics, order fulfillment, promotions, and customer support.

---

## 🌟 Architecture & Technology Stack

```
NovaMarket Platform
├── Frontend (Client Layer)
│   ├── Framework: Vue 3 (Composition API, `<script setup>`)
│   ├── Build Tool: Vite
│   ├── State Management: Pinia (Auth, Cart, Wishlist, Toast stores)
│   ├── Routing: Vue Router with Role-Based Access Guards
│   ├── Design System: Pure CSS3, HSL Custom Tokens, Glassmorphism, Micro-Animations
│   └── Typography: Google Fonts (Outfit & Plus Jakarta Sans)
│
├── Backend (Service Layer)
│   ├── Runtime: Node.js (ES Modules)
│   ├── Web Server: Express.js
│   ├── Security: Helmet, CORS, Express-Rate-Limit, Bcrypt.js, JWT Authentication
│   ├── File Storage: Multer Local Disk Storage with Cloudinary Bridge
│   ├── Payments: Razorpay Gateway Test Integration & Sandbox Simulation
│   ├── Communications: Nodemailer with SMTP & Development Console Simulation
│   ├── SEO: Dynamic `/sitemap.xml` & `/robots.txt` generator
│   └── Testing: Vitest & Supertest Integration Suite (15 Automated Tests)
│
└── Database (Data Layer)
    ├── Primary Production ORM: Prisma ORM (v5.22.0)
    ├── Production Engine: PostgreSQL
    └── Local Zero-Config Engine: SQLite (`dev.db` for instant out-of-the-box dev execution)
```

---

## 🗄️ Database Entity-Relationship Overview

- **User**: Authentication, password hashing, role-based authorization (`CUSTOMER`, `ADMIN`).
- **Address**: Saved shipping and delivery addresses linked to users.
- **Category**: Product categorization and breadcrumb taxonomy.
- **Product**: Hardware listings with title, brand, SKU, regular/selling prices, stock, specs (JSON), weight, dimensions, shipping terms, SEO metadata, and publication status.
- **ProductImage**: Multi-image gallery with primary sorting.
- **ProductVariant**: SKU-level variant options (Color, Storage, Material) with independent pricing and inventory.
- **InventoryLog**: Complete stock movement audit trail (restocks, sales, returns).
- **Cart & CartItem**: Persistent cart supporting guest sessions (`x-session-id`) and user accounts.
- **WishlistItem**: Customer saved hardware items.
- **Order & OrderItem**: Immutable order snapshots with item unit prices, SKUs, addresses, tax, and discount totals.
- **Payment**: Transaction ledger with gateway response logs.
- **Coupon**: Promotional codes with percentage or fixed discounts, minimum subtotal requirements, and limits.
- **Review**: Authentic customer reviews with verified purchase detection and admin moderation.
- **NewsletterSubscription**: Customer opt-ins with consent compliance.
- **ContactEnquiry**: Support ticket and concierge tracking.
- **AnalyticsEvent**: First-party e-commerce event telemetry.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node v24.19.0)
- npm v9+

### 1. Backend Setup & Database Seeding

Open a terminal in `backend/`:
```bash
cd backend

# Install dependencies
npm install

# Push database schema & generate Prisma client
npx prisma db push

# Seed initial store data (admin, demo customer, products, reviews, coupons)
npm run prisma:seed

# Run integration test suite
npm test

# Start the backend server (runs on port 5000)
npm run dev
```

### 2. Frontend Setup & Launch

Open a second terminal in `frontend/`:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Visit the website at: **`http://localhost:5173`**

---

## 🔑 Default Credentials & Demo Accounts

For quick evaluation, click **Sign In** in the navigation bar to use the one-click demo fill buttons:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@novamarket.com` | `Admin@12345` | Full Store Admin Portal (`/admin`), Product CRUD, Orders, CSV Export, Refunds, Analytics |
| **Customer** | `customer@novamarket.com` | `Customer@12345` | Shopping, Wishlist, Bag, Checkout, Order History (`/account`) |

---

## 📋 Comprehensive Feature Checklist

### Customer Experience & Storefront
- [x] Responsive, modern dark-themed aesthetics with HSL tailored colors and glassmorphic headers.
- [x] Homepage with hero banner, dynamic categories, featured items, bestsellers, new arrivals, and trending hardware.
- [x] Limited-time flash sale countdown banner with coupon codes.
- [x] Verified customer reviews and testimonials.
- [x] FAQ accordion with interactive toggle.
- [x] Product Catalogue with live keyword search, category filtering, price range filters, badge filters, and sorting.
- [x] Product Detail Page with thumbnail gallery switcher, discount calculation, variant selectors, stock availability, specifications table, and related items.
- [x] Slide-out shopping bag drawer with free-shipping progress tracker ($100 threshold).
- [x] Complete checkout with PIN code input, coupon application, 5% tax, and payment selection (COD, Test Card, Razorpay).
- [x] Order success page with confirmed order snapshot.
- [x] Real-time public package tracking with a 4-stage logistics timeline.
- [x] Customer account portal for viewing past orders, invoices, and profile management.
- [x] Customer wishlist with instant move-to-bag actions.
- [x] Direct WhatsApp Concierge floating button.

### Business Owner Administration
- [x] Protected Admin Portal accessible only to authorized administrators (`adminOnly` middleware guard).
- [x] Real-time business intelligence metrics: Total Revenue, Total Orders, Total Products, Average Order Value.
- [x] 7-Day interactive SVG revenue trend chart.
- [x] Low-stock inventory alert table with direct restock links.
- [x] Product catalogue management (Create, Edit, Archive, and Delete products).
- [x] Image upload via Multer with validation.
- [x] Product variants management with independent pricing and inventory.
- [x] Export complete product database as a CSV file (`/api/admin/products/export/csv`).
- [x] Order fulfillment management with status dropdown updates (PENDING, PROCESSING, SHIPPED, DELIVERED, REFUNDED).
- [x] Carrier tracking dispatch (Carrier name, AWB/Tracking Number, tracking URL).
- [x] Refund processing with automated inventory restock in the database.
- [x] Promotional coupon creation and active campaign monitoring.

### Marketing, SEO & Security
- [x] Dynamic XML Sitemap generator (`/sitemap.xml`) indexing static routes, categories, and products.
- [x] `robots.txt` (`/robots.txt`) with search engine crawler directives.
- [x] Newsletter subscription with consent checkbox and email verification.
- [x] Contact inquiry form with instant confirmation.
- [x] First-party analytics event tracking (`PAGE_VIEW`, `ADD_TO_CART`, `PURCHASE`).
- [x] Server-side price recalculation (client-side totals are never trusted).
- [x] Stock reservation check during checkout to prevent overselling.
- [x] Bcryptjs password hashing and JWT token expiration.
- [x] CORS, Helmet HTTP headers, and centralized error logging.

---

## 🐳 Production Deployment with Docker Compose & PostgreSQL

To deploy NovaMarket with a live PostgreSQL container:
```bash
# From the project root (where docker-compose.yml is located)
docker-compose up --build -d
```
This automatically boots:
1. `postgres` (PostgreSQL 16 on port 5432)
2. `novamarket-backend` (Node.js API connected to PostgreSQL on port 5000)
3. `novamarket-frontend` (Nginx serving optimized Vue 3 SPA on port 5173)

---

## 🛠️ Automated Testing

The project includes an automated integration test suite covering health, sitemap, auth, RBAC, catalogue, coupons, checkout, and admin analytics:
```bash
cd backend
npm test
```
**Results**: 15 tests passed with 100% success.

---

## 🔧 Troubleshooting Guide

1. **Port 5000 or 5173 Already in Use**:
   - Change `PORT=5001` in `backend/.env` and adjust the proxy target in `frontend/vite.config.js`.
2. **Database Locked or Migration Reset**:
   - Run `npx prisma db push --force-reset` followed by `npm run prisma:seed` in `backend/`.
3. **Switching to PostgreSQL**:
   - Set `DATABASE_URL="postgresql://user:pass@localhost:5432/novamarket"` in `backend/.env` and run `npx prisma db push --schema=prisma/schema.postgres.prisma`.
