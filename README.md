# PriceTrack

> **Tagline:** Compare smarter. Track prices. Buy when the price is right.  
> **Architecture:** Full-Stack MERN Platform (MongoDB, Express.js, React.js, Node.js)

---

## 1. Project Introduction

**PriceTrack** is a centralized e-commerce price comparison, historical price analysis, and target price monitoring platform.

In online retail, the same electronic item is frequently listed at different prices across major platforms like Amazon India, Flipkart, Croma, and Reliance Digital. Furthermore, retail prices fluctuate continuously during promotional cycles, flash sales, and algorithmic price changes. PriceTrack eliminates consumer uncertainty by consolidating multi-store price listings, visualizing 90-day historical price movements via interactive SVG charts, and automatically alerting shoppers when products reach their target budgets.

### Core Conceptual Flow
```
SEARCH  ──>  COMPARE  ──>  TRACK  ──>  WATCHLIST  ──>  ALERT
```

1. **SEARCH:** Query products by name, brand, category, model number, or paste a product URL.
2. **COMPARE:** Review real-time side-by-side pricing, delivery estimates, and stock status across retailers.
3. **TRACK:** Inspect 90 days of price fluctuation data rendered using native SVG time-series graphs.
4. **WATCHLIST:** Maintain a private, user-specific catalog of tracked products.
5. **ALERT:** Set custom budget thresholds; the automated background service checks listings and triggers in-app alerts upon price drops.

---

## 2. Problem Statement & Objectives

### The Problem
* Consumers spend excessive time manually checking multiple retail websites to find the lowest price.
* "Sale prices" and "festival discounts" are often illusory, inflated right before a discount is applied.
* Shoppers miss out on short-lived price drops because continuous manual monitoring is impractical.

### Project Objectives
* **Centralization:** Provide a single unified portal comparing multi-store offerings.
* **Transparency:** Expose true historical pricing through interactive charts so consumers can identify real deals versus artificial discounts.
* **Automation:** Run background price monitoring routines that notify users immediately when target prices are reached.
* **Security & Performance:** Strict adherence to modern web standards, cryptographic password security via Node.js native `scrypt`, and no bloated third-party dependencies.

---

## 3. Technology Stack

PriceTrack uses a clean, native technology stack with zero third-party UI framework bloat:

| Layer | Technologies Used | Notes |
| :--- | :--- | :--- |
| **Frontend** | React 18, React Router DOM v6, Native Fetch API, HTML5, Plain CSS3 | Modular CSS variables (light/dark mode), zero Tailwind/Bootstrap, crisp border geometry (no pill buttons) |
| **Icons & Charts** | Inline SVG & Native CSS Visualizations | Zero external charting libraries; interactive SVG time-series graphs with tooltips |
| **Backend** | Node.js, Express.js | Modular controller/service/adapter architecture |
| **Database** | MongoDB Official Node.js Driver (`mongodb` v6) | Indexed collections, connection pooling, compound unique constraints |
| **Security & Auth** | Node.js Built-in `crypto.scrypt`, Secure Tokens | Cryptographically salted password hashing, timing-safe evaluation, HTTP-only cookie support |
| **Scheduling** | Node.js Native Interval Scheduler | Configurable periodic background monitor with manual admin override |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PriceTrack Client (React)                 │
│  • Search & Catalog   • Price Comparison Table              │
│  • Native SVG Charts  • Watchlist & Alert Modals            │
│  • User Dashboard     • Admin Operations Console            │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API / Cookies
┌──────────────────────────────▼──────────────────────────────┐
│                  Express.js Backend Server                  │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │     Auth Service      │       │ Price Monitor Service │  │
│  │ (scrypt, tokens, ACL) │       │ (Interval & On-Demand)│  │
│  └───────────────────────┘       └───────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Store Adapters: Amazon, Flipkart, Croma, Reliance     │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ MongoDB Native Driver
┌──────────────────────────────▼──────────────────────────────┐
│                       MongoDB Database                      │
│  • users            • sessions          • products          │
│  • stores           • storeListings     • priceHistory      │
│  • watchlists       • priceAlerts       • notifications     │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Folder Structure

