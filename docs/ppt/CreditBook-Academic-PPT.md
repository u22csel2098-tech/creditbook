---
marp: true
theme: creditbook
paginate: true
style: |
  /* inline overrides if theme file is not loaded */
  :root { font-family: 'Segoe UI', Arial, sans-serif; }
---

<!-- _class: title -->

# 💳 CreditBook
## Business Accounting Progressive Web App (PWA) with AI Assistant

**Final Year Major Project — B.Tech / MCA / BCA**

---

**Prepared by:** *(Your Name / Roll No.)*
**Guide:** *(Guide / Supervisor Name)*
**Department:** *(Department Name)*
**Institution:** *(College / University Name)*
**Date:** March 2026

---

# Abstract

- **CreditBook** is a MERN-stack business accounting PWA that digitises credit/debit ledgers for small and medium enterprises.
- Core capabilities: **Parties** (customers & suppliers), **Transactions** (You Gave / You Got), **Staff**, **Attendance**, **Salary**, **Reports**, and an **AI chatbot**.
- Secure REST API with **JWT + bcrypt** authentication and **MongoDB** persistence.
- Progressive Web App: **installable on mobile**, works **offline** via service worker.
- AI assistant (**CreditBot**) powered by **Groq API** (Llama 3.3 70B) for natural-language business queries.

---

# Problem Statement

Small and medium businesses commonly suffer from:

- 📓 Manual credit/debit books — error-prone and hard to query
- ❌ No real-time balance or outstanding reports
- 🗂 Scattered staff attendance & salary records
- 📉 No data-driven decision support
- 🔒 No secure, centralised digital ledger

> **Goal:** Build a secure, cloud-ready accounting platform with intelligent assistance, accessible from any device.

---

# Objectives

1. Provide structured **customer & supplier (party)** management with running balances
2. Record **credit/debit transactions** ("You Gave" / "You Got") accurately
3. Manage **staff details**, **attendance**, and **salary / advance payments**
4. Generate **visual reports** (bar & pie charts) via Recharts
5. Offer a **GST calculator** (5 % / 12 % / 18 %) with discount shortcuts
6. Deliver a **PWA** experience — installable, offline-friendly
7. Integrate an **AI assistant** for natural-language business queries
8. Enforce **JWT-based authentication** and **bcrypt** password hashing

---

# Scope of the Project

## In Scope
- User registration, login, profile management
- CRUD for parties (customers / suppliers)
- Transaction recording & running-balance computation
- Staff management, attendance marking (single & bulk), salary tracking
- Dashboard analytics, cashflow reports, bar/pie charts
- AI chat endpoint using Groq API
- PWA manifest + service-worker caching

## Out of Scope
- Multi-company / multi-branch ledgers
- Invoice / GST filing integration with government portals
- Payment-gateway or bank-account synchronisation

---

# Existing System — Drawbacks

| Drawback | Impact |
|---|---|
| Paper / register ledgers | Data loss, illegible entries |
| Excel spreadsheets | No multi-device access, manual formula errors |
| Generic accounting software | Costly, complex, not SME-friendly |
| No staff module | Separate attendance apps required |
| No AI support | Slow decision-making |
| No PWA / mobile app | Desktop-only access |

---

# Proposed System — Highlights

- **Single unified platform** for parties, transactions, staff, attendance, and reports
- **REST API** (Express.js) secured by JWT middleware on every protected route
- **MongoDB** for flexible, schema-based document storage with compound indices
- **React 18 PWA** — mobile-first, installable, offline support via service worker
- **Recharts** for interactive bar/pie visualisations
- **Groq AI** integration — free-tier, 14 400 requests/day, Llama 3.3 70B
- **Deployable for free** — Render (backend) + Vercel (frontend) + MongoDB Atlas

---

# Technology Stack

## Frontend
| Library | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| React Router | v6 | Client-side routing |
| Axios | latest | HTTP client |
| Recharts | latest | Charts & graphs |
| date-fns | latest | Date utilities |

## Backend
| Library | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18 | Runtime |
| Express | 4 | REST framework |
| Mongoose | 7 | MongoDB ODM |
| jsonwebtoken | latest | JWT auth |
| bcryptjs | latest | Password hashing |
| dotenv | latest | Environment config |

