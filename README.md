# ByteBite

A real-time food ordering and delivery platform with three role-based interfaces — **Customer**, **Restaurant**, and **Driver** — synchronized via WebSockets and secured with session-based authentication.

## What This Demonstrates

| Concept | Implementation |
|---------|---------------|
| **Real-time multi-client sync** | Socket.io broadcasts order events; React Query caches auto-invalidate across all connected browsers |
| **Role-based authentication** | better-auth with Drizzle adapter; httpOnly session cookies; `requireAuth` + `requireRole` middleware |
| **Payment webhook lifecycle** | Stripe Checkout → `pending_payment` → webhook signature verification → `placed` + socket broadcast; simulated fallback when keys absent |
| **Concurrent write safety** | Optimistic locking on driver accept: `UPDATE ... WHERE driver_id IS NULL` prevents double-assignment (409 on conflict) |
| **End-to-end type safety** | OpenAPI spec → Orval codegen → generated React Query hooks + Zod validators; Drizzle schema → TypeScript types from DB to UI |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
│  ┌──────────┐  ┌────────────┐  ┌────────────────┐  │
│  │ Customer │  │ Restaurant │  │     Driver     │  │
│  └────┬─────┘  └─────┬──────┘  └───────┬────────┘  │
└───────┼──────────────┼──────────────────┼───────────┘
        │              │                  │
        ▼              ▼                  ▼
┌─────────────────────────────────────────────────────┐
│            React 19 + Vite 7 Frontend               │
│  Zustand · React Query · Wouter · Tailwind · Radix  │
└──────────────────────┬──────────────────────────────┘
                       │  HTTP + WebSocket proxy
                       ▼
┌─────────────────────────────────────────────────────┐
│              Express 5 API Server                   │
│  better-auth · Drizzle ORM · Zod · Pino            │
│                                                     │
│  /api/auth/*    → authentication (session cookies)  │
│  /api/*         → REST endpoints (JSON)             │
│  /ws/socket.io  → real-time events (Socket.io)      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │   PostgreSQL   │
              │   (Drizzle)    │
              └────────────────┘
```

## Features

| Feature | Customer | Restaurant | Driver |
|---------|:--------:|:----------:|:------:|
| Browse restaurants & menus | ✓ | | |
| Add to cart, place orders | ✓ | | |
| Live order tracking (stepped progress) | ✓ | | |
| Stripe / simulated checkout | ✓ | | |
| Revenue & order stats dashboard | | ✓ | |
| Accept orders, update status pipeline | | ✓ | |
| Real-time order board | | ✓ | |
| View available pickups | | | ✓ |
| Accept & deliver orders (race-safe) | | | ✓ |
| Toast notifications via Socket.io | ✓ | ✓ | ✓ |
| Session-based auth (register/login) | ✓ | ✓ | ✓ |

## Tech Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS 4, Radix UI, Zustand, Wouter, Framer Motion
- **Backend:** Express 5, Socket.io, Drizzle ORM, Zod, better-auth
- **Database:** PostgreSQL (Drizzle migrations)
- **Payments:** Stripe Checkout (with simulated fallback)
- **API:** OpenAPI spec → Orval → React Query hooks + Zod schemas
- **Monorepo:** pnpm workspaces, TypeScript 5.9

## Project Structure

```
├── artifacts/
│   ├── api-server/       # Express backend (port 8080)
│   └── bytebite/         # React frontend (port 5173)
├── lib/
│   ├── api-spec/         # OpenAPI specification + Orval codegen
│   ├── api-zod/          # Generated Zod validation schemas
│   ├── api-client-react/ # Generated React Query hooks
│   └── db/               # Drizzle ORM schema, seed, config
└── scripts/              # Utility scripts
```

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 10
- **PostgreSQL** >= 14

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Create the database
createdb bytebite

# 3. Set environment variables
export DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/bytebite"

# 4. Push schema + seed data (3 restaurants, 21 menu items, 3 drivers)
pnpm --filter @workspace/db run push
pnpm --filter @workspace/db run seed

# 5. Start the API server (terminal 1)
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/bytebite" \
  PORT=8080 pnpm --filter @workspace/api-server run dev

# 6. Start the frontend (terminal 2)
PORT=5173 BASE_PATH="/" pnpm --filter @workspace/bytebite run dev
```

Open **http://localhost:5173** and register an account (choose a role: customer, restaurant, or driver).

## Running in Demo Mode

ByteBite works fully without Stripe credentials:

| Env var set? | Behavior |
|---|---|
| `STRIPE_SECRET_KEY` **absent** | Checkout is simulated — order immediately moves to `placed`, payment marked as `paid` |
| `STRIPE_SECRET_KEY` **present** | Real Stripe Checkout session created; order stays `pending_payment` until the webhook confirms |

To enable real payments:

```bash
export STRIPE_SECRET_KEY="sk_..."
export STRIPE_WEBHOOK_SECRET="whsec_..."
```

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/healthz` | Health check |
| GET | `/api/restaurants` | List all restaurants |
| GET | `/api/restaurants/:id` | Get restaurant with menu items |
| GET | `/api/menu?restaurantId=` | List menu items |
| GET | `/api/menu/categories?restaurantId=` | List menu categories |

### Auth (better-auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Register (name, email, password, role) |
| POST | `/api/auth/sign-in/email` | Login → sets httpOnly session cookie |
| GET | `/api/auth/get-session` | Get current session + user |
| POST | `/api/auth/sign-out` | Logout |

### Protected (require session)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/restaurants` | restaurant | Create a restaurant |
| GET | `/api/orders` | any | List orders |
| POST | `/api/orders` | any | Place an order |
| GET | `/api/orders/:id` | any | Get order details |
| GET | `/api/orders/summary` | restaurant | Order stats & revenue |
| PATCH | `/api/orders/:id/status` | restaurant | Update order status |
| GET | `/api/drivers/available` | driver | Orders ready for pickup |
| GET | `/api/drivers/my-orders` | driver | Driver's assigned orders |
| PATCH | `/api/drivers/:orderId/accept` | driver | Accept order (race-safe) |
| POST | `/api/checkout/session` | any | Create checkout session |
| POST | `/api/webhooks/stripe` | — | Stripe webhook (no auth) |

## Seeded Data

Run `pnpm --filter @workspace/db run seed` to populate:

| Restaurant | Cuisine | Items |
|------------|---------|-------|
| Ember & Co. | American | 6 (burgers, wings, sides, drinks) |
| Sakura Ramen House | Japanese | 7 (ramen, appetizers, drinks) |
| Verde Pizza Kitchen | Italian | 8 (pizza, salads, sides, desserts, drinks) |

Plus 3 driver profiles (Marcus Rivera, Priya Sharma, Jake Thompson).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm run build` | Typecheck and build all packages |
| `pnpm run typecheck` | Run TypeScript type checking |
| `pnpm --filter @workspace/db run push` | Push schema to database |
| `pnpm --filter @workspace/db run seed` | Seed restaurants, menus, drivers |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API types/hooks from OpenAPI spec |

## License

MIT