```
priceTrack-mini/
├── backend/
│   ├── adapters/
│   │   ├── amazonAdapter.js
│   │   ├── cromaAdapter.js
│   │   ├── demoPriceProvider.js
│   │   ├── flipkartAdapter.js
│   │   ├── myntraAdapter.js
│   │   ├── relianceAdapter.js
│   │   └── storeAdapterBase.js
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── alertController.js
│   │   ├── authController.js
│   │   ├── notificationController.js
│   │   ├── priceController.js
│   │   ├── productController.js
│   │   └── watchlistController.js
│   ├── jobs/
│   │   └── priceMonitoringJob.js
│   ├── middleware/
│   │   ├── adminAuth.js
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── alerts.js
│   │   ├── notifications.js
│   │   ├── priceHistory.js
│   │   ├── products.js
│   │   ├── sessions.js
│   │   ├── storeListings.js
│   │   ├── stores.js
│   │   ├── users.js
│   │   └── watchlists.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── authRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── priceRoutes.js
│   │   ├── productRoutes.js
│   │   └── watchlistRoutes.js
│   ├── services/
│   │   └── priceMonitorService.js
│   ├── utils/
│   │   ├── cryptoUtils.js
│   │   └── seedData.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── images/stores/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footer.jsx
│   │   │   ├── LoadingSkeleton.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PriceComparisonTable.jsx
│   │   │   ├── PriceHistoryChart.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── SetAlertModal.jsx
│   │   │   ├── SvgIcon.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── NotificationContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── AboutPage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── AlertsPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   ├── DealsPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── PrivacyPolicyPage.jsx
│   │   │   ├── ProductDetailsPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   ├── TermsPage.jsx
│   │   │   ├── UserDashboardPage.jsx
│   │   │   └── WatchlistPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   ├── chart.css
│   │   │   ├── comparison.css
│   │   │   ├── dashboard.css
│   │   │   ├── index.css
│   │   │   ├── modals.css
│   │   │   ├── navbar.css
│   │   │   └── product.css
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── test-suite.js
├── README.md
├── .gitignore
└── package.json
```

---

## 6. MongoDB Database Schema Design

The application uses 9 indexed collections in the `pricetrack` database:

1. **`users`**: User records with unique email index and scrypt-hashed credentials.
   * `_id`, `name`, `email`, `passwordHash`, `role` (`'user'` or `'admin'`), `createdAt`, `updatedAt`
2. **`sessions`**: Cryptographically secure active tokens with TTL expiration index.
   * `_id`, `userId`, `role`, `token`, `createdAt`, `expiresAt`
3. **`products`**: Catalog items indexed for full-text search across title, brand, and model number.
   * `_id`, `name`, `brand`, `category`, `description`, `image`, `modelNumber`, `specifications`, `createdAt`, `updatedAt`
4. **`stores`**: Registered retailer profiles.
   * `_id`, `storeName`, `storeSlug`, `storeLogo`, `website`, `isActive`, `createdAt`
5. **`storeListings`**: Current store-specific prices and delivery metadata with compound unique index on `{ productId, storeId }`.
   * `_id`, `productId`, `storeId`, `productUrl`, `currentPrice`, `originalPrice`, `availability`, `deliveryInformation`, `sourceType`, `lastUpdated`
6. **`priceHistory`**: Historical time-series points spanning 90 days with indexes on `{ productId, storeId, recordedAt }`.
   * `_id`, `productId`, `storeId`, `price`, `recordedAt`
7. **`watchlists`**: User-specific watched products with compound unique index on `{ userId, productId }`.
   * `_id`, `userId`, `productId`, `targetPrice`, `isActive`, `createdAt`
8. **`priceAlerts`**: User budget threshold alerts with status index (`'active'` or `'triggered'`).
   * `_id`, `userId`, `productId`, `targetPrice`, `alertStatus`, `lastNotifiedPrice`, `lastNotifiedAt`, `createdAt`, `updatedAt`
9. **`notifications`**: In-app notifications with read status and product metadata.
   * `_id`, `userId`, `productId`, `title`, `message`, `notificationType`, `isRead`, `metadata`, `createdAt`

---

## 7. REST API Endpoints

### Authentication
* `POST /api/auth/register` - Create new user account
* `POST /api/auth/login` - Authenticate with email/password
* `POST /api/auth/logout` - Invalidate active session
* `GET /api/auth/me` - Get profile of authenticated user
* `PUT /api/auth/profile` - Update display name
* `POST /api/auth/forgot-password` - Request secure password reset token
* `POST /api/auth/reset-password` - Reset password with token

### Products & Search
* `GET /api/products` - Filter catalog by query, category, brand, price range, and sort
* `GET /api/products/:id` - Fetch product details, specs, and price summary
* `GET /api/products/suggestions?q=` - Instant debounced search suggestions
* `GET /api/products/categories` - List all unique categories
* `GET /api/products/brands` - List all unique brands
* `GET /api/products/deals` - Products with highest discount percentages
* `GET /api/products/trending` - Products with high consumer tracking activity

### Price Intelligence
* `GET /api/prices/:productId` - Multi-store comparison table with lowest price highlight
* `GET /api/prices/:productId/history?days=30` - Historical price points for SVG graph
* `GET /api/prices/:productId/best-price` - Current lowest price store listing