---

# Project Repository Structure

```
creditbook/
├── package.json          ← root (concurrently dev runner)
├── README.md
├── backend/
│   ├── server.js         ← Express app, CORS, routes, error handlers
│   ├── .env.example      ← environment template
│   ├── models/           ← Mongoose schemas (User, Party, Transaction, Staff, Attendance)
│   ├── controllers/      ← Business logic (auth, party, transaction, staff, attendance, dashboard, chat)
│   ├── routes/           ← Express routers
│   └── middleware/
│       └── authMiddleware.js   ← JWT protect middleware
└── frontend/
    ├── public/
    │   ├── manifest.json  ← PWA manifest
    │   └── service-worker.js
    └── src/
        ├── pages/         ← React page components
        ├── components/    ← Reusable UI components
        └── App.js
```

---

# System Architecture

```
┌─────────────────────────────────────────────────────┐
│                 React 18 PWA (Port 3000)             │
│  Pages: Login · Dashboard · Parties · Transactions  │
│         Staff · Attendance · Reports · Chat          │
│  Service Worker ── Offline Cache                     │
└──────────────────────┬──────────────────────────────┘
                       │ Axios HTTP + JWT Bearer
┌──────────────────────▼──────────────────────────────┐
│           Express.js API Server (Port 5000)          │
│  ┌────────────────────────────────────────────────┐  │
│  │  JWT protect middleware  (all /api/* except    │  │
│  │  /api/auth/register, /api/auth/login, health)  │  │
│  └────────────────────────────────────────────────┘  │
│  /api/auth  /api/parties  /api/transactions           │
│  /api/staff /api/attendance /api/dashboard /api/chat  │
└────────────┬──────────────────────────┬──────────────┘
             │ Mongoose                 │ HTTPS
┌────────────▼────────────┐   ┌─────────▼──────────────┐
│  MongoDB (Atlas / local) │   │  Groq API              │
│  users · parties         │   │  (Llama 3.3 70B)       │
│  transactions · staff    │   │  14 400 req/day (free) │
│  attendance              │   └────────────────────────┘
└─────────────────────────┘
```

---

# Backend API Design

| Route | Methods | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | POST | Public | Register new user |
| `/api/auth/login` | POST | Public | Login → JWT |
| `/api/auth/me` | GET | 🔒 | Get profile |
| `/api/auth/update` | PUT | 🔒 | Update profile |
| `/api/auth/change-password` | PUT | 🔒 | Change password |
| `/api/parties` | GET, POST | 🔒 | List / Create party |
| `/api/parties/:id` | GET, PUT, DELETE | 🔒 | Party CRUD |
| `/api/transactions` | GET, POST | 🔒 | List / Add transaction |
| `/api/transactions/:id` | DELETE | 🔒 | Delete transaction |
| `/api/staff` | GET, POST, PUT, DELETE | 🔒 | Staff CRUD |
| `/api/attendance` | POST, GET | 🔒 | Mark / View attendance |
| `/api/dashboard` | GET | 🔒 | Dashboard metrics |
| `/api/chat` | POST | 🔒 | AI chatbot |
| `/api/health` | GET | Public | Health check |

---

# Module 1 — Parties (Customers & Suppliers)

## Purpose
Maintain master records for each customer and supplier with a **running balance**.

## Key operations
- **Create** party with name, phone, email, address, type (`customer` / `supplier`)
- **View** all parties with current balance
- **Edit** party details
- **Delete** party (soft/hard)
- **Summary totals** — aggregate balances across all parties

## Schema highlights
- `userId` (FK → User) — each user's data is isolated
- `type` enum: `customer` | `supplier`
- `balance` — auto-updated on each transaction
- Compound index on `(userId, type, updatedAt)` for fast filtered queries

---

# Module 2 — Transactions (You Gave / You Got)

## Purpose
Record every credit/debit interaction with a party and maintain an accurate ledger.

## Transaction types
| Type | Meaning | Balance effect |
|---|---|---|
| `gave` | You gave money/goods to party | Balance decreases (party owes less) |
| `got` | You received from party | Balance increases (party owes more) |

