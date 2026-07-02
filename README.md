# BDA Team Module - Manufacturing Lead Management System

A modern, full-stack MERN application designed for Business Development Associate teams in manufacturing companies. This system streamlines lead management, sales tracking, team collaboration, and performance analytics.

## 🎯 Project Overview

The BDA Team Module is a comprehensive workflow management system built to help manufacturing companies:
- Manage and track sales leads through multiple pipeline stages
- Monitor team performance with real-time analytics
- Track client communications and follow-ups
- Generate detailed reports for management review
- Facilitate team collaboration with role-based access control

## 📸 Visual Tour & Interface

Here is a visual showcase of the modernized, high-fidelity user interface of the BDA CRM Portal:

### 🔐 Secure & Modern Authentication
![BDA CRM Portal Login Screen](./screenshots/login.png)

### 📊 Real-Time Sales & Lead Analytics Dashboard
![Analytics and Leads Trends Dashboard](./screenshots/dashboard.png)

### 📋 High-Fidelity Lead Management System
![Lead Management Table and Stage Tracker](./screenshots/leads.png)

### 🗂️ Interactive Kanban Pipeline Board (Drag-and-Drop)
![Kanban Pipeline Board](./screenshots/leads_kanban.png)

### 📈 Deep Business Intelligence & Performance Rankings
![Analytics Charts and Rankings](./screenshots/analytics.png)

## 📋 Features

### Core Features
- **Lead Management Dashboard** - Complete CRUD operations for leads
- **Kanban Board** - Drag-and-drop pipeline stages (Prospecting → Negotiation → Closed)
- **Sales Analytics Dashboard** - Real-time metrics, conversion rates, revenue projections
- **Team Performance Tracking** - Individual and team KPIs, leaderboards
- **Communication Log** - Track interactions, follow-ups, meeting notes
- **Role-Based Access Control** - BDA, Team Lead, Manager roles with different permissions
- **Real-time Notifications** - Socket.io powered live updates
- **Export Functionality** - PDF/CSV reports for leads and performance data
- **Advanced Filtering & Search** - Filter by status, date, team member, value range
- **User Authentication** - JWT-based secure login

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Beautiful DnD** - Drag-and-drop functionality
- **Chart.js/Recharts** - Data visualization
- **React-Toastify** - Notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Socket.io** - Real-time communication
- **Bcryptjs** - Password hashing
- **Dotenv** - Environment variables

## 📁 Project Structure

```
bda-module/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── LeadCard.jsx
│   │   │   ├── KanbanBoard.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   └── Modal.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Leads.jsx
│   │   │   ├── LeadDetail.jsx
│   │   │   ├── Team.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Communications.jsx
│   │   ├── redux/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── leadSlice.js
│   │   │   │   ├── teamSlice.js
│   │   │   │   └── notificationSlice.js
│   │   │   └── store.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── leadService.js
│   │   │   └── teamService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Lead.js
│   │   ├── Communication.js
│   │   └── Team.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── leads.js
│   │   ├── team.js
│   │   └── analytics.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── leadController.js
│   │   ├── teamController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── utils/
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── config/
│   │   └── database.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
├── .gitignore
└── .git (initialized with commits)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/bda-module.git
cd bda-module
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
# Edit .env with your MongoDB URI, JWT secret, etc.
MONGODB_URI=mongodb://localhost:27017/bda-module
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development

# Start MongoDB (if local)
# mongod

# Run backend server
npm run dev
```

Backend will run on `http://localhost:5000`

#### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=http://localhost:5000

# Start frontend development server
npm start
```

Frontend will run on `http://localhost:3000`

