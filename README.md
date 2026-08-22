# 🚆 RailQuick Delivery Agent Platform

A modern, highly-specialized logistics and delivery agent application designed specifically for **Railway Operations**. This platform enables delivery partners to seamlessly manage, track, and complete food & goods deliveries directly to passengers on trains using their PNR, Train Number, Coach, and Seat details.

![RailQuick Theme](https://img.shields.io/badge/UI_Theme-Deep_Navy_Blue-1C64F2?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React_%7C_Express_%7C_Prisma-22c55e?style=flat-square)

---

## ✨ Key Features

- **🚄 Railway-Centric Logistics:** Full support for PNR, Train Name/Number, Coach, Seat, and Station Codes instead of standard addresses.
- **📱 Agent Dashboard:** Real-time summary of today's deliveries, earnings, and success rates.
- **🎨 Premium UI/UX:** A stunning, cinematic "Deep Navy Blue" dark mode aesthetic tailored for mobile viewports.
- **🔒 Secure Authentication:** JWT-based login using Mobile Number/Email and Password.
- **🚦 Simulation Tools:** Built-in dev toggles to simulate network loss and traffic delays.
- **📦 Monorepo Architecture:** Cleanly separated frontend, backend, and shared TypeScript types.

---

## 🛠️ Tech Stack

### Frontend (`apps/frontend`)
- **Framework:** React 18 with Vite
- **Styling:** Vanilla CSS variables + Tailwind CSS
- **State Management:** Zustand
- **Icons:** Lucide React
- **Routing:** React Router DOM (v6)

### Backend (`apps/backend`)
- **Server:** Node.js & Express.js
- **Database:** SQLite (Development)
- **ORM:** Prisma
- **Auth:** JSON Web Tokens (JWT) & bcryptjs

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sinhah166/Delivery-agent.git
   cd Delivery-agent
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Database Setup (Backend):**
   Navigate to the backend and initialize the database.
   ```bash
   cd apps/backend
   npx prisma db push
   npm run seed
   cd ../..
   ```

4. **Run the Application:**
   Start both the frontend and backend concurrently from the root directory:
   ```bash
   npm run dev
   ```
   *Frontend runs on `http://localhost:5173`*
   *Backend runs on `http://localhost:3001`*

---

## 🔐 Demo Credentials

Use the following credentials to log in to the delivery agent app:

- **Mobile Number:** `+91-9876543210`
- **Email:** `alex@railquick.com`
- **Password:** `demo123`

*(Other agents available in seed data: rahul@, priya@, aman@, karan@ with the same password).*

---

## 📂 Project Structure

```text
delivery-agent-app/
├── apps/
│   ├── frontend/         # React + Vite application
│   └── backend/          # Express API server + Prisma schema
├── packages/
│   └── shared-types/     # Shared TypeScript interfaces (Agent, Order, etc.)
└── package.json          # Root workspace configuration
```

---
*Built with ❤️ for rapid railway deliveries.*