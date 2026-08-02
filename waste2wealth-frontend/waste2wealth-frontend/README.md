# Waste2Wealth AI — Frontend

React 18 + TypeScript + Vite + Tailwind CSS frontend for the **Waste2Wealth AI Industrial Waste Exchange Platform**. Consumes the Node.js/Express/MongoDB backend module.

---

## 1. Tech Stack

React 18 · TypeScript · Vite · Tailwind CSS · React Router · Axios · React Hook Form + Zod · Recharts · React-Leaflet · Framer Motion · Lucide Icons · Socket.IO client

---

## 2. Setup

```bash
cd waste2wealth-frontend
npm install
cp .env.example .env
# Point VITE_API_BASE_URL / VITE_SOCKET_URL at your running backend
npm run dev
```

Runs on `http://localhost:5173`. The Vite dev server also proxies `/api` to `http://localhost:5000` (see `vite.config.ts`) if you prefer relative API paths.

```bash
npm run build     # type-checks (tsc -b) then builds to dist/
npm run preview   # preview the production build locally
```

This project has been verified to **type-check and build cleanly** end-to-end against the backend's API contracts.

---

## 3. Design System

Ground rule: the brief specified a **green + blue** palette — everything below is a deliberate expression of that, not a generic default.

| Token | Value | Use |
|---|---|---|
| `forest-600` | `#2D6A4F` | Primary brand (buttons, links, active states) |
| `indigo-600` | `#1D3557` | Secondary / structural (badges, footer, charts) |
| `brass-400` | `#C89B3C` | Accent — "wealth recovered from waste" (AI callouts, highlights) |
| `paper` | `#F4F6F2` | App background (cool, sage-tinted off-white) |
| `ink` | `#131A17` | Primary text |

**Type system:** `Space Grotesk` (display/headlines — geometric, technical), `IBM Plex Sans` (body), `IBM Plex Mono` (data tags, stat labels, timestamps — reinforces the "industrial spec sheet" feel).

**Signature element:** the landing hero's rotating material-loop dial (waste → match → wealth), echoed as small mono "eyebrow" tags (`.eyebrow-tag` in `index.css`) throughout the app.

All tokens live in `tailwind.config.js`. Reusable UI primitives (`Button`, `Card`, `Badge`, `Input`, `Modal`, etc.) are in `src/components/ui/`.

---

## 4. Folder Structure

```
src/
├── main.tsx / App.tsx        # entry + route table
├── index.css                  # design tokens, base styles
├── lib/                       # api.ts (axios), socket.ts, utils.ts, leafletSetup.ts
├── types/                     # TS interfaces mirroring backend models
├── context/AuthContext.tsx    # auth state, login/register/logout
├── components/
│   ├── ui/                     # Button, Form fields, Card/Badge/Modal/Avatar/Spinner
│   ├── layout/                 # Navbar, Footer, DashboardLayout, DashboardSidebar, ProtectedRoute
│   └── shared/                 # StatCard, WasteCard, NotificationBell
└── pages/
    ├── LandingPage.tsx + landing/  # Hero, HowItWorks, AIFeatures, Sections
    ├── auth/                        # Login, Signup, ForgotPassword, ResetPassword, VerifyOtp
    ├── dashboard/                   # DashboardRouter, GeneratorDashboard, BuyerDashboard
    ├── marketplace/                 # MarketplacePage, WasteDetailsPage
    ├── waste/UploadWastePage.tsx    # listing form + AI assist (classify/price/carbon)
    ├── admin/                       # AdminOverview, AdminDashboard (users/listings/compliance tabs)
    ├── profile/ProfilePage.tsx
    ├── messages/MessagesPage.tsx    # real-time chat via Socket.IO
    ├── notifications/NotificationsPage.tsx
    ├── analytics/AnalyticsPage.tsx  # Recharts: revenue, carbon, category breakdown
    └── TransactionsPage.tsx
```

---

## 5. Key Integration Notes

- **Auth**: JWT stored both as an httpOnly cookie (set by the backend) and in `localStorage` (`w2w_token`) as a fallback for the `Authorization: Bearer` header — see `src/lib/api.ts`. A 401 response clears local state and redirects to `/login`.
- **Real-time**: `src/lib/socket.ts` maintains a singleton Socket.IO connection; `AuthContext` joins the user's private room (`socket.emit('join', userId)`) on login, matching the backend's `io.to(userId)` targeting for chat + notifications.
- **AI features**: `UploadWastePage` calls `/ai/classify`, `/ai/price-predict`, and `/ai/carbon` for a live preview before publishing; `WasteDetailsPage` calls `/ai/recommendations/:wasteId` (owner-only) to surface AI-ranked buyer matches.
- **Maps**: `WasteDetailsPage` renders pickup location via `react-leaflet` + OpenStreetMap tiles (no API key required). Leaflet's default marker icons are re-pointed in `src/lib/leafletSetup.ts` since bundlers don't resolve them automatically.
- **Role-aware routing**: `ProtectedRoute` (in `components/layout`) redirects unauthenticated users to `/login` and unauthorized roles to `/dashboard`; `DashboardRouter` renders the correct dashboard (`generator` / `buyer` / `admin`) for the logged-in user's role.

---

## 6. Deployment (Vercel)

1. Push this folder to GitHub (or the `frontend/` subfolder of your monorepo).
2. On [Vercel](https://vercel.com): **New Project** → import the repo → framework preset **Vite**.
3. Build command: `npm run build` · Output directory: `dist`.
4. Add environment variables: `VITE_API_BASE_URL` (your deployed Render backend + `/api`), `VITE_SOCKET_URL` (same backend, no `/api` suffix), `VITE_GOOGLE_CLIENT_ID` if using Google login.
5. Deploy. Once live, update the backend's `CLIENT_URL` env var to this Vercel URL so CORS/cookies work correctly, and redeploy the backend.

---

## 7. What's Next

Both modules — **Backend** (Node/Express/MongoDB/Groq) and **Frontend** (this module) — are complete and independently runnable. To run the full stack locally:

```bash
# Terminal 1
cd waste2wealth-backend && npm install && npm run seed && npm run dev

# Terminal 2
cd waste2wealth-frontend && npm install && npm run dev
```

Then log in with any seeded account (see backend README) at `http://localhost:5173/login`.