## Schema highlights
- `partyId` (FK → Party) — links each transaction to a party
- `amount` — min value 0.01 (prevents zero entries)
- `balanceAfter` — snapshot of balance after this transaction
- `date` — default now; compound index on `(userId, partyId, date)`

---

# Module 3 — Staff & Salary Management

## Purpose
Track employee records, salary configuration, advance balances, and payment history.

## Key fields (Staff schema)
- `salaryType`: `monthly` | `daily` | `weekly`
- `salary`: base salary amount
- `advanceBalance`: running advance taken by staff
- `totalPaid`: cumulative payments made
- `paymentHistory`: embedded array of Payment sub-documents
  - Payment types: `salary` | `advance` | `bonus` | `deduction`
- `permissions`: optional flags (`viewReports`, `addTransactions`, `manageParties`)

## Key endpoint
`POST /api/staff/:id/payment` — records salary, advance, bonus, or deduction

---

# Module 4 — Attendance Tracking

## Purpose
Mark and query daily attendance for each staff member; support salary deductions.

## Attendance statuses
| Status | Meaning |
|---|---|
| `present` | Full working day |
| `absent` | Not present |
| `half_day` | Half working day |
| `paid_leave` | Approved paid leave |

## Schema highlights
- Unique compound index on `(staffId, date)` — prevents duplicate entries
- `overtimeHours` — optional overtime recording
- **Bulk endpoint** `POST /api/attendance/bulk` — mark attendance for all staff at once

---

# Module 5 — Dashboard & Reports

## Purpose
Provide at-a-glance insights and trend charts for business decisions.

## Endpoints
- `GET /api/dashboard` — total receivables, payables, net position, top debtors/creditors
- `GET /api/dashboard/cashflow` — time-series cashflow data

## Frontend charts (Recharts)
- **Bar chart** — monthly income vs. expenditure
- **Pie chart** — distribution across customers / suppliers
- **Net position card** — quick summary widget

## GST Calculator
Built-in calculator with shortcuts for GST slabs: **5 %**, **12 %**, **18 %**, plus discount shortcuts.

---

# Module 6 — CreditBot AI Assistant

## Purpose
Allow users to ask business questions in natural language.

## Architecture
```
User types question
       │
   React Chat UI
       │ POST /api/chat  { message }
   Express chatController
       │
   Build context prompt (business description + user query)
       │ HTTPS request
   Groq API  (Llama 3.3 70B model)
       │ JSON response
   Return AI reply to frontend
```

## Academic value
- Demonstrates **AI integration** in a MERN application
- Groq free tier: **14 400 requests/day**, no credit card required
- Enables **natural-language querying** of business data

---

# Database Design — ER Summary

## Collections and relationships

```
USER ──< PARTY ──< TRANSACTION
  │
  └──< STAFF ──< ATTENDANCE
           └──< PAYMENT (embedded)
```

| Collection | Key indices |
|---|---|
| `users` | `email` (unique) |
| `parties` | `(userId, type, updatedAt)` |
| `transactions` | `(userId, partyId, date)`, `(userId, date)` |
| `staff` | `(userId, isActive)` |
| `attendance` | `(staffId, date)` unique, `(userId, date)` |

> All business collections use `userId` as a foreign key → full **per-user data isolation**.

---

# Security Design

## Authentication
- **bcrypt** (12 salt rounds) hashes passwords before storage — `password` field excluded from query results (`select: false`)
- **JWT** signed with `JWT_SECRET` env variable — token included in `Authorization: Bearer <token>` header
- `protect` middleware validates token on every protected route

## Transport & Headers
- CORS headers restricted; preflight (`OPTIONS`) handled explicitly
- JSON body limit: **10 MB** to prevent payload attacks
- `404` and `500` error handlers return structured JSON (no stack traces in production)

## Secrets management
- All secrets (`MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`) via `.env` file
- `.env` is **not committed** to the repository; `.env.example` ships as a template

---

# PWA — Progressive Web App Features

## What makes CreditBook a PWA?
| PWA Feature | Implementation |
|---|---|
| Web App Manifest | `frontend/public/manifest.json` — defines name, icons, theme |
| Service Worker | Caches assets for offline access |
| HTTPS-ready | Required for service worker in production |
| Installable | "Add to Home Screen" prompt on Android/iOS/Desktop |
| Responsive UI | Mobile-first React layout |