### User Watchlist & Alerts (Protected)
* `GET /api/watchlist` - View user's private watchlist
* `POST /api/watchlist` - Add product to watchlist
* `PUT /api/watchlist/:id` - Edit target price or pause item
* `DELETE /api/watchlist/:id` - Remove product from watchlist
* `GET /api/alerts` - List active and triggered budget alerts
* `POST /api/alerts` - Set or update target price alert
* `PUT /api/alerts/:id` - Edit alert status or price
* `DELETE /api/alerts/:id` - Delete price alert

### Notifications (Protected)
* `GET /api/notifications` - Retrieve in-app notifications and unread badge count
* `PUT /api/notifications/:id/read` - Mark single notification as read
* `PUT /api/notifications/read-all` - Mark all notifications as read
* `DELETE /api/notifications/:id` - Delete notification
* `DELETE /api/notifications` - Clear all notifications

### Admin Operations (Protected: Role Admin)
* `GET /api/admin/dashboard` - Platform statistics and collection counts
* `GET /api/admin/users` - View registered user accounts
* `GET /api/admin/stores` - View connected retailer feeds
* `PUT /api/admin/store-listings/price` - Override a store's price (demonstration testing)
* `POST /api/admin/price-jobs/refresh` - On-demand trigger of price monitoring cycle
* `GET /api/admin/price-jobs` - View background scheduler status and execution metrics

---

## 8. Installation & Setup Instructions

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **MongoDB**: Locally running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### Step 1: Install Dependencies
From the repository root:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Database Seeding
Populate the database with 21 sample products, 5 stores, 90 days of price history records, and initial evaluation accounts:
```bash
cd backend
node utils/seedData.js
```

### Step 3: Start the Backend & Frontend Servers
In terminal 1 (Backend API on Port 5000):
```bash
cd backend
node server.js
```

In terminal 2 (Frontend React App on Port 3000):
```bash
cd frontend
npm start
```

Open your browser at: **`http://localhost:3000`**

---

## 9. Evaluation Demo Accounts

Pre-seeded accounts are provided for instant evaluation:

| Account Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Demo User** | `user@pricetrack.com` | `UserPassword123!` | Regular Shopper |
| **Administrator** | `admin@pricetrack.com` | `AdminPassword123!` | System Administrator |

*(Both accounts can also be quick-filled directly on the Login page with a single click).*

---

## 10. Automated Acceptance Testing

A dedicated test suite `test-suite.js` is provided to verify the 13-step demonstration scenario end-to-end:
```bash
node test-suite.js
```

### Demonstration Scenario Executed:
1. Opens PriceTrack API.
2. Authenticates as user (`user@pricetrack.com`).
3. Searches for "Sony WH-1000XM5".
4. Verifies pricing across stores (Flipkart: ₹29,990, Amazon: ₹30,490, Reliance Digital: ₹30,990, Croma: ₹31,200).
5. Confirms lowest price identified on Flipkart.
6. Retrieves 90-day historical time-series data for the native SVG graph.
7. Adds the product to the user's watchlist.
8. Configures a price alert with a target budget of ₹28,000.
9. Authenticates as administrator (`admin@pricetrack.com`).
10. Admin updates the demo price on Flipkart to ₹27,950.
11. Admin triggers the price monitoring process.
12. Returns to the user account session.
13. Verifies that the real-time price drop notification has been generated:  
    *`"Great news! Sony WH-1000XM5 Wireless Headphones is now available at ₹27,950 on Flipkart (₹50 below your target!)."`*

---

## 11. Custom Domain & Production Deployment Readiness

### Production Environment Variables
Configure the following in `backend/.env`:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/pricetrack?retryWrites=true&w=majority
DB_NAME=pricetrack
SESSION_SECRET=<random-64-character-string>
ADMIN_EMAIL=admin@pricetrack.com
ADMIN_PASSWORD=<secure-admin-password>
PRICE_CHECK_INTERVAL_MS=300000
```

### Frontend Production Build
```bash
cd frontend
npm run build
```
The compiled output in `frontend/dist` can be served directly by Nginx, Cloudflare Pages, or Express static middleware.

### Reverse Proxy Configuration (Nginx for Custom Domain)
```nginx
server {
    server_name pricetrack.yourdomain.com;

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /var/www/pricetrack/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 12. Design Philosophy

* **Clean SaaS E-Commerce Aesthetic:** Crisp rectangular buttons (`border-radius: 6px`), clear typographic hierarchy, subtle shadows, and neutral borders.
* **No AI Slop or Gimmicks:** Zero purple gradient clichés, no pill-shaped buttons, no fake star counters or artificial customer testimonials, no em dashes, and no distracting scroll animations.
* **Complete Transparency:** Simulated market feed sources are clearly labeled with demo badges; demo prices are never deceptively passed off as live partner APIs without authorization.
* **Full Accessibility & Contrast:** Dual theme support (Light & Dark) with WCAG AA compliant contrast ratios across all tables, charts, and modal dialogs.
