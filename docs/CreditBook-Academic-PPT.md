# CreditBook — Academic PPT Slide Content

> **Purpose:** Detailed slide-by-slide content for the CreditBook Final Year Major Project presentation.
> Copy each slide's content into PowerPoint, Google Slides, Canva, or any presentation tool.
> For an auto-generated PPTX, see [docs/ppt/](./ppt/) (Marp-based workflow).

---

## Slide 1 — Title Slide

**Title:** CreditBook — Business Accounting Progressive Web App (PWA) with AI Assistant
**Subtitle:** Final Year Major Project — B.Tech / MCA / BCA

| Field | Value |
|---|---|
| Prepared by | *(Your Name / Roll No.)* |
| Guide | *(Guide / Supervisor Name)* |
| Department | *(Department Name)* |
| Institution | *(College / University Name)* |
| Date | March 2026 |

**Speaker notes:**
Good morning/afternoon everyone. I am presenting my final year major project titled "CreditBook — a Business Accounting Progressive Web App with an AI Assistant." The project addresses digital transformation of manual bookkeeping for small and medium enterprises.

---

## Slide 2 — Abstract

**Bullet points:**
- CreditBook is a MERN-stack business accounting PWA that digitises credit/debit ledgers for small and medium enterprises.
- Core capabilities: Parties (customers & suppliers), Transactions (You Gave / You Got), Staff, Attendance, Salary, Reports, and an AI chatbot.
- Secure REST API with JWT + bcrypt authentication and MongoDB persistence.
- Progressive Web App: installable on mobile, works offline via service worker.
- AI assistant (CreditBot) powered by Groq API (Llama 3.3 70B) for natural-language business queries.

**Speaker notes:**
The project is a full-stack web application. It uses MongoDB, Express.js, React, and Node.js — collectively called the MERN stack. The application is designed as a PWA so it can be installed on a mobile phone and used without a constant internet connection. An AI assistant is integrated to help users query their business data in plain English.

---

## Slide 3 — Problem Statement

**Problem framing:**
Small and medium businesses commonly face:

- 📓 Manual credit/debit books — error-prone and hard to search
- ❌ No real-time balance or outstanding reports
- 🗂 Scattered staff attendance & salary records
- 📉 No data-driven decision support
- 🔒 No secure, centralised digital ledger

**Goal statement:**
Build a secure, cloud-ready accounting platform with intelligent assistance, accessible from any device.

**Speaker notes:**
The core problem is that most small businesses in India still rely on paper khata books or Excel spreadsheets to track credit and debit with customers and suppliers. This leads to errors, data loss, and no ability to get quick reports. Additionally, staff attendance and salary tracking is usually done separately. Our project solves all of these in one unified system.

---

## Slide 4 — Objectives

**Numbered objectives:**
1. Provide structured customer & supplier (party) management with running balances
2. Record credit/debit transactions ("You Gave" / "You Got") accurately
3. Manage staff details, attendance, and salary / advance payments
4. Generate visual reports (bar & pie charts) via Recharts
5. Offer a GST calculator (5% / 12% / 18%) with discount shortcuts
6. Deliver a PWA experience — installable, offline-friendly
7. Integrate an AI assistant for natural-language business queries
8. Enforce JWT-based authentication and bcrypt password hashing

**Speaker notes:**
These eight objectives drove the design of every module in the system. Each objective maps directly to at least one backend route and frontend page.

---

## Slide 5 — Scope of the Project

**In Scope:**
- User registration, login, and profile management
- CRUD operations for parties (customers / suppliers)
- Transaction recording & running-balance computation
- Staff management, attendance marking (single & bulk), salary tracking
- Dashboard analytics, cashflow reports, bar/pie charts
- AI chat endpoint using Groq API
- PWA manifest + service-worker caching

**Out of Scope:**
- Multi-company / multi-branch ledgers
- Invoice / GST filing integration with government portals
- Payment-gateway or bank-account synchronisation

**Speaker notes:**
It is important to clearly define what the system does and does not do. The out-of-scope items represent potential future enhancements, not limitations of the current design.

---

## Slide 6 — Existing System — Drawbacks

