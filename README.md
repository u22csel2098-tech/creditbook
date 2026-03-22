# 💳 CreditBook — Business Accounting PWA

A full-featured business accounting app built with **MongoDB, Express.js, React, Node.js** as a **Progressive Web App (PWA)** with a **free AI chatbot** powered by Groq.

---

## 📁 Project Structure

```
creditbook/
├── backend/          ← Node.js + Express + MongoDB API
├── frontend/         ← React PWA
├── package.json      ← Root scripts (run both together)
└── README.md
```

---

## ✅ Features

| Feature | Details |
|---|---|
| 👥 Customers | Separate page, gave/got tracking, balance |
| 🏪 Suppliers | Separate page, full transaction history |
| 💸 Transactions | You Gave / You Got with running balance |
| 👷 Staff | Add staff, salary, roles |
| 📅 Attendance | Dropdown: Present / Absent / Half Day / Paid Leave |
| 💰 Salary | Auto calculation, advance payments |
| 🧮 Calculator | With GST 5%/12%/18% and discount shortcuts |
| 📊 Reports | Bar & Pie charts, net position, top debtors |
| 🤖 CreditBot AI | Free Groq AI chatbot — reads your business data |
| 📱 PWA | Installable on phone, works offline |

---

## 🚀 Quick Start

### Step 1 — Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and Groq key
npm start
# Runs at http://localhost:5000
```

### Step 2 — Frontend
```bash
cd frontend
npm install
npm start
# Opens at http://localhost:3000
```

### Run both together (from root)
```bash
npm install          # installs concurrently
npm run dev          # starts both backend + frontend
```

---

## ⚙️ Backend .env Setup

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/creditbook
JWT_SECRET=any_long_random_string
GROQ_API_KEY=gsk_your_key_here
NODE_ENV=development
```

**MongoDB Atlas (free cloud):** https://www.mongodb.com/atlas

---

## 🤖 Free Groq AI Key (no credit card)

1. Go to **https://console.groq.com**
2. Sign up free
3. Click **API Keys** → **Create API Key**
4. Copy key → paste in `backend/.env` as `GROQ_API_KEY=gsk_...`
5. Restart backend

Free tier: **14,400 requests/day**. Uses **Llama 3.3 70B** model.

---

## 🌐 Deploy Free

| Service | What to deploy |
|---|---|
| **Render.com** | backend/ folder |
| **Vercel** | frontend/ folder |
| **MongoDB Atlas** | Free database |

Set `REACT_APP_API_URL=https://your-render-url.onrender.com/api` in Vercel env vars.

---

## 🛠 Tech Stack

- **Frontend:** React 18, React Router v6, Recharts, date-fns
- **Backend:** Node.js, Express 4, Mongoose 7
- **Database:** MongoDB
- **Auth:** JWT + bcrypt
- **AI:** Groq API (Llama 3.3 70B) — free
- **PWA:** manifest.json + Service Worker
