# ByteBite

A production-grade, real-time food ordering and delivery platform built as a TypeScript monorepo. Three role-based interfaces -- Customer, Restaurant Owner, and Driver -- synchronized via WebSockets, secured with session-based authentication, and designed with a cinematic dark luxury UI.

---

## Table of Contents

- [What This Demonstrates](#what-this-demonstrates)
- [User Flows](#user-flows)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Design System](#design-system)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running in Demo Mode](#running-in-demo-mode)
- [Pages and Routes](#pages-and-routes)
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
| Real-time multi-client sync | Socket.io broadcasts order lifecycle events; `useSocketInvalidation` hook auto-invalidates React Query caches with role-aware toast notifications |
| Role-based authentication | better-auth with Drizzle adapter; httpOnly session cookies; `requireAuth` and `requireRole` Express middleware |
| Payment lifecycle | Stripe Checkout with webhook signature verification; cash-on-delivery option; simulated fallback when keys are absent |
| Concurrent write safety | Optimistic locking on driver accept via `WHERE driver_id IS NULL`; returns 409 on race conflict |
| End-to-end type safety | OpenAPI spec generates React Query hooks and Zod validators via Orval; Drizzle schema provides TypeScript types from database to UI |
| Public browsing with gated checkout | Guests browse restaurants and menus freely; cart persists in localStorage; checkout requires authentication |
| Cinematic UI | Auto-play hero carousel, glassmorphism card system, scroll-to-expand restaurant hero, infinite marquee, 3D tilt cards, draggable testimonials |

---

## User Flows

### Guest (no account)

Browse the home page, explore restaurant menus, add items to cart. Cart persists across sessions. Checkout redirects to login. After signing in, the cart is preserved and checkout continues.

### Customer

Register with "Customer" role. Browse the cinematic home page with auto-play hero carousel, search restaurants, filter by cuisine. Open a restaurant to see the scroll-to-expand hero that reveals the menu. Add items, checkout via Card (Stripe) or Cash on Delivery. Track orders live with a 5-step animated progress bar. View order history with search, filters, and one-tap reorder.

### Restaurant Owner

Register with "Restaurant" role. Add a restaurant via the 4-step onboarding wizard (Info, Menu Items, Preview, Launch). Manage orders on the Kitchen Cockpit dashboard with revenue chart, activity timeline, and order pipeline (Accept, Cook, Ready).

### Driver

Register with "Driver" role. View earnings, delivery count, and active stats. Accept available pickups (race-safe with 409 on conflict). Complete deliveries.

---

## Architecture

```
                           Browser
    +--------------+  +--------------+  +--------------+
    |   Customer   |  |  Restaurant  |  |    Driver     |
    +--------------+  +--------------+  +--------------+
            |                |                  |
            v                v                  v
    +-----------------------------------------------+
    |         React 19 + Vite 7 Frontend            |
    |  Zustand . React Query . Framer Motion        |
    |  Wouter . Tailwind CSS 4 . Radix UI           |
    +------------------------+----------------------+
                             |  Vite proxy
                             v
    +-----------------------------------------------+
    |            Express 5 API Server               |
    |  better-auth . Drizzle ORM . Zod . Pino       |
    |  Socket.io . Stripe                           |
    +------------------------+----------------------+
                             |
                             v
                    +----------------+
                    |   PostgreSQL   |
                    +----------------+
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| Vite 7 | Build tool and dev server |
| Tailwind CSS 4 | Utility-first styling |
| Radix UI | Accessible component primitives |
| Framer Motion | Carousel, 3D tilt, drag gestures, scroll animations |
| Zustand | Client state (cart persisted to localStorage) |
| React Query | Server state, caching, auto-refetch |
| Wouter | Lightweight routing |
| Recharts | Dashboard analytics |
| Sonner | Toast notifications |
| Socket.io Client | Real-time events |

### Backend

| Technology | Purpose |
|-----------|---------|
| Express 5 | HTTP framework |
| better-auth | Session-based authentication |
| Drizzle ORM | Type-safe PostgreSQL queries |
| Zod | Runtime validation |
| Socket.io | Real-time events |
| Pino | Structured logging |
| Stripe | Payment processing (optional) |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| PostgreSQL | Primary database |
| pnpm workspaces | Monorepo management |
| TypeScript 5.9 | End-to-end type safety |
| Orval | OpenAPI codegen |
| esbuild | Server bundling |

---

## Features

| Feature | Customer | Restaurant | Driver |
|---------|:--------:|:----------:|:------:|
| Cinematic hero carousel (auto-play 2.5s, crossfade) | x | | |
| Public browsing without login | x | | |
| Search and filter by cuisine | x | | |
| Infinite marquee featured dishes | x | | |
| Scroll-to-expand restaurant hero | x | | |
| Circular food image menu cards | x | | |
| Cart with Card / Cash on Delivery | x | | |
| Live 5-step order tracking | x | | |
| Order history with search and reorder | x | | |
| Revenue trend chart | | x | |
| Activity timeline | | x | |
| Order pipeline (Accept, Cook, Ready) | | x | |
| 4-step restaurant onboarding wizard | | x | |
| Earnings and delivery stats | | | x |
| Race-safe pickup accept (409 on conflict) | | | x |
| Role-aware toast notifications | x | x | x |
| Session auth with role selection | x | x | x |
| Profile with stats | x | x | x |
| 3D tilt glassmorphism cards | x | | |
| Draggable testimonial shuffle cards | x | | |
| Responsive down to 375px | x | x | x |
| Avatar dropdown with sign out | x | x | x |

---

## Design System

### Theme

The entire application uses a luxury dark theme with glassmorphism effects.

| Element | Value |
|---------|-------|
| Background | `#0C0C0C` |
| Card surface | `bg-white/[0.04] backdrop-blur-xl` |
| Card border | `border-white/[0.08]` |
| Card hover | `bg-white/[0.07] border-white/[0.14]` with red glow shadow |
| Primary accent | `#E63946` |
| Text primary | `text-white` |
| Text secondary | `text-gray-400` to `text-gray-500` |

### Animation Patterns

| Pattern | Method | Duration |
|---------|--------|----------|
| Hero carousel | CSS `transition-opacity` | 700ms crossfade, 2.5s interval |
| Section reveals | Framer Motion `whileInView` | 500-600ms |
| How It Works cards | Directional entry (left, top, right) | 600ms staggered |
| Why Choose Us cards | Rotate + scale entry | 600ms staggered |
| Restaurant cards | 3D tilt via `useMotionValue` + `useSpring` | Real-time |
| Featured dishes | CSS `translateX` infinite marquee | 30s loop |
| Testimonials | Framer Motion drag with elastic snap | 350ms |
| About image | Slide from left with rotation correction | 700ms |
| Contact items | Staggered slide from left | 100ms apart |
| Auth pages | Scale + fade modal over food photo | 600ms |

---

## Project Structure

```
bytebite/
  artifacts/
    api-server/src/
      index.ts              Server entry
      app.ts                Express middleware and auth handler
      lib/auth.ts           better-auth configuration
      middlewares/auth.ts    requireAuth and requireRole
      routes/               health, menu, orders, drivers, checkout, webhooks
      socket/               Socket.io event emitters
    bytebite/src/
      App.tsx               Providers, auth guard, router
      pages/
        customer/home.tsx         Cinematic landing page
        customer/restaurant-menu.tsx  Scroll-to-expand menu
        customer/order-tracker.tsx    Live tracking
        customer/order-history.tsx    Past orders
        restaurant/dashboard.tsx      Kitchen cockpit
        restaurant/onboarding.tsx     4-step wizard
        driver/dashboard.tsx          Driver terminal
        profile.tsx                   User profile
        login.tsx                     Glassmorphism auth
        register.tsx                  Role selector auth
      components/
        layout.tsx            Adaptive header with avatar dropdown
        cart-sidebar.tsx      Cart with payment method selector
        ui/                   Radix primitives and custom components
        dashboard/            Revenue chart, timeline, driver stats
        shared/               Page transition, initials avatar
      hooks/
        use-auth.ts           Auth Zustand store
        use-store.ts          Cart Zustand store (persisted)
        useSocketInvalidation.ts  Socket cache reconciliation
  lib/
    db/src/
      index.ts              Drizzle instance
      seed.ts               Deterministic seed (6 restaurants, 40 items, 3 drivers)
      schema/               auth, restaurants, orders, drivers tables
    api-spec/               OpenAPI specification
    api-zod/                Generated Zod schemas
    api-client-react/       Generated React Query hooks
```

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- pnpm 10 or later
- PostgreSQL 14 or later

### Setup

```bash
git clone https://github.com/Nafeesa-Shehzadii/Byte-Bite.git
cd Byte-Bite
pnpm install

createdb bytebite
export DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/bytebite"

pnpm --filter @workspace/db run push
pnpm --filter @workspace/db run seed
```

### Run

Terminal 1 (API):
```bash
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/bytebite" \
  PORT=8080 pnpm --filter @workspace/api-server run dev
```

Terminal 2 (Frontend):
```bash
PORT=5173 BASE_PATH="/" pnpm --filter @workspace/bytebite run dev
```

Open http://localhost:5173. Browse as a guest or register an account.

---

## Running in Demo Mode

| Scenario | Behavior |
|----------|----------|
| No Stripe keys | Checkout simulated, order placed immediately |
| Stripe keys set | Real Stripe Checkout, order waits for webhook |
| Cash on Delivery | Order placed immediately regardless of Stripe |

```bash
export STRIPE_SECRET_KEY="sk_test_..."
export STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## Pages and Routes

### Public (no login required)

| Route | Page |
|-------|------|
| `/` | Home: hero carousel, featured dishes marquee, how it works, restaurants, why us, testimonials, about, contact |
| `/menu/:id` | Restaurant menu: scroll-to-expand hero, circular food images, inline quantity controls |
| `/login` | Glassmorphism login over food photography |
| `/register` | Role selector (Customer, Restaurant, Driver) with password strength |

### Protected (requires login)

| Route | Role | Page |
|-------|------|------|
| `/orders` | Customer | Order history with search, filters, reorder |
| `/track/:id` | Customer | Live 5-step order progress |
| `/profile` | All | User profile, stats, quick links |
| `/restaurant` | Restaurant | Kitchen cockpit with chart, timeline, board |
| `/restaurant/add` | Restaurant | 4-step onboarding wizard |
| `/driver` | Driver | Stats, assignments, available pickups |

---

## API Reference

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/healthz` | Health check |
| GET | `/api/restaurants` | List restaurants |
| GET | `/api/restaurants/:id` | Restaurant with menu |
| GET | `/api/menu` | Menu items |
| GET | `/api/menu/categories` | Menu categories |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Register (name, email, password, role) |
| POST | `/api/auth/sign-in/email` | Login |
| GET | `/api/auth/get-session` | Current session |
| POST | `/api/auth/sign-out` | Logout |

### Protected

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/restaurants` | restaurant | Create restaurant |
| GET | `/api/orders` | any | List orders |
| POST | `/api/orders` | any | Place order |
| GET | `/api/orders/:id` | any | Order details |
| GET | `/api/orders/summary` | restaurant | Stats and revenue |
| PATCH | `/api/orders/:id/status` | restaurant | Update status |
| GET | `/api/drivers/available` | driver | Ready orders |
| GET | `/api/drivers/my-orders` | driver | Assigned orders |
| PATCH | `/api/drivers/:orderId/accept` | driver | Accept (optimistic lock) |
| POST | `/api/checkout/session` | any | Create payment session |
| POST | `/api/webhooks/stripe` | none | Stripe webhook |

---

## Database Schema

### Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| user | Authentication | id, name, email, role, email_verified |
| session | Session management | id, token, expires_at, user_id |
| account | Auth providers | id, provider_id, user_id, password |
| verification | Email verification | id, identifier, value, expires_at |
| restaurants | Restaurant listings | id, name, description, image_url, cuisine_type, delivery_time, rating, owner_id |
| menu_items | Food items | id, restaurant_id, name, price, category, image_url, available |
| orders | Order records | id, customer_id, restaurant_id, driver_id, status, total, items (JSONB), payment_status |
| drivers | Driver profiles | id, name, phone, vehicle, avatar_url |

### Order Status Flow

```
placed --> accepted --> cooking --> ready --> assigned --> delivered
```

Driver accept uses optimistic locking: `UPDATE ... WHERE driver_id IS NULL`. Second driver receives 409 Conflict.

---

## Real-Time Events

| Event | When | Toast |
|-------|------|-------|
| `order:created` | New order placed | Restaurant: "New order received" |
| `order:status_changed` | Status updated | Customer: status label |
| `order:accepted` | Driver accepts | Driver: "Order assigned" |

---

## Authentication

1. Register via `/api/auth/sign-up/email` with name, email, password, role
2. better-auth creates user and account records, sets httpOnly session cookie
3. All API requests include the cookie via `credentials: "include"`
4. `requireAuth` validates session; `requireRole` checks role
5. Frontend `useAuth()` hydrates on mount via `GET /api/auth/get-session`
6. Cart clears on new account creation; persists across login sessions

---

## Payment Flow

**Card (Stripe):** Order created, checkout session created, order enters `pending_payment`, browser redirects to Stripe, webhook confirms payment, order moves to `placed`, socket broadcasts.

**Cash on Delivery:** Order created, simulated session, order placed immediately, socket broadcasts.

**Demo Mode:** No Stripe keys set. All payments simulated. Order placed immediately.

---

## Seeded Data

Run `pnpm --filter @workspace/db run seed` (idempotent).

| Restaurant | Cuisine | Rating | Items |
|------------|---------|--------|-------|
| Ember and Co. | American | 4.7 | 6 |
| Sakura Ramen House | Japanese | 4.8 | 7 |
| Verde Pizza Kitchen | Italian | 4.6 | 8 |
| Fuego Cantina | Mexican | 4.7 | 6 |
| Lemongrass and Co. | Thai | 4.9 | 7 |
| Aegean Table | Mediterranean | 4.8 | 6 |

3 driver profiles: Marcus Rivera, Priya Sharma, Jake Thompson.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm run build` | Typecheck and build |
| `pnpm run typecheck` | TypeScript checking |
| `pnpm --filter @workspace/db run push` | Push schema |
| `pnpm --filter @workspace/db run seed` | Seed data |
| `pnpm --filter @workspace/api-server run dev` | Start API |
| `pnpm --filter @workspace/bytebite run dev` | Start frontend |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate types |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | -- | PostgreSQL connection string |
| `PORT` | Yes | -- | Server port |
| `BASE_PATH` | Frontend | -- | URL base path |
| `STRIPE_SECRET_KEY` | No | -- | Stripe key (simulated if absent) |
| `STRIPE_WEBHOOK_SECRET` | No | -- | Stripe webhook secret |
| `FRONTEND_URL` | No | `http://localhost:5173` | Frontend URL for redirects |
| `BETTER_AUTH_URL` | No | `http://localhost:8080` | Auth base URL |
| `LOG_LEVEL` | No | `info` | Log level |
| `NODE_ENV` | No | -- | `development` for pretty logs |

---

## License

MIT
