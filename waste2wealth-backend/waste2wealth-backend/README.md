# Waste2Wealth AI — Backend

Node.js + Express + MongoDB (Mongoose) + Groq AI backend for the **Waste2Wealth AI Industrial Waste Exchange Platform**.

This is Module 1 of 3 (Backend). Database lives inside this module as MongoDB schemas (`src/models`). Frontend (React) is a separate module.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (httpOnly cookie + Bearer header), bcrypt, Google OAuth (id_token) |
| AI | **Groq** (`groq-sdk`) — Llama 3.3 70B for text reasoning, Llama 3.2 90B Vision for image classification |
| File storage | Cloudinary |
| Real-time | Socket.IO (chat + live notifications) |
| Email | Nodemailer (OTP + password reset) |
| Security | Helmet, express-mongo-sanitize, xss-clean, hpp, express-rate-limit, CORS |

---

## 2. Folder Structure

```
waste2wealth-backend/
├── server.js                  # Entry point: env, DB connect, HTTP + Socket.IO server
├── package.json
├── .env.example
└── src/
    ├── app.js                 # Express app: middleware + route mounting
    ├── config/
    │   ├── db.js               # MongoDB connection
    │   ├── groq.js             # Groq client + groqJSON()/groqVisionJSON() helpers
    │   └── cloudinary.js
    ├── models/                 # 11 Mongoose schemas
    ├── controllers/             # Business logic per resource
    ├── routes/                  # Express routers
    ├── middleware/               # auth, error handler, validation, rate limiting, upload
    ├── utils/                    # AppError, catchAsync, token helper, geo utils, email
    └── seed/
        └── seed.js               # Sample data seeder
```

---

## 3. Setup

```bash
cd waste2wealth-backend
npm install
cp .env.example .env
# Fill in .env: MONGO_URI, JWT_SECRET, GROQ_API_KEY, SMTP_*, CLOUDINARY_*, GOOGLE_CLIENT_ID
```

### Getting a Groq API key
1. Go to https://console.groq.com
2. Create an API key
3. Set `GROQ_API_KEY` in `.env`. Default models used: `llama-3.3-70b-versatile` (text) and `llama-3.2-90b-vision-preview` (image classification) — override via `GROQ_MODEL` / `GROQ_VISION_MODEL` if Groq deprecates these.

### Run

```bash
npm run dev        # nodemon, development
npm start          # production
npm run seed        # populate sample users/listings/requests
npm run seed:destroy # wipe seeded data
```

Server starts on `http://localhost:5000` (or `PORT` from `.env`). Health check: `GET /health`.

### Sample seeded accounts (after `npm run seed`)
| Role | Email | Password |
|---|---|---|
| admin | admin@waste2wealth.ai | Admin@12345 |
| generator | generator1@waste2wealth.ai | Password@123 |
| generator | generator2@waste2wealth.ai | Password@123 |
| buyer | buyer1@waste2wealth.ai | Password@123 |
| buyer | buyer2@waste2wealth.ai | Password@123 |

---

## 4. Architecture Notes

