# BDA CRM Portal — Enterprise Lead & Team Management System

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel&logoColor=white)](https://bda-team-module.vercel.app/)
[![Render Deployment](https://img.shields.io/badge/Backend-Render-darkblue?logo=render&logoColor=white)](https://bda-team-module-82s1.onrender.com)
[![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue)](https://mongodb.com)

A high-performance, full-stack lead management system custom-built for Business Development Associate (BDA) teams. The platform streamlines lead ingestion, workflow routing, communications logging, and real-time sales performance metrics.

---

## 📸 Interface Showcase

*   **Secure Authentication Screen** — Modern, glassmorphic login interface.
*   **Sales Performance Dashboard** — Interactive Recharts visualization with conversion metrics and pipeline analysis.
*   **Drag-and-Drop Kanban Board** — Visual lead progression board using HTML5 DnD actions.
*   **Interactive Team Analytics Leaderboard** — Live ranking of BDA conversion rates and closed deals.

---

## 🌟 Key Features

*   **Role-Based Dashboards & Filters**:
    *   **Manager**: Complete oversight of all leads, team performance tables, global trends, and exports.
    *   **Team Lead**: Metrics and pipeline views filtered dynamically to show only their specific team's activities.
    *   **BDA**: Personal performance stats and interactive lead tracker limited to their assigned portfolio.
*   **Lead Pipeline Tracker**: Complete CRUD capability, inline pipeline updates, and dynamic search/filter parameters (by value, status, or date).
*   **Automatic Database Seeding**: Pre-loaded with demo users, teams, and sample leads for zero-friction evaluation.
*   **JWT-Based Authentication**: Encrypted password hashing and route-guard middleware.

---

## ⚙️ Tech Stack

*   **Frontend**: React.js, Redux Toolkit, Tailwind CSS, Recharts, Lucide-react
*   **Backend**: Node.js, Express.js, MongoDB (Mongoose ODM)

---

## 📂 Project Structure

```
bda-module/
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Kanban, Navbar, Sidebar, Modal)
│   │   ├── pages/           # Routed view containers (Dashboard, Leads, Analytics)
│   │   ├── redux/           # Redux Toolkit global store state
│   │   └── services/        # Service requests matching Render endpoints
│   └── vercel.json          # Frontend routing configuration
├── backend/
│   ├── config/              # Database settings
│   ├── controllers/         # Analytics, Lead, and Auth handlers
│   ├── models/              # Schema declarations (User, Lead, Team)
│   ├── routes/              # Express Router API routes
│   └── server.js            # Server orchestrator
├── vercel.json              # Monorepo vercel routing
└── README.md
```

---

## 🚀 Getting Started

### Installation & Local Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/PJain7988/BDA_Team_Module.git
   cd BDA_Team_Module
   ```

2. **Configure Backend Environment**:
   Create a `.env` file inside the `backend/` folder:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_signing_secret
   NODE_ENV=development
   ```

3. **Install Dependencies and Start Servers**:
   *   **Backend**:
       ```bash
       cd backend
       npm install
       npm run dev
       ```
   *   **Frontend**:
       ```bash
       cd ../frontend
       npm install
       npm run dev
       ```

---

## ⚡ Deployment Mappings

*   **Frontend URL (Vercel)**: [https://bda-team-module.vercel.app/](https://bda-team-module.vercel.app/)
*   **Backend API URL (Render)**: [https://bda-team-module-82s1.onrender.com](https://bda-team-module-82s1.onrender.com)

---

## 🤝 Contribution & Authorship

Developed and maintained exclusively by:
*   **PJain7988** (Priya Jain) — [GitHub Profile](https://github.com/PJain7988)
