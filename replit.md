# ByteBite

A real-time food ordering and delivery platform with three role views — Customer, Restaurant, and Driver — connected live via Socket.io.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/bytebite run dev` — run the frontend (port 18763)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — for real Stripe payments (falls back to simulated checkout if not set)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, Socket.io-client, Zustand
- API: Express 5 + Socket.io
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (restaurants.ts, orders.ts)
- `artifacts/api-server/src/routes/` — route handlers (menu, orders, drivers, checkout)
- `artifacts/api-server/src/socket/` — Socket.io event emitters
- `artifacts/bytebite/src/` — React frontend (pages/, components/, hooks/, lib/)

## Architecture decisions

- Socket.io at `/ws/socket.io` path (listed in api-server artifact.toml paths array so the proxy forwards it)
- Cart state managed in Zustand with localStorage persistence
- Role switcher (Customer / Restaurant / Driver) stored in Zustand — no auth required
- Stripe checkout is optional: if `STRIPE_SECRET_KEY` is not set, the server simulates a successful payment and marks the order as paid
- Orders use `jsonb` column for items array (avoids a separate order_items join table for simplicity)

## Product

- **Customer**: Browse Ember & Co. menu by category, add to cart, checkout with name + address, live order status tracker
- **Restaurant**: Stats dashboard (order counts by status + revenue), incoming orders board, one-click status progression (Accept → Cooking → Ready)
- **Driver**: Available pickups (orders with status "ready"), accept with driver name, mark as delivered
- **Real-time**: Every status change broadcasts via Socket.io and instantly updates all connected role views

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The `/ws` path MUST be in `artifacts/api-server/.replit-artifact/artifact.toml` paths array — without it the proxy drops WebSocket connections silently
- The API server uses `http.createServer(app)` + Socket.io (not `app.listen` directly) so Socket.io can attach to the same port
- After schema changes: run `pnpm --filter @workspace/db run push` then restart the API server workflow
- Orval body schema names must be entity-shaped (not `<OperationId>Body`) to avoid TS2308 collisions

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