## User benefits
- Works **like a native app** without app-store installation
- **Offline** access to cached pages/data
- Fast load on repeat visits (cache-first strategy)
- Equal experience on mobile and desktop

---

# Testing Strategy

## API Testing (recommended tools: Postman / Thunder Client)
- Test all CRUD endpoints with valid & invalid JWT tokens
- Verify 401 Unauthorized on missing/expired token
- Test input validation (negative amounts, missing required fields)

## Unit Testing (Jest / React Testing Library)
- Auth flow: register, login, token storage
- Party creation form validation
- Transaction type toggle (gave ↔ got)

## Security Testing
- Confirm password is never returned in API responses
- Verify rate limiting applies to login endpoint
- Confirm CORS rejects disallowed origins in production

## Integration Testing
- End-to-end: login → add party → add transaction → verify balance update → view dashboard

---

# Results & Outcomes

- ✅ Fully functional MERN-stack PWA with **7 backend route modules**
- ✅ **5 Mongoose models** with compound indices for performance
- ✅ JWT-secured REST API with bcrypt password hashing
- ✅ Real-time running balance updates on every transaction
- ✅ Staff attendance + salary system with embedded payment history
- ✅ Dashboard with bar & pie charts via Recharts
- ✅ AI chatbot integrated using Groq free API
- ✅ PWA installable on Android / iOS / Desktop
- ✅ Deployable for free on Render + Vercel + MongoDB Atlas

---

# Limitations

- MongoDB must be reachable (local or Atlas); no built-in fallback DB
- AI chatbot quality depends on prompt quality and Groq API availability
- Offline mode limited to cached pages; new transactions require network
- Role-based access control (RBAC) is minimal — single-owner model
- No automated test suite currently included in the repository
- GST calculator is informational only; no GST filing or government API integration

---

# Future Enhancements

| Enhancement | Description |
|---|---|
| Role-based access control | Admin / Manager / Staff roles with granular permissions |
| PDF invoice generation | Print/export receipts using jsPDF or Puppeteer |
| Excel / PDF report export | Download reports with date-range filters |
| Multi-business support | Multiple ledgers per user account |
| Recurring transactions | Auto-schedule periodic entries |
| UPI / payment gateway | Link transactions to actual payments |
| Bank statement import | Reconcile via CSV upload |
| Advanced AI context | Feed live DB summary to AI for smarter answers |
| Push notifications | Overdue balance reminders via Web Push API |

---

# Conclusion

**CreditBook** delivers a complete, modern, and accessible accounting solution for small businesses:

- 🗂 **Organised ledger** — accurate party & transaction records replace manual books
- 📊 **Instant insights** — real-time dashboard and visual reports
- 👷 **HR module** — staff, attendance, and salary in one system
- 📱 **PWA** — works on any device, installable, offline-capable
- 🤖 **AI-assisted** — natural-language queries via CreditBot
- 🔒 **Secure** — JWT + bcrypt ensure data privacy
- ☁️ **Free to deploy** — Render + Vercel + MongoDB Atlas

> CreditBook demonstrates how a well-structured MERN application can solve real-world SME problems with modern, scalable, and cost-effective technology.

---

# References

1. MongoDB Documentation — https://www.mongodb.com/docs/
2. Express.js Guide — https://expressjs.com/
3. React 18 Documentation — https://react.dev/
4. Node.js Documentation — https://nodejs.org/en/docs/
5. Mongoose ODM — https://mongoosejs.com/docs/
6. JSON Web Tokens (JWT) — https://jwt.io/introduction/
7. bcrypt Password Hashing — https://www.npmjs.com/package/bcryptjs
8. Recharts Library — https://recharts.org/
9. Groq API Documentation — https://console.groq.com/docs
10. Progressive Web Apps — https://web.dev/progressive-web-apps/
11. Marp for VS Code — https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode
12. Mermaid Diagram Syntax — https://mermaid.js.org/

---

<!-- _class: title -->

# Thank You

**Questions & Discussion**

*CreditBook — Business Accounting PWA*
*GitHub: github.com/u22csel2098-tech/creditbook*