| Existing Method | Drawback |
|---|---|
| Paper / register ledgers | Data loss, illegible entries, no search |
| Excel spreadsheets | No multi-device access, formula errors |
| Generic accounting software | Costly, complex, not SME-friendly |
| No integrated staff module | Separate attendance apps required |
| No AI support | Slow manual decision-making |
| No PWA / mobile app | Desktop-only, inaccessible on the go |

**Speaker notes:**
Existing solutions either require expensive software licenses (like Tally or Busy) or rely on completely manual methods. Our proposed system provides a free, cloud-deployable alternative that addresses every one of these drawbacks.

---

## Slide 7 — Proposed System — Highlights

**Key advantages:**
- Single unified platform for parties, transactions, staff, attendance, and reports
- REST API (Express.js) secured by JWT middleware on every protected route
- MongoDB for flexible, schema-based document storage with compound indices for performance
- React 18 PWA — mobile-first, installable, offline support via service worker
- Recharts for interactive bar/pie visualisations
- Groq AI integration — free-tier, 14,400 requests/day, Llama 3.3 70B model
- Deployable for free — Render (backend) + Vercel (frontend) + MongoDB Atlas

**Speaker notes:**
The proposed system is designed to be not just functionally complete but also cost-effective. Every component used is either open-source or available under a free tier, making it accessible for real-world deployment by small businesses without any infrastructure cost.

---

## Slide 8 — Technology Stack

**Frontend:**
| Library | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Recharts | Charts & graphs |
| date-fns | Date utilities |

**Backend:**
| Library | Purpose |
|---|---|
| Node.js ≥ 18 | JavaScript runtime |
| Express 4 | REST API framework |
| Mongoose 7 | MongoDB ODM |
| jsonwebtoken | JWT authentication |
| bcryptjs | Password hashing |

**Database:** MongoDB (local or Atlas)
**AI:** Groq API — Llama 3.3 70B (free tier)

**Speaker notes:**
All chosen technologies are industry-standard and widely used in production systems. The MERN stack is particularly popular for rapid development of full-stack web applications, and both MongoDB Atlas and Groq offer generous free tiers suitable for academic and small-business deployments.

---

## Slide 9 — Project Repository Structure

```
creditbook/
├── package.json          ← root (concurrently dev runner)
├── README.md
├── backend/
│   ├── server.js         ← Express app, CORS, routes, error handlers
│   ├── .env.example      ← environment variable template
│   ├── models/           ← Mongoose schemas
│   │   ├── User.js
│   │   ├── Party.js
│   │   ├── Transaction.js
│   │   ├── Staff.js
│   │   └── Attendance.js
│   ├── controllers/      ← Business logic
│   ├── routes/           ← Express routers
│   └── middleware/
│       └── authMiddleware.js
└── frontend/
    ├── public/
    │   └── manifest.json ← PWA manifest
    └── src/
        ├── pages/
        ├── components/
        └── App.js
```

**Speaker notes:**
The project follows a clean separation of concerns: models handle data schema, controllers contain business logic, routes map HTTP methods to controllers, and middleware handles cross-cutting concerns like authentication. The frontend is completely separate, communicating only through the REST API.

---

## Slide 10 — System Architecture (High-Level)

**Diagram description (see docs/diagrams/architecture.mmd):**

```
React 18 PWA (Port 3000)
    │  Axios HTTP + JWT Bearer
Express.js API (Port 5000)
    │  JWT protect middleware
    ├── /api/auth ──────── MongoDB: users
    ├── /api/parties ───── MongoDB: parties
    ├── /api/transactions ─ MongoDB: transactions + parties
    ├── /api/staff ──────── MongoDB: staff
    ├── /api/attendance ─── MongoDB: attendance
    ├── /api/dashboard ──── MongoDB: multi-collection
    └── /api/chat ──────── Groq API (Llama 3.3 70B)
```

**Data flow:**
1. User logs in → receives JWT
2. JWT stored in browser → attached to all subsequent requests
3. Express `protect` middleware validates JWT → allows access to protected routes
4. Controllers query MongoDB via Mongoose → return JSON response
5. Chat controller forwards request to Groq API → returns AI response

**Speaker notes:**
This is a classic three-tier architecture: presentation tier (React), application tier (Express), and data tier (MongoDB). The Groq API represents an external fourth-party service. The service worker adds an optional offline/cache layer between the browser and the network.

---

## Slide 11 — Backend API Design

