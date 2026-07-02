# BDA Team Module — Manufacturing CRM Portal

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://bda-team-module.vercel.app/)
[![Backend API](https://img.shields.io/badge/⚙️_Backend_API-Render-46E3B7?style=for-the-badge&logo=render)](https://bda-team-module-82s1.onrender.com)
[![GitHub](https://img.shields.io/badge/📦_Source_Code-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/PJain7988/BDA_Team_Module)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**A production-ready, full-stack MERN application for manufacturing BDA teams to manage leads, track performance, and collaborate efficiently.**

[🌐 Open Live App](https://bda-team-module.vercel.app/) &nbsp;|&nbsp; [📡 API Health Check](https://bda-team-module-82s1.onrender.com/api/health) &nbsp;|&nbsp; [📂 GitHub Repository](https://github.com/PJain7988/BDA_Team_Module)

</div>

---

## 🔗 Live Deployment Links

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** (Vercel) | https://bda-team-module.vercel.app/ | [![Vercel](https://img.shields.io/badge/status-live-green)](https://bda-team-module.vercel.app/) |
| **Backend API** (Render) | https://bda-team-module-82s1.onrender.com | [![Render](https://img.shields.io/badge/status-live-green)](https://bda-team-module-82s1.onrender.com/api/health) |
| **API Health Check** | https://bda-team-module-82s1.onrender.com/api/health | [![Health](https://img.shields.io/badge/health-ok-brightgreen)](https://bda-team-module-82s1.onrender.com/api/health) |

> ⚠️ **Note:** The Render backend may take 30–60 seconds to wake up on the first request (free tier cold start). Please wait briefly and then try logging in.

---

## 🔐 Demo Credentials

> Ready-to-use accounts seeded automatically into the database.

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| 👑 **Manager** | `manager@mfg.com` | `Manager@123` | Full system access — all features |
| 👨‍💼 **Team Lead** | `teamlead@mfg.com` | `TeamLead@123` | Team + Analytics + Leads |
| 📋 **BDA** | `bda@mfg.com` | `BDA@123` | Own leads + Communications only |

> 💡 **Tip:** On the login page, click the **Quick Demo Login** buttons to auto-fill credentials instantly!

---

## 📸 Screenshots

### 🔐 Login Page — with Quick Demo Login
![Login Screen](./screenshots/login.png)

> Features: Glassmorphism card, animated blobs, role-based quick-fill buttons, password show/toggle.

---

### 📊 Dashboard — Real-Time KPI Overview
![Dashboard](./screenshots/dashboard.png)

> Features: 4 KPI stat cards, 6-month line trend chart, pipeline bar chart, and dark/light mode support.

---

### 📋 Lead Management — Advanced Table & Filters
![Lead Management](./screenshots/leads.png)

> Features: CRUD operations, stage badges, pagination, search & filter by status/value/team member.

---

### 🗂️ Kanban Board — Drag-and-Drop Pipeline
![Kanban Board](./screenshots/leads_kanban.png)

> Features: Drag leads across 5 pipeline stages with real-time Socket.io updates.

---

### 📈 Analytics — Business Intelligence & Rankings
![Analytics](./screenshots/analytics.png)

> Features: Revenue charts, conversion rates, team performance leaderboard, individual BDA KPIs.

---

## 🎯 Project Overview

The BDA Team Module is a comprehensive **workflow management CRM** built for manufacturing companies. It streamlines:
- Lead pipeline management across multiple stages
- Team performance monitoring with real-time analytics
- Client communication and follow-up tracking
- Role-based access control for BDA, Team Lead, and Manager levels
- Real-time notifications via Socket.io

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | Component UI library |
| **Redux Toolkit** | Global state management |
| **React Router v6** | Client-side routing |
| **Tailwind CSS v3** | Utility-first styling |
| **Recharts** | Data visualization charts |
| **React Beautiful DnD** | Kanban drag-and-drop |
| **React Toastify** | Toast notifications |
| **Axios** | HTTP client with interceptors |
| **Socket.io Client** | Real-time updates |
| **Lucide React** | Modern icon library |
| **Vite** | Lightning-fast build tool |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework |
| **MongoDB Atlas** | Cloud NoSQL database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Token-based authentication |
| **Bcryptjs** | Password hashing |
| **Socket.io** | Real-time WebSocket communication |
| **Helmet** | HTTP security headers |
| **Express Rate Limit** | API abuse protection |
| **Morgan** | HTTP request logger |
| **Compression** | Response gzip compression |

### Deployment
| Platform | Service |
|---------|---------|
| **Vercel** | Frontend hosting (CI/CD via GitHub) |
| **Render** | Backend hosting (auto-deploy) |
| **MongoDB Atlas** | Cloud database (M0 free tier) |

---

## 📁 Project Structure

```
bda-team-module/
├── frontend/                    # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Top navigation with notifications
│   │   │   ├── Sidebar.jsx      # Collapsible navigation sidebar
│   │   │   ├── Modal.jsx        # Reusable modal dialog
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Notification.jsx # Socket.io notifications
│   │   │   └── PrivateRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Auth with demo quick-fill
│   │   │   ├── Dashboard.jsx    # KPIs, trends, charts
│   │   │   ├── Leads.jsx        # Lead table + Kanban board
│   │   │   ├── LeadDetail.jsx   # Lead detail & communications
│   │   │   ├── Team.jsx         # Team members & performance
│   │   │   ├── Analytics.jsx    # Deep business intelligence
│   │   │   ├── Communications.jsx
│   │   │   └── Profile.jsx
│   │   ├── redux/
│   │   │   ├── slices/
│   │   │   └── store.js
│   │   ├── services/
│   │   │   ├── api.js           # Axios instance with interceptors
│   │   │   └── authService.js
│   │   ├── App.jsx
│   │   └── index.css            # Tailwind + design system
│   ├── index.html               # SEO-optimized entry point
│   ├── vite.config.js
│   └── package.json
│
├── backend/                     # Node.js + Express API
│   ├── config/
│   │   └── database.js          # MongoDB connection + memory fallback
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── leadController.js
│   │   ├── teamController.js
│   │   ├── communicationController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification + role check
│   │   ├── errorHandler.js      # Centralized error handling
│   │   └── validation.js        # Request validation
│   ├── models/
│   │   ├── User.js
│   │   ├── Lead.js
│   │   ├── Communication.js
│   │   └── Team.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── leads.js
│   │   ├── team.js
│   │   ├── communications.js
│   │   └── analytics.js
│   ├── utils/
│   │   └── seeder.js            # Auto database seeding
│   ├── server.js                # Express app entry point
│   └── package.json
│
├── api/
│   └── index.js                 # Vercel serverless entry
├── screenshots/                 # README screenshots
├── .gitignore
├── vercel.json                  # Vercel deployment config
├── render.yaml                  # Render deployment config
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- MongoDB (local) or MongoDB Atlas URI
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/PJain7988/BDA_Team_Module.git
cd BDA_Team_Module
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

**Backend `.env` example:**
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/BDA_Team_Module
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

```bash
# Start backend
npm run dev
# Server: http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create environment file
cp .env.example .env
```

**Frontend `.env` example:**
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000
VITE_ENV=development
```

```bash
# Start frontend
npm run dev
# App: http://localhost:3000
```

---

## 🧪 API Endpoints

### Base URL (Production)
```
https://bda-team-module-82s1.onrender.com
```

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/forgot-password` | Request password reset |
| GET  | `/api/auth/me` | Get current user |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/leads` | Get all leads (filterable) |
| POST   | `/api/leads` | Create new lead |
| GET    | `/api/leads/:id` | Get single lead |
| PUT    | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| PATCH  | `/api/leads/:id/stage` | Update lead stage |

### Team
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/team/members` | Get all team members |
| POST | `/api/team/members` | Add team member |
| PUT  | `/api/team/members/:id` | Update member |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard metrics |
| GET | `/api/analytics/trends` | Monthly trend data |
| GET | `/api/analytics/team-performance` | Team KPIs |
| GET | `/api/analytics/pipeline` | Pipeline breakdown |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check |
| GET | `/` | API info & docs |

---

## 🔒 Role-Based Access Control

| Feature | BDA | Team Lead | Manager |
|---------|:---:|:---------:|:-------:|
| View Own Leads | ✅ | ✅ | ✅ |
| Create Leads | ✅ | ✅ | ✅ |
| Edit Own Leads | ✅ | ✅ | ✅ |
| View Team Leads | ❌ | ✅ | ✅ |
| Assign Leads | ❌ | ✅ | ✅ |
| View Analytics | ❌ | ✅ | ✅ |
| Manage Team | ❌ | ❌ | ✅ |
| Delete Leads | ❌ | ❌ | ✅ |
| Generate Reports | ❌ | ✅ | ✅ |

---

## 🗄️ Database Schema

<details>
<summary><strong>User Schema</strong></summary>

```javascript
{
  name:       String (required),
  email:      String (unique, required),
  password:   String (bcrypt hashed),
  role:       'BDA' | 'TeamLead' | 'Manager',
  team:       ObjectId → Team,
  phone:      String,
  department: String,
  avatar:     String,
  createdAt:  Date,
  updatedAt:  Date
}
```
</details>

<details>
<summary><strong>Lead Schema</strong></summary>

```javascript
{
  companyName:      String (required),
  contactName:      String (required),
  email:            String,
  phone:            String,
  industry:         String,
  dealValue:        Number,
  stage:            'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost',
  source:           String,
  assignedTo:       ObjectId → User,
  expectedCloseDate:Date,
  probability:      Number (0–100),
  notes:            String,
  communications:   [ObjectId → Communication],
  createdBy:        ObjectId → User,
  createdAt:        Date,
  updatedAt:        Date
}
```
</details>

<details>
<summary><strong>Communication Schema</strong></summary>

```javascript
{
  lead:            ObjectId → Lead,
  type:            'Call' | 'Email' | 'Meeting' | 'Note' | 'Demo',
  subject:         String,
  description:     String,
  communicatedWith:String,
  duration:        Number (minutes),
  nextFollowUp:    Date,
  createdBy:       ObjectId → User,
  createdAt:       Date
}
```
</details>

---

## 📈 Performance Features

- **Redux caching** — reduces redundant API calls
- **Lazy loading** — routes loaded on demand
- **Debounced search** — prevents excessive API hits
- **Pagination** — lead list supports 20 items per page
- **Gzip compression** — backend responses compressed
- **Rate limiting** — 500 global / 20 auth requests per 15 min
- **In-memory MongoDB fallback** — works even without Atlas URI

---

## 🐛 Troubleshooting

### Backend cold start (Render free tier)
The backend may take **30–60 seconds** on first request. Simply wait and retry.

### CORS errors
Make sure `CORS_ORIGIN` in backend `.env` matches the frontend URL exactly.

### MongoDB connection
If `MONGODB_URI` is not set, the backend automatically uses an **in-memory MongoDB** (data resets on restart). Set a real Atlas URI for persistence.

### Port conflicts
```bash
# Change PORT in backend .env
PORT=5001
```

---

## 🤝 Git Workflow

```bash
git clone https://github.com/PJain7988/BDA_Team_Module.git
cd BDA_Team_Module

# Make changes
git add .
git commit -m "feat: your feature description"
git push origin main
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Prateek Jain** — Full-stack MERN Developer

Built as a technical assessment project demonstrating production-grade full-stack development with React, Node.js, MongoDB, and real-time WebSocket capabilities.

---

## 📞 Support & Links

| Resource | Link |
|----------|------|
| 🌐 Live App | https://bda-team-module.vercel.app/ |
| 📡 Backend API | https://bda-team-module-82s1.onrender.com |
| 💊 API Health | https://bda-team-module-82s1.onrender.com/api/health |
| 📦 GitHub | https://github.com/PJain7988/BDA_Team_Module |

---

<div align="center">

**Last Updated:** July 2026 &nbsp;·&nbsp; **Version:** 1.0.0 &nbsp;·&nbsp; **Status:** 🟢 Production Ready

</div>
