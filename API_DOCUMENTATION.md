# NovaMarket API Documentation

NovaMarket REST API provides secure, token-authenticated, normalized endpoints for customer shopping, order checkout, marketing automation, and business owner administration.

- **Base URL (Local)**: `http://localhost:5000`
- **Frontend URL**: `http://localhost:5173`
- **Default Format**: `application/json`
- **Authentication**: `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new customer account and create default cart |
| `POST` | `/api/auth/login` | Public | Authenticate user (Admin or Customer) and return JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile and saved addresses |
| `PUT` | `/api/auth/profile` | Authenticated | Update user first name, last name, phone number |
| `POST` | `/api/auth/addresses` | Authenticated | Add/update saved shipping address |

---

## 2. Product Catalogue Endpoints (`/api/products`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | Paginated product search, filtering, and sorting |
| `GET` | `/api/products/home-sections` | Public | Dynamic homepage sections (Featured, Best Sellers, Trending) |
| `GET` | `/api/products/:slug` | Public | Full product details, variants, specifications, and related items |

### Query Parameters for `/api/products`:
- `q`: Search keywords matching name, brand, description, or tags.
- `category`: Category slug or UUID.
- `brand`: Exact brand name.
- `minPrice` / `maxPrice`: Numerical price range filters.
- `isFeatured`, `isBestSeller`, `isTrending`: Filter by promotional badge (`true`).
- `sort`: `newest`, `price_asc`, `price_desc`, `name_asc`.
- `page`: Page index (default: `1`).
- `limit`: Page size (default: `12`).

---

## 3. Shopping Cart Endpoints (`/api/cart`)

Supports both authenticated customer accounts and guest sessions via header `x-session-id`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart` | Public / Guest | Retrieve bag items, unit prices, subtotal, and stock validation |
| `POST` | `/api/cart/add` | Public / Guest | Add product and selected variant to cart with stock check |
| `PUT` | `/api/cart/items/:itemId` | Public / Guest | Update item quantity (0 removes item) |
| `DELETE` | `/api/cart/items/:itemId` | Public / Guest | Remove item from cart |
| `DELETE` | `/api/cart/clear` | Public / Guest | Clear all items from cart |

---

## 4. Checkout & Orders (`/api/orders`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders/checkout` | Public / Guest | Atomic checkout with stock reservation, coupon recalculation, and order creation |
| `GET` | `/api/orders/my-orders` | Authenticated | Retrieve customer's historical orders and invoices |
| `GET` | `/api/orders/track` | Public | Real-time public package tracking via `orderNumber` and `email` |
| `GET` | `/api/orders/:idOrNumber`| Customer/Admin| Order detail view with item snapshots |

---

## 5. Promotional Coupons (`/api/coupons`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/coupons/validate` | Public | Validates coupon code against subtotal, returns discount amount |

### Default Active Seed Coupons:
- `WELCOME10`: 10% discount on entire first order.
- `FESTIVE25`: 25% discount on orders over $150 (max $120).
- `NOVA50`: Flat $50 discount on orders over $300.

---

## 6. Customer Reviews (`/api/reviews`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/reviews` | Optional Auth | Submit verified customer review with rating (1-5 stars) |

---

## 7. Marketing & SEO (`/api/marketing`, `/sitemap.xml`, `/robots.txt`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/marketing/newsletter` | Public | Newsletter subscription with user consent |
| `POST` | `/api/marketing/contact` | Public | Direct customer inquiry form |
| `POST` | `/api/marketing/events` | Public | Ingest analytics events (PAGE_VIEW, ADD_TO_CART, PURCHASE) |
| `GET` | `/sitemap.xml` | Public | Dynamic XML sitemap indexing categories and products |
| `GET` | `/robots.txt` | Public | Robots crawler directives |

---

## 8. Protected Admin Operations (`/api/admin/*`)

Requires Bearer token with `role: "ADMIN"`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/analytics` | Executive business intelligence, 7-day revenue trend, low-stock alerts |
| `GET` | `/api/admin/products` | Manage products table with search and pagination |
| `POST` | `/api/admin/products` | Create new hardware product with specs, images, and variants |
| `PUT` | `/api/admin/products/:id` | Update product, inventory, prices, and SEO tags |
| `DELETE` | `/api/admin/products/:id`| Archive or permanently remove product |
| `GET` | `/api/admin/products/export/csv` | Download complete product database in CSV format |
| `POST` | `/api/admin/upload` | Upload high-res product image (Multer disk/Cloudinary) |
| `GET` | `/api/admin/orders` | View and search all store customer orders |
| `PUT` | `/api/admin/orders/:id/status` | Update fulfillment status and tracking airway bill (AWB) |
| `POST` | `/api/admin/orders/:id/refund` | Process refund and automatically restore item inventory |
| `GET` | `/api/admin/coupons` | List all promotional coupon campaigns |
| `POST` | `/api/admin/coupons` | Create and activate new discount coupons |
| `GET` | `/api/admin/reviews` | Moderate customer reviews |
| `PUT` | `/api/admin/reviews/:id/status` | Approve or reject customer reviews |