| Route | Methods | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | POST | Public | Register new user |
| `/api/auth/login` | POST | Public | Login → returns JWT |
| `/api/auth/me` | GET | 🔒 JWT | Get current user profile |
| `/api/auth/update` | PUT | 🔒 JWT | Update profile |
| `/api/auth/change-password` | PUT | 🔒 JWT | Change password |
| `/api/parties` | GET, POST | 🔒 JWT | List / Create party |
| `/api/parties/:id` | GET, PUT, DELETE | 🔒 JWT | Party CRUD |
| `/api/parties/summary/totals` | GET | 🔒 JWT | Aggregate totals |
| `/api/transactions` | GET, POST | 🔒 JWT | List / Add transaction |
| `/api/transactions/:id` | DELETE | 🔒 JWT | Delete transaction |
| `/api/staff` | GET, POST | 🔒 JWT | List / Create staff |
| `/api/staff/:id` | GET, PUT, DELETE | 🔒 JWT | Staff CRUD |
| `/api/staff/:id/payment` | POST | 🔒 JWT | Record payment |
| `/api/staff/summary/due` | GET | 🔒 JWT | Salary due summary |
| `/api/attendance` | POST | 🔒 JWT | Mark attendance |
| `/api/attendance/bulk` | POST | 🔒 JWT | Bulk mark attendance |
| `/api/attendance/:staffId` | GET | 🔒 JWT | Attendance history |
| `/api/dashboard` | GET | 🔒 JWT | Dashboard overview |
| `/api/dashboard/cashflow` | GET | 🔒 JWT | Cashflow data |
| `/api/chat` | POST | 🔒 JWT | AI chatbot |
| `/api/health` | GET | Public | Health check |

**Speaker notes:**
All routes except registration, login, and the health check require a valid JWT. This ensures that one user can never access another user's data, as the JWT encodes the user's ID which is used to filter all database queries.

---

## Slide 12 — Module 1: Parties (Customers & Suppliers)

**Purpose:** Maintain master records for each customer and supplier with a running balance.

**Schema fields:**
- `userId` (FK → User) — per-user data isolation
- `name`, `phone`, `email`, `address` — contact details
- `type` — `customer` | `supplier`
- `balance` — auto-updated on each transaction (positive = they owe you, negative = you owe them)
- `isActive` — soft-delete support

**Key feature:** Compound index on `(userId, type, updatedAt)` for fast filtered queries.

**Academic note:** This module forms the "master data" tier; the transaction module depends on it as a foreign key.

**Speaker notes:**
The party module is the foundation of the ledger. Every transaction must be associated with a party. The balance field is a derived value — it gets updated whenever a transaction is added or deleted — providing an O(1) lookup of the current balance rather than requiring an aggregation query.

---

## Slide 13 — Module 2: Transactions (You Gave / You Got)

**Purpose:** Record every credit/debit interaction with a party and maintain an accurate ledger.

**Transaction types:**
| Type | Business Meaning | Balance Effect |
|---|---|---|
| `gave` | You gave money/goods to party | Party balance decreases |
| `got` | You received from party | Party balance increases |

**Schema fields:**
- `partyId` (FK → Party) — links transaction to a party
- `amount` — minimum value 0.01
- `balanceAfter` — snapshot of balance after this transaction
- `date` — compound index on `(userId, partyId, date)` for efficient history queries

**Speaker notes:**
The transaction model is intentionally simple but complete. The `balanceAfter` snapshot field means we can reconstruct the ledger at any point in time without recalculating. The two transaction types map directly to debit/credit in traditional accounting terminology.

---

## Slide 14 — Module 3: Staff & Salary Management

**Purpose:** Track employee records, salary configuration, advance balances, and full payment history.

**Key schema fields:**
- `salaryType`: `monthly` | `daily` | `weekly`
- `salary`: base salary amount
- `advanceBalance`: running advance balance
- `totalPaid`: cumulative amount paid to this staff member
- `paymentHistory`: embedded Payment array
  - Payment types: `salary` | `advance` | `bonus` | `deduction`
- `permissions`: optional access flags (`viewReports`, `addTransactions`, `manageParties`)

**Key API endpoint:**
`POST /api/staff/:id/payment` — records a salary, advance, bonus, or deduction payment