## 📝 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/bda-module
JWT_SECRET=your_super_secret_jwt_key_2024
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=http://localhost:5000
REACT_APP_ENV=development
```

## 🔐 Authentication

### Test Credentials

**Manager Role**
- Email: manager@mfg.com
- Password: Manager@123

**Team Lead Role**
- Email: teamlead@mfg.com
- Password: TeamLead@123

**BDA Role**
- Email: bda@mfg.com
- Password: BDA@123

## 📊 Key Features Explained

### 1. Lead Management
- Create, read, update, delete leads
- Assign leads to team members
- Set deal value and expected close date
- Track lead source and industry

### 2. Pipeline View (Kanban)
- Drag leads between stages: Prospecting → Qualification → Proposal → Negotiation → Closed
- Real-time status updates
- Visual progress tracking

### 3. Analytics Dashboard
- Total leads count and conversion rate
- Revenue metrics and pipeline value
- Team performance comparison
- Monthly trend analysis
- Individual BDA KPIs

### 4. Team Management
- View all team members
- Track individual performance
- Assign team leads
- Monitor team utilization

### 5. Communication Log
- Record all client interactions
- Track follow-up dates
- Attach meeting notes
- Email history integration

### 6. Reports & Export
- Generate PDF reports
- Export data to CSV
- Schedule automatic reports
- Email reports to stakeholders

## 🔒 Role-Based Access Control

| Feature | BDA | Team Lead | Manager |
|---------|-----|-----------|---------|
| View Own Leads | ✓ | ✓ | ✓ |
| Create Leads | ✓ | ✓ | ✓ |
| Edit Own Leads | ✓ | ✓ | ✓ |
| View Team Leads | ✗ | ✓ | ✓ |
| Assign Leads | ✗ | ✓ | ✓ |
| View Analytics | ✗ | ✓ | ✓ |
| Manage Team | ✗ | ✗ | ✓ |
| View All Leads | ✗ | ✓ | ✓ |
| Delete Leads | ✗ | ✗ | ✓ |
| Generate Reports | ✗ | ✓ | ✓ |

## 🗄️ Database Schema

### User Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (BDA, TeamLead, Manager),
  team: ObjectId (reference to Team),
  avatar: String,
  phone: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Lead Schema
```javascript
{
  _id: ObjectId,
  companyName: String,
  contactName: String,
  email: String,
  phone: String,
  industry: String,
  dealValue: Number,
  stage: String (Prospecting, Qualification, etc.),
  source: String,
  assignedTo: ObjectId (reference to User),
  expectedCloseDate: Date,
  probability: Number,
  notes: String,
  attachments: [String],
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Communication Schema
```javascript
{
  _id: ObjectId,
  lead: ObjectId,
  type: String (Call, Email, Meeting, Note),
  subject: String,
  description: String,
  communicatedWith: String,
  nextFollowUp: Date,
  attachments: [String],
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## 📦 Installation & Running

### Quick Start (Development)

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm start
```

### Production Build

```bash
# Frontend
cd frontend
npm run build

# Backend (ensure NODE_ENV=production)
cd backend
npm start
```

## 📈 Performance Considerations

- **Pagination**: Leads list supports pagination (default 20 per page)
- **Caching**: Redux caching for frequently accessed data
- **Lazy Loading**: Components loaded on-demand
- **Debouncing**: Search and filter operations debounced
- **Image Optimization**: Avatar images optimized

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Leads
- `GET /api/leads` - Get all leads (with filters)
- `GET /api/leads/:id` - Get lead details
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `PATCH /api/leads/:id/stage` - Update lead stage

### Team
- `GET /api/team/members` - Get team members
- `GET /api/team/members/:id` - Get member details
- `POST /api/team/members` - Add team member
- `PUT /api/team/members/:id` - Update member

### Communications
- `GET /api/communications` - Get all communications
- `POST /api/communications` - Create communication log
- `GET /api/communications/:leadId` - Get lead communications

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/team-performance` - Team KPIs
- `GET /api/analytics/pipeline` - Pipeline analysis
- `GET /api/analytics/export` - Export data

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Ensure MongoDB is running
# Linux/Mac: brew services start mongodb-community
# Windows: MongoDB should be in Services

# Check connection string in .env
# Format: mongodb://localhost:27017/bda-module
```

### Port Already in Use
```bash
# Change PORT in backend .env
PORT=5001

# Or kill process on port
lsof -i :5000
kill -9 <PID>
```

### CORS Errors
- Ensure `CORS_ORIGIN` in backend .env matches frontend URL
- Check that both servers are running

## 📚 Learning Resources

- [MERN Stack Guide](https://www.mongodb.com/mern-stack)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 🤝 Git Workflow

The project includes meaningful commit history:

```bash
git log --oneline

# You'll see commits like:
# - feat: implement lead management dashboard
# - feat: add kanban board with drag-and-drop
# - feat: create authentication system with JWT
# - feat: build analytics dashboard with charts
# - feat: add team management features
# - feat: implement role-based access control
# - feat: create communication log module
# - feat: add export to PDF/CSV functionality
# - refactor: optimize component structure
# - docs: add comprehensive README
```

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💼 Author

Created as a technical assessment for MERN Stack Developer Intern position.

## 📞 Support

For issues or questions, please reach out to the development team.

---

**Last Updated**: May 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
