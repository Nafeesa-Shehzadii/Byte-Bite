# ByteBite

A full-stack, real-time food ordering and delivery platform with three role-based interfaces — **Customer**, **Restaurant Owner**, and **Driver** — synchronized via WebSockets, secured with session-based authentication, and built as a production-grade TypeScript monorepo.

---

## Table of Contents

- [What This Demonstrates](#what-this-demonstrates)
- [Screenshots & User Flows](#screenshots--user-flows)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Running in Demo Mode](#running-in-demo-mode)
- [Pages & Routes](#pages--routes)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Real-Time Events](#real-time-events)
- [Authentication](#authentication)
- [Payment Flow](#payment-flow)
- [Seeded Data](#seeded-data)
- [Scripts](#scripts)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## What This Demonstrates

| Concept | Implementation |
|---------|---------------|
| **Real-time multi-client sync** | Socket.io broadcasts order lifecycle events; a custom `useSocketInvalidation` hook auto-invalidates React Query caches across all connected browsers with role-aware toast notifications |
| **Role-based authentication** | better-auth with Drizzle PostgreSQL adapter; httpOnly session cookies; `requireAuth` + `requireRole` Express middleware; login/register with role selection (customer, restaurant, driver) |
| **Payment webhook lifecycle** | Stripe Checkout → `pending_payment` → `POST /api/webhooks/stripe` with signature verification → `placed` + socket broadcast; simulated fallback when Stripe keys are absent |
| **Concurrent write safety** | Optimistic locking on driver accept: `UPDATE orders SET driver_id = $1 WHERE id = $2 AND driver_id IS NULL` prevents double-assignment; returns 409 on conflict |
| **End-to-end type safety** | OpenAPI spec → Orval codegen → generated React Query hooks + Zod validators; Drizzle schema → TypeScript types from database to UI; zero manual type sync |
| **Interactive multi-step forms** | Restaurant onboarding wizard with 4 animated steps (Info → Menu → Preview → Launch), dynamic menu item builder, live preview card |
| **Modern UI/UX patterns** | Glassmorphism auth cards, animated stat counters, typeahead search, category filter chips, horizontal carousels, Framer Motion page transitions, skeleton loaders, sonner toast system |

---

## Screenshots & User Flows

### Customer Flow
1. **Register** → Choose "Customer" role on the animated register page
2. **Browse** → Home page with search bar, cuisine filter chips, trending restaurants carousel, and restaurant grid
3. **Order** → Tap a restaurant → browse menu with flip-card animations → add items to cart
4. **Checkout** → Open cart sidebar → enter delivery address → place order (Stripe or simulated)
5. **Track** → Live order tracker with stepped progress indicator (Placed → Accepted → Cooking → Ready → Delivered)
6. **History** → `/orders` page with search, status filters (All/Active/Delivered), and one-tap reorder

### Restaurant Owner Flow
1. **Register** → Choose "Restaurant" role
2. **Add Restaurant** → `/restaurant/add` — 4-step onboarding wizard:
   - Step 1: Restaurant name, description, cuisine type, cover image URL, delivery time, rating
   - Step 2: Add menu items (name, price, category, description, image) with dynamic add/remove
   - Step 3: Live preview showing exactly how the restaurant card will appear
   - Step 4: Launch — submits to API and redirects to dashboard
3. **Manage** → Kitchen Cockpit dashboard with:
   - Revenue/Active/Completed stat cards
   - Revenue trend area chart (recharts)
   - Recent activity timeline with color-coded status dots
   - Active order board — accept → start cooking → mark ready
   - Real-time updates via Socket.io

### Driver Flow
1. **Register** → Choose "Driver" role
2. **Dashboard** → Driver Terminal with:
   - Earnings/Delivered/Active stat cards at top
   - Active assignment section with delivery details
   - Available pickups queue — accept with one tap (race-safe, 409 if already taken)
   - Real-time order appearance via Socket.io

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        Browser                           │
│                                                          │
│  ┌────────────┐   ┌──────────────┐   ┌───────────────┐  │
│  │  Customer   │   │  Restaurant  │   │    Driver     │  │
│  │            │   │    Owner     │   │              │  │
│  │ - Browse    │   │ - Dashboard  │   │ - Available  │  │
│  │ - Order     │   │ - Onboarding │   │ - Accept     │  │
│  │ - Track     │   │ - Analytics  │   │ - Deliver    │  │
│  │ - History   │   │              │   │ - Earnings   │  │
│  └─────┬──────┘   └──────┬───────┘   └──────┬───────┘  │
└────────┼─────────────────┼───────────────────┼──────────┘
         │                 │                   │
         ▼                 ▼                   ▼
┌──────────────────────────────────────────────────────────┐
│              React 19 + Vite 7 Frontend                  │
│                                                          │
│  Zustand (cart state)  ·  React Query (server state)     │
│  Wouter (routing)  ·  Framer Motion (animations)         │
│  Tailwind CSS 4 + Radix UI (design system)               │
│  Sonner (toast notifications)  ·  Recharts (analytics)   │
└────────────────────────┬─────────────────────────────────┘
                         │
                         │  Vite dev proxy (HTTP + WebSocket)
                         │  /api/* → localhost:8080
                         │  /ws/*  → localhost:8080 (ws)
                         ▼
┌──────────────────────────────────────────────────────────┐
│                Express 5 API Server                      │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ better-auth │  │  REST API    │  │   Socket.io    │  │
│  │ /api/auth/* │  │  /api/*      │  │   /ws/socket   │  │
│  │             │  │              │  │                │  │
│  │ - sign-up   │  │ - restaurants│  │ - order:created│  │
│  │ - sign-in   │  │ - orders     │  │ - order:status │  │
│  │ - session   │  │ - drivers    │  │ - order:accept │  │
│  │ - sign-out  │  │ - checkout   │  │                │  │
│  └─────────────┘  │ - webhooks   │  └────────────────┘  │
│                    └──────────────┘                       │
│                                                          │
│  Middleware: requireAuth · requireRole · cookie-parser    │
│  Validation: Zod schemas (auto-generated from OpenAPI)   │
│  ORM: Drizzle (type-safe queries, schema-first)          │
│  Logging: Pino (structured, pretty in dev)               │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │     PostgreSQL       │
              │                      │
              │  Tables:             │
              │  - user (auth)       │
              │  - session (auth)    │
              │  - account (auth)    │
              │  - verification      │
              │  - restaurants       │
              │  - menu_items        │
              │  - orders            │
              │  - drivers           │
              └──────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.1 | UI framework |
| Vite | 7.3 | Build tool & dev server |
| Tailwind CSS | 4.1 | Utility-first styling |
| Radix UI | Latest | Accessible component primitives (50+ components) |
| Framer Motion | 12.x | Page transitions, animations, gestures |
| Zustand | 5.x | Client-side state (cart, persisted to localStorage) |
| React Query | 5.x | Server state, caching, auto-refetch |
| Wouter | 3.3 | Lightweight client-side routing |
| Recharts | 2.x | Dashboard analytics charts |
| Sonner | 2.x | Toast notification system |
| Socket.io Client | 4.x | Real-time event subscription |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Express | 5.2 | HTTP server framework |
| better-auth | Latest | Authentication (email/password, sessions, cookies) |
| Drizzle ORM | 0.45 | Type-safe PostgreSQL queries & schema management |
| Zod | 3.25 | Runtime request/response validation |
| Socket.io | 4.x | Real-time bidirectional events |
| Pino | 9.x | Structured logging with pretty-print in dev |
| Stripe | 22.x | Payment processing (optional) |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| PostgreSQL 14+ | Primary database |
| pnpm workspaces | Monorepo package management |
| TypeScript 5.9 | End-to-end type safety |
| Orval | OpenAPI → React Query hooks + Zod schemas codegen |
| esbuild | Server bundle (ESM output with source maps) |

---

## Features

### Feature Matrix by Role

| Feature | Customer | Restaurant | Driver |
|---------|:--------:|:----------:|:------:|
| Animated hero landing page | ✓ | | |
| Search restaurants (typeahead) | ✓ | | |
| Filter by cuisine category | ✓ | | |
| Trending restaurants carousel | ✓ | | |
| Browse menus with flip-card animations | ✓ | | |
| Add to cart with flying animations | ✓ | | |
| Place orders (Stripe / simulated) | ✓ | | |
| Live order tracking (5-step progress) | ✓ | | |
| Order history with search & reorder | ✓ | | |
| Revenue stats dashboard | | ✓ | |
| Revenue trend chart (recharts) | | ✓ | |
| Recent activity timeline | | ✓ | |
| Accept → Cook → Ready order pipeline | | ✓ | |
| Add new restaurant (4-step wizard) | | ✓ | |
| Real-time order board | | ✓ | |
| Earnings / delivered / active stats | | | ✓ |
| View available pickups | | | ✓ |
| Accept & deliver (optimistic lock) | | | ✓ |
| Role-aware toast notifications | ✓ | ✓ | ✓ |
| Session-based auth (register/login) | ✓ | ✓ | ✓ |
| User profile page | ✓ | ✓ | ✓ |
| Mobile-responsive (down to 375px) | ✓ | ✓ | ✓ |
| Mobile navigation (hamburger sheet) | ✓ | ✓ | ✓ |

---

## Project Structure

```
bytebite/
├── artifacts/
│   ├── api-server/                    # Express backend
│   │   ├── src/
│   │   │   ├── index.ts              # Server entry point (HTTP + Socket.io)
│   │   │   ├── app.ts                # Express app (middleware, auth handler, routes)
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts           # better-auth configuration (Drizzle adapter)
│   │   │   │   ├── logger.ts         # Pino structured logging
│   │   │   │   └── supabase.ts       # Optional Supabase sync
│   │   │   ├── middlewares/
│   │   │   │   └── auth.ts           # requireAuth + requireRole middleware
│   │   │   ├── routes/
│   │   │   │   ├── index.ts          # Route aggregator
│   │   │   │   ├── health.ts         # GET /api/healthz
│   │   │   │   ├── menu.ts           # Restaurants + menu items CRUD
│   │   │   │   ├── orders.ts         # Order lifecycle (create, list, update status)
│   │   │   │   ├── drivers.ts        # Driver operations (available, accept, my-orders)
│   │   │   │   ├── checkout.ts       # Stripe / simulated payment sessions
│   │   │   │   └── webhooks.ts       # Stripe webhook (signature verification)
│   │   │   └── socket/
│   │   │       └── index.ts          # Socket.io init + event emitters
│   │   ├── build.mjs                 # esbuild configuration
│   │   └── package.json
│   │
│   └── bytebite/                      # React frontend
│       ├── src/
│       │   ├── App.tsx                # Root: providers, auth guard, router
│       │   ├── main.tsx               # React DOM entry
│       │   ├── index.css              # Tailwind + CSS variables
│       │   ├── pages/
│       │   │   ├── customer/
│       │   │   │   ├── home.tsx       # Landing: hero, search, filters, grid
│       │   │   │   ├── restaurant-menu.tsx  # Menu browser with 3D flip cards
│       │   │   │   ├── order-tracker.tsx    # Live 5-step progress tracker
│       │   │   │   └── order-history.tsx    # Past orders, search, reorder
│       │   │   ├── restaurant/
│       │   │   │   ├── dashboard.tsx  # Kitchen cockpit: stats, chart, board
│       │   │   │   └── onboarding.tsx # 4-step restaurant creation wizard
│       │   │   ├── driver/
│       │   │   │   └── dashboard.tsx  # Terminal: stats, assignments, pickups
│       │   │   ├── profile.tsx        # User profile: avatar, stats, links
│       │   │   ├── login.tsx          # Animated login with auth background
│       │   │   ├── register.tsx       # Role selector cards, password strength
│       │   │   └── not-found.tsx      # 404 page
│       │   ├── components/
│       │   │   ├── layout.tsx         # Header, nav, mobile menu, cart trigger
│       │   │   ├── cart-sidebar.tsx    # Shopping cart sheet with checkout
│       │   │   ├── ui/               # 50+ Radix UI primitives
│       │   │   ├── home/
│       │   │   │   ├── search-bar.tsx      # Typeahead search
│       │   │   │   ├── category-chips.tsx  # Cuisine filter chips
│       │   │   │   ├── stats-banner.tsx    # Animated counting stats
│       │   │   │   └── popular-section.tsx # Trending carousel
│       │   │   ├── auth/
│       │   │   │   └── auth-background.tsx # Floating particles + grid
│       │   │   ├── dashboard/
│       │   │   │   ├── revenue-chart.tsx    # Recharts area chart
│       │   │   │   ├── order-timeline.tsx   # Vertical timeline
│       │   │   │   └── driver-stats.tsx     # Earnings/delivery cards
│       │   │   └── shared/
│       │   │       ├── page-transition.tsx   # Framer Motion wrapper
│       │   │       └── initials-avatar.tsx   # Gradient avatar from name
│       │   ├── hooks/
│       │   │   ├── use-auth.ts        # Auth Zustand store (login, register, logout)
│       │   │   ├── use-store.ts       # Cart Zustand store (add, remove, clear)
│       │   │   ├── useSocketInvalidation.ts  # Socket → RQ cache + toasts
│       │   │   ├── use-toast.ts       # Radix toast hook (legacy)
│       │   │   └── use-mobile.tsx     # Responsive breakpoint hook
│       │   └── lib/
│       │       ├── auth.ts            # Auth API wrappers (register, login, session)
│       │       ├── socket.ts          # Socket.io singleton
│       │       └── utils.ts           # cn() utility
│       ├── vite.config.ts             # Vite: proxy, Tailwind, plugins
│       └── package.json
│
├── lib/
│   ├── db/                            # Database layer
│   │   ├── src/
│   │   │   ├── index.ts              # Drizzle instance + pool export
│   │   │   ├── seed.ts               # Deterministic seed script
│   │   │   └── schema/
│   │   │       ├── index.ts          # Schema barrel export
│   │   │       ├── auth.ts           # user, session, account, verification tables
│   │   │       ├── restaurants.ts    # restaurants + menu_items tables
│   │   │       ├── orders.ts         # orders table (JSONB items, FK to users)
│   │   │       └── drivers.ts        # drivers profiles table
│   │   ├── drizzle.config.ts         # Drizzle Kit config
│   │   └── package.json
│   │
│   ├── api-spec/                      # OpenAPI specification
│   │   ├── openapi.yaml              # API contract (source of truth)
│   │   └── orval.config.ts           # Codegen config
│   │
│   ├── api-zod/                       # Generated Zod schemas
│   │   └── src/generated/            # Auto-generated from OpenAPI
│   │
│   └── api-client-react/             # Generated React Query hooks
│       ├── src/
│       │   ├── custom-fetch.ts       # Fetch wrapper (credentials: include)
│       │   └── generated/            # Auto-generated hooks
│       └── package.json
│
├── pnpm-workspace.yaml                # Workspace packages + catalog versions
├── tsconfig.base.json                 # Shared TypeScript config
└── package.json                       # Root workspace scripts
```

---

## Prerequisites

| Requirement | Minimum Version |
|-------------|----------------|
| Node.js | 20.x |
| pnpm | 10.x |
| PostgreSQL | 14.x |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Nafeesa-Shehzadii/Byte-Bite.git
cd Byte-Bite
pnpm install
```

### 2. Create the database

```bash
createdb bytebite
# or via psql:
psql -U postgres -c "CREATE DATABASE bytebite;"
```

### 3. Set environment variables

```bash
export DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/bytebite"
```

### 4. Push the schema and seed data

```bash
pnpm --filter @workspace/db run push
pnpm --filter @workspace/db run seed
```

This creates all tables (user, session, account, verification, restaurants, menu_items, orders, drivers) and seeds:
- 3 restaurants with 21 menu items
- 3 driver profiles

### 5. Start the API server (Terminal 1)

```bash
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/bytebite" \
  PORT=8080 pnpm --filter @workspace/api-server run dev
```

### 6. Start the frontend (Terminal 2)

```bash
PORT=5173 BASE_PATH="/" pnpm --filter @workspace/bytebite run dev
```

### 7. Open the app

Navigate to **http://localhost:5173** and register an account.

- Choose **Customer** to browse, order, and track
- Choose **Restaurant** to manage a kitchen and add restaurants
- Choose **Driver** to accept and deliver orders

---

## Running in Demo Mode

ByteBite works fully without any Stripe credentials. Payments are simulated automatically.

| Scenario | Behavior |
|----------|----------|
| `STRIPE_SECRET_KEY` **not set** | Checkout is simulated — order immediately moves to `placed`, payment marked as `paid`, socket event fires instantly |
| `STRIPE_SECRET_KEY` **set** | Real Stripe Checkout session is created; order enters `pending_payment`; stays there until the Stripe webhook confirms payment |

To enable real Stripe payments:

```bash
export STRIPE_SECRET_KEY="sk_test_..."
export STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## Pages & Routes

### Customer Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Animated hero, search bar, cuisine filters, trending carousel, restaurant grid |
| `/menu/:id` | Restaurant Menu | Category tabs, flip-card menu items, add-to-cart with flying animations |
| `/track/:id` | Order Tracker | 5-step animated progress (Placed → Accepted → Cooking → Ready → Delivered), order items + delivery details |
| `/orders` | Order History | Search by restaurant, filter by status (All/Active/Delivered), reorder past orders |
| `/profile` | Profile | Avatar, email, role badge, order stats, quick links |

### Restaurant Routes

| Route | Page | Description |
|-------|------|-------------|
| `/restaurant` | Kitchen Cockpit | Revenue/active/completed stat cards, revenue trend chart, activity timeline, active order board with pipeline buttons |
| `/restaurant/add` | Restaurant Onboarding | 4-step wizard: Basic Info → Menu Items → Preview → Launch |

### Driver Routes

| Route | Page | Description |
|-------|------|-------------|
| `/driver` | Driver Terminal | Earnings/delivered/active stats, active assignments, available pickups queue |

### Auth Routes

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Animated particle background, glassmorphism card, password toggle |
| `/register` | Register | Role selector cards (Customer/Restaurant/Driver), password strength indicator |

### Other

| Route | Page |
|-------|------|
| `/profile` | User profile (all roles) |
| `*` | 404 Not Found |

---

## API Reference

### Public Endpoints (no authentication required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/healthz` | Health check — returns `{ status: "ok" }` |
| `GET` | `/api/restaurants` | List all restaurants (id, name, description, imageUrl, cuisineType, deliveryTime, rating) |
| `GET` | `/api/restaurants/:id` | Get single restaurant with full menu items array |
| `GET` | `/api/menu?restaurantId=` | List menu items, optionally filtered by restaurant |
| `GET` | `/api/menu/categories?restaurantId=` | List distinct menu categories |

### Authentication Endpoints (handled by better-auth)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/sign-up/email` | `{ name, email, password, role }` | Register a new user; sets httpOnly session cookie |
| `POST` | `/api/auth/sign-in/email` | `{ email, password }` | Login; sets httpOnly session cookie |
| `GET` | `/api/auth/get-session` | — | Returns `{ user, session }` or null |
| `POST` | `/api/auth/sign-out` | — | Clears session cookie |

### Protected Endpoints (require session cookie)

| Method | Endpoint | Required Role | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/restaurants` | restaurant | Create restaurant with nested `menuItems` array |
| `GET` | `/api/orders` | any | List orders (optionally filter by `?status=`) |
| `POST` | `/api/orders` | any | Place order — `customerName` auto-set from session |
| `GET` | `/api/orders/:id` | any | Get order details |
| `GET` | `/api/orders/summary` | restaurant | Aggregated stats: total, placed, accepted, cooking, ready, delivered, revenue |
| `PATCH` | `/api/orders/:id/status` | restaurant | Update order status through pipeline |
| `GET` | `/api/drivers/available` | driver | List orders with status `ready` (ready for pickup) |
| `GET` | `/api/drivers/my-orders` | driver | List orders assigned to the current driver (by session) |
| `PATCH` | `/api/drivers/:orderId/accept` | driver | Accept order — uses optimistic locking (`driver_id IS NULL`); 409 if already taken |
| `POST` | `/api/checkout/session` | any | Create Stripe checkout session (or simulated) |

### Webhook Endpoint (no authentication — Stripe signature verification)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/webhooks/stripe` | Verifies `stripe-signature` header; on `checkout.session.completed`: sets order status to `placed`, payment to `paid`, emits socket event |

---

## Database Schema

### Auth Tables (managed by better-auth)

| Table | Key Columns |
|-------|-------------|
| `user` | `id` (text PK), `name`, `email` (unique), `role` (customer/restaurant/driver), `email_verified`, `created_at`, `updated_at` |
| `session` | `id` (text PK), `token` (unique), `expires_at`, `user_id` → user, `ip_address`, `user_agent` |
| `account` | `id` (text PK), `provider_id`, `user_id` → user, `password` (hashed) |
| `verification` | `id` (text PK), `identifier`, `value`, `expires_at` |

### Application Tables

| Table | Key Columns |
|-------|-------------|
| `restaurants` | `id` (serial PK), `name`, `description`, `image_url`, `cuisine_type`, `delivery_time`, `rating`, `owner_id` → user |
| `menu_items` | `id` (serial PK), `restaurant_id` → restaurants, `name`, `description`, `price`, `category`, `image_url`, `available` |
| `orders` | `id` (serial PK), `customer_name`, `customer_id` → user, `restaurant_id` → restaurants, `driver_name`, `driver_id` → user, `status`, `total`, `delivery_address`, `items` (JSONB), `payment_status`, `stripe_session_id` |
| `drivers` | `id` (serial PK), `name` (unique), `phone`, `vehicle`, `avatar_url`, `available` |

### Order Status Flow

```
placed → accepted → cooking → ready → assigned → delivered
                                        ↑
                              driver accepts (race-safe)
```

---

## Real-Time Events

Socket.io is used for instant cross-client updates. The server emits events; the frontend `useSocketInvalidation` hook listens, invalidates React Query caches, and shows role-aware toasts.

| Event | Payload | Triggered When | Toast (role) |
|-------|---------|----------------|--------------|
| `order:created` | `{ id, customerName, restaurantId, status, total }` | New order placed | "New order received!" (restaurant) |
| `order:status_changed` | `{ orderId, status }` | Order status updated | "Cooking in progress" etc. (customer) |
| `order:accepted` | `{ orderId, driverName }` | Driver accepts order | "Order assigned" (driver) |

---

## Authentication

ByteBite uses [better-auth](https://better-auth.com) with the Drizzle PostgreSQL adapter.

**How it works:**
1. User registers via `POST /api/auth/sign-up/email` with `{ name, email, password, role }`
2. better-auth creates a `user` record and an `account` record (hashed password)
3. A `session` record is created and an httpOnly cookie is set on the response
4. Every subsequent request includes this cookie automatically (via `credentials: "include"` in the fetch wrapper)
5. The `requireAuth` middleware calls `auth.api.getSession()` with the request headers; if no valid session, returns 401
6. The `requireRole("restaurant")` middleware checks `req.user.role`; if mismatch, returns 403

**Frontend flow:**
- On app mount, `useAuth().fetchUser()` calls `GET /api/auth/get-session`
- If no session → redirect to `/login`
- If session exists → store user in Zustand, render app
- After login/register → redirect to role-appropriate dashboard

---

## Payment Flow

### With Stripe (production)

```
Customer places order
        │
        ▼
POST /api/orders → order created (status: "placed")
        │
        ▼
POST /api/checkout/session → Stripe Checkout session created
        │                     order status → "pending_payment"
        │                     order gets stripe_session_id
        ▼
Browser redirects to Stripe Checkout page
        │
        ▼ (customer pays)
        │
Stripe sends webhook → POST /api/webhooks/stripe
        │                 verify signature with STRIPE_WEBHOOK_SECRET
        │                 extract orderId from session.metadata
        ▼
Order status → "placed", payment_status → "paid"
Socket.io emits "order:status_changed"
        │
        ▼
All connected clients see the update instantly
```

### Without Stripe (demo mode)

```
Customer places order
        │
        ▼
POST /api/orders → order created (status: "placed")
        │
        ▼
POST /api/checkout/session → simulated session
        │                     order status → "placed" immediately
        │                     payment_status → "paid" immediately
        │                     Socket.io emits "order:status_changed"
        ▼
Customer redirected to order tracker
```

---

## Seeded Data

Run `pnpm --filter @workspace/db run seed` to populate the database. The seed is **idempotent** — safe to run multiple times (clears existing data first in FK-safe order).

### Restaurants

| Restaurant | Cuisine | Menu Items | Categories |
|------------|---------|------------|------------|
| Ember & Co. | American | 6 | Burgers, Wings, Sides, Drinks |
| Sakura Ramen House | Japanese | 7 | Ramen, Appetizers, Drinks |
| Verde Pizza Kitchen | Italian | 8 | Pizza, Salads, Sides, Desserts, Drinks |

### Drivers

| Name | Vehicle | Phone |
|------|---------|-------|
| Marcus Rivera | Honda Civic 2022 | +1 (555) 234-5678 |
| Priya Sharma | Toyota Corolla 2023 | +1 (555) 345-6789 |
| Jake Thompson | Subaru Impreza 2021 | +1 (555) 456-7890 |

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all workspace dependencies |
| `pnpm run build` | Typecheck and build all packages |
| `pnpm run typecheck` | Run TypeScript type checking across all packages |
| `pnpm --filter @workspace/db run push` | Push Drizzle schema to PostgreSQL |
| `pnpm --filter @workspace/db run seed` | Seed restaurants, menu items, and driver profiles |
| `pnpm --filter @workspace/api-server run dev` | Build and start the API server |
| `pnpm --filter @workspace/bytebite run dev` | Start the Vite frontend dev server |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API types/hooks from OpenAPI spec |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `PORT` | Yes | — | Server port (8080 for API, 5173 for frontend) |
| `BASE_PATH` | Frontend only | — | Base URL path (use `/` for local dev) |
| `STRIPE_SECRET_KEY` | No | — | Stripe secret key; if absent, payments are simulated |
| `STRIPE_WEBHOOK_SECRET` | No | — | Stripe webhook signing secret |
| `BETTER_AUTH_URL` | No | `http://localhost:8080` | Base URL for better-auth callbacks |
| `LOG_LEVEL` | No | `info` | Pino log level (trace, debug, info, warn, error) |
| `NODE_ENV` | No | — | Set to `development` for pretty logs |

---

## License

MIT