**Speaker notes:**
The staff module uses an embedded document pattern for payment history. This is an intentional MongoDB design choice — because payment history is always accessed in the context of a single staff member, embedding avoids the need for a join operation and improves read performance.

---

## Slide 15 — Module 4: Attendance Tracking

**Purpose:** Mark and query daily attendance for each staff member to support salary deductions.

**Attendance statuses:**
| Status | Meaning |
|---|---|
| `present` | Full working day |
| `absent` | Not present |
| `half_day` | Half working day |
| `paid_leave` | Approved paid leave |

**Key features:**
- Unique compound index on `(staffId, date)` — prevents duplicate entries per day
- `overtimeHours` field — optional overtime recording
- Bulk endpoint `POST /api/attendance/bulk` — mark attendance for all staff at once
- `GET /api/attendance/summary/today` — today's attendance summary

**Speaker notes:**
The unique compound index is a critical design choice — it enforces data integrity at the database level, not just application level, meaning even if there is an application bug, duplicate attendance records cannot be inserted.

---

## Slide 16 — Module 5: Dashboard & Reports

**Purpose:** Provide at-a-glance business insights and trend charts for decision-making.

**Dashboard endpoint (`GET /api/dashboard`) returns:**
- Total receivables (parties that owe you)
- Total payables (parties you owe)
- Net position
- Top debtors / creditors list

**Cashflow endpoint (`GET /api/dashboard/cashflow`) returns:**
- Time-series data for charting

**Frontend charts (Recharts):**
- Bar chart — monthly income vs. expenditure comparison
- Pie chart — distribution across customers / suppliers

**GST Calculator:**
- Built-in calculator supporting slabs: 5%, 12%, 18%
- Plus/minus discount shortcuts for quick computation

**Speaker notes:**
The dashboard aggregates data across multiple collections — parties, transactions, and staff — to provide a holistic view. The Recharts library was chosen for its declarative API and good integration with React's component model.

---

## Slide 17 — Module 6: CreditBot AI Assistant

**Purpose:** Allow users to ask business questions in natural language.

**Architecture flow:**
```
User types question in React Chat UI
         ↓
POST /api/chat { message: "..." }   (JWT required)
         ↓
chatController builds context prompt
         ↓
HTTPS request → Groq API (Llama 3.3 70B)
         ↓
AI response JSON returned to frontend
         ↓
Chat UI displays response
```

**Groq free tier:** 14,400 requests/day — no credit card required

**Academic value:**
- Demonstrates real-world AI API integration in a MERN application
- Enables natural-language querying over business context
- Shows how LLMs can be incorporated as a feature, not just a demo

**Speaker notes:**
The AI integration uses Groq's free API rather than OpenAI to ensure the system remains completely free to run. Llama 3.3 70B is a state-of-the-art open-weight model that performs comparably to GPT-4 on many tasks. The backend acts as a proxy, so the API key is never exposed to the browser.

---

## Slide 18 — Database Design (ER Summary)

**Entities and relationships:**
```
USER ──< PARTY ──< TRANSACTION
  │
  └──< STAFF ──< ATTENDANCE
           └──< PAYMENT  (embedded in Staff)
```

**Collection indices summary:**
| Collection | Indices |
|---|---|
| `users` | `email` (unique) |
| `parties` | `(userId, type, updatedAt)` compound |
| `transactions` | `(userId, partyId, date)`, `(userId, date)` |
| `staff` | `(userId, isActive)` |
| `attendance` | `(staffId, date)` unique, `(userId, date)` |

**Per-user isolation:** All business collections carry a `userId` foreign key → a user can only query their own data.

**Speaker notes:**
The ER diagram (available in docs/diagrams/erd.mmd) shows five main collections. Every collection except User has a userId field, which means the API can always filter by the authenticated user's ID. This is how multi-tenancy is achieved without a complex permission system — each user's data is completely isolated by this key.

---

## Slide 19 — Security Design

**Authentication & authorisation:**
- bcrypt (12 salt rounds) — passwords hashed before storage
- `password` field has `select: false` — never returned in API responses
- JWT signed with `JWT_SECRET` (from `.env`) — expires per configuration
- `protect` middleware validates token on all protected routes

**Transport security:**
- CORS headers configured; `OPTIONS` preflight returns 204
- JSON body limit: 10 MB — prevents payload-based DoS
- 404 and 500 handlers return structured JSON (no raw stack traces)