- **Auth**: JWT signed with `id` + `role`, sent as both an httpOnly cookie and returned in the JSON body (so mobile/SPA clients can use `Authorization: Bearer <token>` if cookies aren't convenient). `protect` middleware verifies the token and rejects if the user's password changed after the token was issued.
- **AI design decision**: Rankings/scores (buyer recommendations, carbon calculator, transport cost) are computed **deterministically in code**, not by the LLM — this keeps them auditable, reproducible, and free of hallucinated numbers. Groq is used specifically where natural-language reasoning adds value: classification judgment, price reasoning, forecast trend narrative, match explanations, and material-similarity judgment on a short-listed candidate set. This hybrid approach is deliberate: pure-LLM ranking is not reproducible and pure-formula explanation is not persuasive to a human user — combining both gets both properties.
- **Error handling**: every controller is wrapped by `catchAsync`, forwarding to a centralized `errorHandler` that gives detailed errors in development and safe, generic messages in production (never leaks stack traces or DB internals to clients).
- **Geo**: MongoDB `2dsphere` indexes on `User.location` and `WasteListing.pickupLocation.location` support `$near` queries for the "Nearby Industries" feature; a Haversine helper (`geoUtils.js`) is used for scoring where a full geo query isn't warranted.

---

## 5. API Reference (all prefixed with `/api`)

### Auth — `/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register (generator/buyer) |
| POST | `/login` | — | Login |
| POST | `/google` | — | Google sign-in (`{ idToken }`) |
| POST | `/logout` | — | Clears auth cookie |
| POST | `/forgot-password` | — | Sends reset email |
| PATCH | `/reset-password/:token` | — | Sets new password |
| GET | `/me` | ✅ | Current user |
| POST | `/verify-email` | ✅ | `{ otp }` |
| POST | `/resend-otp` | ✅ | Resend verification OTP |
| PATCH | `/update-password` | ✅ | Change password |

### Users — `/users`
`GET /profile` · `PUT /profile` · `GET /:id` (public storefront) · `GET /nearby?lat=&lng=&maxDistanceKm=&role=`

### Waste — `/waste` & Marketplace
`POST /waste` (generator) · `GET /waste` (mine) · `GET /waste/:id` · `PUT /waste/:id` · `DELETE /waste/:id` · `GET /waste/marketplace?search=&category=&minPrice=&maxPrice=&city=&sortBy=&page=&limit=` (public)

### AI — `/ai` (all protected + rate-limited)
| Endpoint | Feature |
|---|---|
| `POST /classify` | Smart waste classification (text or image via `imageUrl`) |
| `GET /recommendations/:wasteId` | Buyer recommendation engine |
| `POST /price-predict` | Price prediction |
| `POST /forecast` | Waste generation forecast |
| `POST /carbon` | Carbon saving calculator |
| `GET /similar-materials/:wasteId` | Material similarity matching |
| `POST /transport-optimize` | Transport route/fuel/CO₂ estimate |

### Transactions — `/transactions`
`POST /` (buyer) · `GET /` (mine, role-aware) · `GET /:id` · `PATCH /:id/status`

### Others
`/messages` (chat), `/notifications`, `/analytics/dashboard`, `/reviews`, `/buyer-requests`, `/uploads` (Cloudinary), `/admin/*` (admin-only: users, waste approvals, compliance docs, platform stats)

Full request/response bodies match the Mongoose schemas in `src/models` — see each controller for exact field names.

---

## 6. Security Checklist (implemented)
- ✅ JWT auth + role-based access control (`restrictTo`)
- ✅ bcrypt password hashing (cost factor 12)
- ✅ Helmet secure headers
- ✅ express-mongo-sanitize (NoSQL injection protection)
- ✅ xss-clean (input sanitization)
- ✅ hpp (HTTP parameter pollution protection)
- ✅ CORS locked to `CLIENT_URL`
- ✅ express-rate-limit (general, stricter on `/auth`, moderate on `/ai`)
- ✅ httpOnly + secure (in prod) cookies
- ✅ Centralized error handler that masks internals in production

---

## 7. Deployment (Render)

1. Push this folder to a GitHub repo (or the `backend/` subfolder of your monorepo).
2. On [Render](https://render.com): **New → Web Service** → connect the repo.
3. Build command: `npm install` · Start command: `npm start`
4. Add all variables from `.env.example` under **Environment**.
5. Set `MONGO_URI` to your MongoDB Atlas connection string (Atlas free tier works fine).
6. Set `CLIENT_URL` to your deployed frontend URL (Vercel) once available — required for CORS + cookies to work correctly.
7. After first deploy, optionally run the seed script via Render's Shell tab: `npm run seed`.

### MongoDB Atlas quick setup
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Database Access → add a user with a strong password
3. Network Access → allow `0.0.0.0/0` (or Render's static IPs if configured)
4. Get the connection string, replace `<username>`/`<password>`, append `/waste2wealth` as the database name

---

## 8. What's Next

This backend module is complete and independently runnable/testable (e.g. with Postman/Thunder Client or `curl`) against the API reference above. The next modules are:
- **Database module**: this backend already defines the MongoDB schema layer (`src/models`) and a seed script; a dedicated ER diagram / schema documentation pass can be added separately if useful.
- **Frontend module**: React + TypeScript + Vite consuming these exact endpoints.
