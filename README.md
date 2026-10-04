# Waybridge — Logistics Webhook Management Platform

A full-stack logistics platform frontend: shipment management, a public
customer-tracking page, an event/webhook delivery pipeline, and an admin
dashboard — built on **Next.js 16 (App Router)**, **shadcn/ui**, **Radix UI**,
**Tailwind CSS v4**, and **Motion**. It talks to a separate Express/MongoDB
backend in the sibling `davinci/` directory.

This project replaces an earlier Vite + React Router SPA that only handled
webhook CRUD. The rebuild keeps the same backend contract but moves auth and
data-fetching entirely server-side (Next's BFF pattern) and expands scope to
the full platform described in the product roadmap: shipments, events,
deliveries, public tracking, marketing pages, a demo receiver, and settings.

## Attribution

The projects in [Waybridge](https://github.com/TS-Academy-Webhooks/Waybridge)
and [Waybridge-BE](https://github.com/TS-Academy-Webhooks/Waybridge-BE) are
direct results of the efforts of everyone listed in the `CONTRIBUTORS.md`
files of both repositories. Both projects also owe their success to the
underlying work in the
[Webhook project](https://github.com/TS-Academy-Webhooks/Webhook).

### Contributors

- Faith Gabriel ([@Faithgabriel1](https://github.com/Faithgabriel1))
- Egele Tochi Vivian ([@Kingsley-Vivian](https://github.com/Kingsley-Vivian))
- Babs-Alli Ayomipo David ([@BabsAlliDev](https://github.com/BabsAlliDev))
- Opeyemi Daodu ([@Alternateopeyemi](https://github.com/Alternateopeyemi))
- Nnanyerugo Victory ([@ivynvc](https://github.com/ivynvc))
- Emmanuel Agbavwe ([@Aro1914](https://github.com/Aro1914))

---

## Tech stack

| Layer            | Choice                                                             |
| ----------------- | ------------------------------------------------------------------ |
| Framework         | Next.js 16 (App Router, Turbopack, Server Actions, `proxy.ts`)      |
| UI primitives     | shadcn/ui (New York style) on top of Radix UI / `@base-ui/react`   |
| Styling           | Tailwind CSS v4 (`globals.css` tokens, no `tailwind.config.js`)     |
| Animation         | [Motion](https://motion.dev) (`motion/react`)                      |
| Forms             | `react-hook-form` + `zod` (`@hookform/resolvers`)                   |
| Toasts            | `sonner`                                                            |
| Icons             | `lucide-react`                                                      |
| Package manager   | `pnpm` (see `packageManager` field — **use pnpm, not npm/yarn**)   |
| Backend           | Express + MongoDB/Mongoose, JWT auth (separate repo, see below)     |

---

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The app expects a
running backend (see [Backend dependency](#backend-dependency) below) —
without it, every authenticated page will fail its server-side `fetch` calls.

### Environment variables

Create `.env` (already gitignored):

```bash
BACKEND_API_URL=http://localhost:5000/api
```

`BACKEND_API_URL` is **server-only** (read in `lib/api-config.ts`, never
prefixed `NEXT_PUBLIC_*`) — all backend requests are made from Server
Components, Server Actions, and Route Handlers, never from the browser. If
you need the browser to know a backend-derived URL (e.g. the demo receiver
URL shown on `/demo-receiver`), pass it down as a plain prop from a Server
Component; don't expose the base URL itself to the client.

### SEO site origin

Canonical URLs, social metadata, and the sitemap use `NEXT_PUBLIC_SITE_URL`.
If unset, it defaults to `http://localhost:3000` in development and
`https://waybridge-six.vercel.app` in production. Set it to the exact site
origin (scheme and host, without a path or query) when deploying on a custom
domain.

### Installable web app

Waybridge can be installed through the browser's native install control or, on
iOS, Safari's **Share → Add to Home Screen** action. The installed app opens
the dashboard; signed-out users follow the existing login redirect. Production
installation requires HTTPS (localhost is treated as secure during development).
Waybridge follows the selected light/dark appearance, but it is an online client:
shipment data and backend features require a network connection, and no offline
cache is provided.

### Available scripts

```bash
pnpm dev      # next dev (Turbopack, port 3000)
pnpm build    # next build — also runs the TypeScript checker
pnpm start    # next start (serve the production build)
pnpm lint     # eslint
```

**Before committing any change, run `pnpm build` and `pnpm lint` and confirm
both are clean.** This is the standing bar used throughout this project's
history — see [Verification workflow](#verification-workflow).

---

## Backend dependency

This frontend has **no backend code of its own**. It is a pure client of the
Express API defined in the sibling `davinci/` directory. To run the
full stack locally:

```bash
cd ../davinci
npm run dev
```

The backend needs its own `.env` configured as described in its README. It
listens on port 5000 by default; this project's default `BACKEND_API_URL`
targets that port.

The frontend integrates with the merged API contract documented in
`../davinci/openapi.yaml` and summarized in `../davinci/API_MIGRATION.md`.
When the backend is running locally, its interactive API reference is at
[http://localhost:5000/docs](http://localhost:5000/docs).

It supports customer-owned shipments, user-owned webhooks, admin-only event
views, delivery summaries and retries, and the demo receiver. Refresh tokens are delivered as
HttpOnly cookies; configure `BACKEND_API_URL` to the backend origin and use
the documented auth/session flow rather than storing refresh tokens in
browser-accessible storage.

The backend issues registration's access token as `data.token`; login and
refresh return both `data.accessToken` and the compatible `data.token` alias.
Event list/detail endpoints require an admin account; customer shipment,
webhook, and delivery data is scoped to its owner.

The `/demo-receiver` page is integrated with the backend receiver API. Webhook
POSTs go to the public receiver URL; request inspection, clearing, and response
configuration are admin-only. The page supports request filters, pagination,
signature details, configurable success/failure responses, and reset actions.
History and response profiles are in memory and reset when the backend restarts.
Production deployments must enable the backend route with
`ENABLE_DEMO_RECEIVER=true`.

If the backend contract changes, consult its migration guide and the
corresponding route/controller before adjusting the frontend.

---

## Project structure

```
app/
  (auth)/              # /login, /signup — public, unauthenticated layout
  (marketing)/          # /, /about — public landing pages
  (dashboard)/           # authenticated app shell (sidebar + breadcrumbs)
    dashboard/            # aggregate stats + recent activity
    shipments/            # list, detail, create
    webhooks/              # list, detail, create, edit
    events/                # list, detail (+ deliveries triggered by the event)
    deliveries/             # list, detail (+ attempt history, resend)
    demo-receiver/           # demo receiver tools
    settings/                 # profile info + logout
  track/                # /track — public, no-auth customer tracking page
  layout.tsx, error.tsx  # root layout + root error boundary
  globals.css             # Tailwind v4 tokens (design system source of truth)

features/               # feature-folder pattern: one dir per domain
  auth/                  # auth-actions.ts (login/signup/logout Server Actions)
  shipments/              # shipment-actions.ts + components/
  webhooks/                # webhook-actions.ts + components/
  events/                   # components/ (read-only, no actions file)
  deliveries/                # delivery-actions.ts (resend) + components/
  tracking/                    # tracking-actions.ts + shipment-timeline.tsx
  dashboard/                    # stat cards, aggregate panels

lib/                    # server-only data layer + shared helpers
  api-config.ts           # BACKEND_API_URL, DEMO_RECEIVER_URL
  server-fetch.ts          # authFetch<T>(), ApiRequestError, buildQuery()
  session.ts                # httpOnly cookie session (create/delete/read)
  dal.ts                      # Data Access Layer: verifySession(), getCurrentUser()
  *-service.ts                 # one per domain: webhook/shipment/event/delivery
  validate-*.ts                  # zod schemas mirroring backend validation rules
  format-date.ts, format-event-type.ts

constants/               # single source of truth for enums shared across features
  shipment-status.ts       # SHIPMENT_STATUSES, VALID_TRANSITIONS, badge variants
  webhook-events.ts          # derives from shipment-status.ts (no duplication)
  delivery-status.ts           # DELIVERY_STATUS_BADGE_VARIANT

components/
  ui/                     # shadcn primitives (generated — see note below)
  app-sidebar.tsx, nav-user.tsx  # hand-written app-shell chrome

proxy.ts                 # Next 16's middleware — optimistic cookie-presence
                          # auth gate (PROTECTED_PREFIXES / AUTH_ONLY_PREFIXES)
```

---

## Architecture notes

### Server-side session handling (no client-side JWT)

Unlike the old SPA (which stored the JWT in `localStorage` and attached it
via an axios interceptor), this app follows Next 16's **BFF (Backend-for-
Frontend) pattern**:

- On login/signup, the Server Action in `features/auth/auth-actions.ts` calls
  the backend, receives a JWT, and stores it in an **httpOnly cookie**
  (`lib/session.ts`, cookie name `session_token`).
- Every subsequent authenticated request reads that cookie **server-side**
  (`lib/dal.ts`'s `getAuthHeader()`) and attaches it as an `Authorization:
Bearer <token>` header when calling the backend from a Server Component,
  Server Action, or Route Handler.
- The browser never sees the raw JWT. There is no client-side fetch to the
  backend anywhere in this codebase — every data-fetching function in
  `lib/*-service.ts` is annotated `import "server-only"`.
- `proxy.ts` (formerly `middleware.ts` in older Next versions) does a fast
  **optimistic** check — cookie presence only, no backend round-trip — to
  redirect unauthenticated requests away from protected routes before the
  page even starts rendering. The real authorization check still happens
  server-side per request via the backend's own JWT verification; an
  expired/invalid token simply surfaces as a 401 from `authFetch`.

**When adding a new protected route segment**, add its top-level path to
`PROTECTED_PREFIXES` in `proxy.ts` — it is not automatically inferred from the
`(dashboard)` route group.

### Data Access Layer (DAL) pattern

`lib/dal.ts` is the *only* place that reads the session cookie directly. Every
`lib/*-service.ts` file calls `getAuthHeader()` from there rather than
touching cookies itself. `features/tracking/tracking-service.ts` is the one
deliberate exception — the backend's tracking endpoint is public
(`tracking.routes.js` has no `protect` middleware), so that service
intentionally does **not** gate on a session.

### Server Actions pattern

Every mutation (`create*Action`, `update*Action`, `delete*Action`,
`resendDeliveryAction`, etc.) lives in a feature's `*-actions.ts` file with
`"use server"` at the top, and follows the same shape:

```ts
export async function fooAction(input): Promise<ActionResult<T>> {
  const parsed = fooSchema.safeParse(input);
  if (!parsed.success) return { success: false, message, fieldErrors };

  try {
    const data = await fooService(parsed.data);
    refresh(); // next/cache — re-fetches fresh data in Server Components
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiRequestError) return { success: false, message: error.message };
    return { success: false, message: "Something went wrong. Please try again." };
  }
}
```

Client components call these via `useTransition` + `startTransition(async () =>
...)`, never raw `<form action={...}>` unless the action itself is the whole
form's submit handler (see `settings/page.tsx`'s logout form for the simplest
case, and `webhook-form.tsx` for the `useActionState`-free, manual-submit
version used everywhere else).

### Validation mirrors the backend exactly

Every `lib/validate-*.ts` file is a zod schema **hand-copied from the
backend's actual validation rules** (Mongoose schema constraints and/or
inline `express-validator` checks in the controller), not invented
independently. If the backend changes a validation rule, update the matching
zod schema — don't let them drift.

### Shared constants, not duplicated enums

`constants/shipment-status.ts` is the single source of truth for shipment
statuses, valid status transitions, and badge-variant color mapping. Both
`constants/webhook-events.ts` (event-type dropdown options) and the shipment
UI derive from it. Don't reintroduce a second copy of the status list
somewhere else — import from here.

### Suspense-streamed list pages

Every list page (`webhooks`, `shipments`, `events`, `deliveries`) follows the
same shape: a client-side filter bar that mutates URL search params
(`?search=&status=&page=`) via `useRouter`/`useSearchParams` +
`useTransition`, and a Server Component table wrapped in `<Suspense key={...}
fallback={<TableSkeleton />}>` so filter changes show a skeleton instead of a
blank screen while the new page streams in. Copy this pattern for any new
list view rather than inventing a new one.

### Motion usage

Kept intentionally light — used for page-transition (`(dashboard)/template.tsx`'s
`AnimatePresence`) and staggered table-row entrance (`*-rows.tsx` components,
e.g. `webhook-rows.tsx`, `shipment-rows.tsx`) and animated stat-counter numbers
(`features/dashboard/components/stat-count.tsx`). If you add new `Variants`
objects with string-literal `ease` values (e.g. `"easeOut"`), **explicitly
type them as `Variants`** (imported from `motion/react`) — otherwise
TypeScript widens `ease` to `string`, which doesn't satisfy Motion's
`Easing` union and fails the build.

---

## Known gotchas / things to keep in mind for further development

- **`z.coerce.number()` breaks `zodResolver` + react-hook-form's generic
  inference** in the current zod/RHF combo — it causes a `Resolver<...>` type
  mismatch because the coerced schema's input/output types diverge. Use plain
  `z.number(...)` and convert `<Input type="number">` manually via
  `onChange={(e) => field.onChange(e.target.valueAsNumber)}` instead of
  spreading `{...field}` directly (see `shipment-form.tsx`).
- **zod's `ZodError.issues[].path` is typed `PropertyKey[]`** (can include
  `symbol`), not `(string | number)[]`. Any shared error-flattening helper
  (see `flattenZodErrors` in the `*-actions.ts` files) must type it that way
  and `.map(String).join(".")` when building a field key.
- **The shadcn CLI is not 100% reliable in this environment.** `pnpm dlx
shadcn@latest add <component>` sometimes fails silently without writing a
  file (this happened for `form` — it was hand-written instead). Always
  verify the expected file actually appeared in `components/ui/` after
  running the CLI rather than assuming success.
- **Stale `.next` type cache after deleting a route file**: if you delete an
  `app/**/page.tsx` and `next build`'s TypeScript step errors referencing the
  deleted file's compiled type declaration, delete the `.next/` folder and
  rebuild from scratch.
- **`hooks/use-mobile.ts`** (shadcn-generated) originally violated
  `react-hooks/set-state-in-effect` by calling `setState` synchronously inside
  an effect in addition to the resize listener. It's fixed via a lazy
  `useState` initializer — don't regenerate this file via the CLI without
  reapplying that fix, or `pnpm lint` will fail again.
- **No `tailwind.config.js`** — this is Tailwind v4, config lives entirely in
  `app/globals.css` via `@theme`. Don't add a v3-style config file.
- **This project has never been tested against production infrastructure** —
  only local `pnpm build`/`pnpm lint` and a local backend + MongoDB Atlas
  cluster. Before deploying, confirm cookie `secure`/`sameSite` settings in
  `lib/session.ts` behave correctly behind your actual hosting setup (HTTPS
  termination, custom domains, etc.).

---

## Verification workflow

This project has been built and re-verified incrementally, track by track,
using the same gate every time:

1. Read the actual backend contract (controller + route + model) before
   writing a data-layer function — never trust the roadmap doc's API shape
   blindly.
2. Implement the data layer (`lib/*-service.ts`), validation
   (`lib/validate-*.ts`), and Server Actions (`features/*/*-actions.ts`).
3. Build the feature's components and route(s).
4. Run `pnpm build` — must compile and typecheck clean, and the route list in
   the build output must include every new route.
5. Run `pnpm lint` — must be clean.
6. For anything touching auth, data mutations, or a new page shape, do a
   runtime smoke test against a live backend (see below) — a clean build does
   **not** guarantee correct runtime behavior (e.g. a Server Component
   throwing on a 401 mid-render only shows up at runtime, not at build time).

### Manual end-to-end smoke test

With both the backend (`npm run dev` in `../davinci/`) and this app
(`pnpm dev`) running:

1. Register a user via `POST /api/auth/register`, then log in to get a JWT.
2. Set that JWT as the `session_token` cookie (httpOnly cookies can't be set
   from browser JS, but can be set directly in a test HTTP client) and hit
   protected pages directly to confirm they render real data, not just a
   200 with an empty/error state.
3. Create a shipment and a webhook via the backend API, advance the
   shipment's status, and confirm: an event was created, a delivery fired
   (success or failure depending on the webhook URL), and all of
   `/shipments`, `/events`, `/deliveries`, and `/dashboard` reflect it. As an
   admin, open `/demo-receiver`, refresh request history, and inspect the
   captured payload and signature result. Try a test webhook at the `/fail`
   URL and update/reset response profiles.
4. Test the public `/track` page against a real tracking number.
5. Clean up any test data created against a shared/real database.

---

## Roadmap / not-yet-implemented

- **API key management**: referenced in the old SPA's empty `ApiKeys` stub,
  but deferred here because the current backend contract doesn't expose an
  API key endpoint. Don't invent one — confirm with the backend team first.
- **Role-based UI gating**: the backend enforces `admin`/`operations`-only
  restrictions on shipment creation and status updates, and role-based
  delivery visibility. The frontend currently relies on the backend rejecting
  unauthorized requests (surfaced as a toast) rather than hiding UI elements
  pre-emptively for non-privileged roles. Consider conditionally hiding
  "New shipment" / status-update controls based on `getCurrentUser()`'s
  `role` field for a cleaner UX.