**Secrets management:**
- All secrets (`MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`) stored in `.env`
- `.env` is not committed; `.env.example` ships as a safe template

**Speaker notes:**
Security was designed with defence-in-depth in mind. Passwords are hashed before they ever reach the database. The JWT is validated on every request to a protected route. And sensitive keys are kept out of version control entirely. In a production deployment, additional layers such as HTTPS, rate limiting (express-rate-limit), and Helmet headers would be added.

---

## Slide 20 — PWA — Progressive Web App Features

**PWA technical requirements met:**
| Feature | Implementation |
|---|---|
| Web App Manifest | `frontend/public/manifest.json` — name, icons, theme colour |
| Service Worker | Asset caching for offline access |
| HTTPS-ready | Required for service worker in production |
| Installable | "Add to Home Screen" prompt — Android / iOS / Desktop Chrome |
| Responsive UI | Mobile-first React layout |

**User benefits:**
- Works like a native app without app-store installation or review process
- Offline access to cached pages and recently viewed data
- Fast reload on repeat visits (cache-first strategy)
- Equal experience across mobile and desktop browsers

**Speaker notes:**
Progressive Web Apps represent a major advancement in web technology. By adding a manifest and service worker, a standard website gains the ability to be installed, to work offline, and to load instantly on repeat visits. For small business users who may have unreliable internet, this offline capability is particularly valuable.

---

## Slide 21 — Testing Strategy

**API Testing (Postman / Thunder Client):**
- Test all CRUD endpoints with valid JWT → expect 200/201 responses
- Test with missing/expired JWT → expect 401 Unauthorized
- Test with invalid input (negative amounts, missing required fields) → expect 400

**Unit Testing (Jest / React Testing Library):**
- Auth flow: register, login, JWT storage
- Party creation form field validation
- Transaction type toggle (gave ↔ got)

**Security Testing:**
- Confirm `password` is never present in API responses
- Verify unauthorised requests return 401 and are blocked
- Confirm CORS rejects disallowed origins in production build

**Integration / End-to-End Testing:**
1. Login with valid credentials → receive JWT
2. Add party → verify party appears in list with zero balance
3. Add "You Gave" transaction → verify party balance decreases
4. View dashboard → verify net position reflects new transaction

**Speaker notes:**
Although automated tests are not currently in the repository, this testing strategy was followed manually during development. For a production system, these tests would be automated using Jest for the backend and Cypress for end-to-end flows.

---

## Slide 22 — Deployment Guide

**Backend (Render.com):**
```bash
cd backend
npm install
# Set environment variables in Render dashboard:
#   PORT=5000
#   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/creditbook
#   JWT_SECRET=long_random_secret_string
#   GROQ_API_KEY=gsk_your_groq_key
npm start
```

**Frontend (Vercel):**
```bash
cd frontend
npm install
# Set environment variable in Vercel dashboard:
#   REACT_APP_API_URL=https://your-render-backend.onrender.com/api
npm run build
```

**Local development (both together):**
```bash
# From repo root:
npm install         # installs concurrently
npm run dev         # starts backend (port 5000) + frontend (port 3000)
```

**Speaker notes:**
The deployment configuration is designed to be completely free. MongoDB Atlas provides 512 MB of free cloud storage, Render provides a free web service tier, and Vercel provides free static hosting. Total infrastructure cost for a small business using this system is zero.

---

## Slide 23 — Results & Outcomes

**Deliverables achieved:**
- ✅ Fully functional MERN-stack PWA with 7 backend route modules
- ✅ 5 Mongoose models with compound indices for query performance
- ✅ JWT-secured REST API with bcrypt password hashing
- ✅ Real-time running balance updates on every transaction
- ✅ Staff attendance + salary system with embedded payment history
- ✅ Dashboard with bar & pie charts using Recharts
- ✅ AI chatbot integrated using Groq free API (Llama 3.3 70B)
- ✅ PWA installable on Android / iOS / Desktop Chrome
- ✅ Deployable for free on Render + Vercel + MongoDB Atlas

**Impact:**
- Eliminates manual bookkeeping errors
- Reduces time to check party balances from minutes to seconds
- Provides data-driven insights previously unavailable to SME owners

**Speaker notes:**
Every objective stated at the beginning of the presentation has been met. The system was tested end-to-end across multiple browsers and devices. The AI chatbot was tested with various business queries and provides coherent, contextual responses.

---

## Slide 24 — Limitations

- **MongoDB dependency:** Requires MongoDB to be running (local or Atlas); no built-in fallback database
- **AI chatbot quality:** Dependent on prompt design and Groq API availability/uptime
- **Offline mode:** Limited to cached pages; adding new transactions requires an active network connection
- **Single-owner model:** Role-based access control is minimal — designed for a single business owner
- **No automated tests:** Test suite not included in repository; manual testing was performed
- **GST informational only:** Calculator provides estimates; no integration with GST portal or e-invoicing

**Speaker notes:**
Every system has limitations, and being transparent about them is important for academic integrity. Each limitation listed here is also a potential future enhancement — they represent known gaps, not design failures.

---

## Slide 25 — Future Enhancements

| Enhancement | Priority | Description |
|---|---|---|
| Role-based access control | High | Admin / Manager / Staff roles with granular permissions |
| PDF invoice / receipt generation | High | Export printable receipts using jsPDF or Puppeteer |
| Excel / PDF report export | Medium | Download reports with custom date-range filters |
| Multi-business support | Medium | Multiple ledgers per user account |
| Recurring transactions | Medium | Auto-schedule periodic entries (rent, EMI) |
| UPI / payment gateway | Low | Link transactions to actual digital payments |
| Bank statement import | Low | Reconcile via CSV upload |
| Advanced AI context | Medium | Feed live DB summary to AI for smarter, data-aware answers |
| Push notifications | Low | Overdue balance and salary-due reminders via Web Push API |
| Automated test suite | High | Jest (backend) + Cypress (E2E) coverage |

**Speaker notes:**
The priority column reflects both the business value and implementation effort of each enhancement. Role-based access control and invoice generation are the most commonly requested features by real small-business users.

---

## Slide 26 — Conclusion

**Summary:**
CreditBook delivers a complete, modern, and accessible accounting solution for small businesses:

- 🗂 **Organised ledger** — accurate party & transaction records replace manual books
- 📊 **Instant insights** — real-time dashboard and visual reports
- 👷 **HR module** — staff, attendance, and salary in one system
- 📱 **PWA** — works on any device, installable, offline-capable
- 🤖 **AI-assisted** — natural-language queries via CreditBot
- 🔒 **Secure** — JWT + bcrypt ensure data privacy per user
- ☁️ **Free to deploy** — Render + Vercel + MongoDB Atlas

**Closing statement:**
CreditBook demonstrates how a well-structured MERN application can solve real-world SME problems with modern, scalable, and cost-effective technology. The project is open-source and ready for real-world deployment.

**Speaker notes:**
To summarise — we have built a production-ready PWA that addresses the core problems faced by small businesses in managing credit and debit. The technology choices are pragmatic, the architecture is scalable, and the entire system can be deployed and operated at zero cost. Thank you for your attention. I am happy to take questions.

---

## Slide 27 — References

1. MongoDB Documentation — https://www.mongodb.com/docs/
2. Express.js Guide — https://expressjs.com/en/guide/routing.html
3. React 18 Documentation — https://react.dev/
4. Node.js Documentation — https://nodejs.org/en/docs/
5. Mongoose ODM Documentation — https://mongoosejs.com/docs/
6. JSON Web Tokens Introduction — https://jwt.io/introduction/
7. bcryptjs npm package — https://www.npmjs.com/package/bcryptjs
8. Recharts Documentation — https://recharts.org/en-US/
9. Groq API Documentation — https://console.groq.com/docs/openai
10. Progressive Web Apps on web.dev — https://web.dev/progressive-web-apps/
11. date-fns Documentation — https://date-fns.org/
12. Marp Presentation Framework — https://marp.app/
13. Mermaid Diagram Syntax — https://mermaid.js.org/intro/
14. MongoDB Atlas (Free Cloud DB) — https://www.mongodb.com/atlas
15. Render.com (Free Backend Hosting) — https://render.com/
16. Vercel (Free Frontend Hosting) — https://vercel.com/

---

## Slide 28 — Thank You (End Slide)

**CreditBook — Business Accounting PWA**
*GitHub Repository: github.com/u22csel2098-tech/creditbook*

**Questions & Discussion**

*(Your Name | College | Department | Year)*
