# Digital Banking Admin Dashboard

A full-stack admin dashboard for managing a digital banking system. Built with React, Tailwind CSS, and FastAPI.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![React](https://img.shields.io/badge/React-18.3-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.128-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-blue)

## 📋 Project Overview

The Digital Banking Admin Dashboard is a comprehensive administrative interface for managing a digital banking platform. It provides administrators with real-time insights into user activity, system alerts, and financial transactions.

### What This Dashboard Does

- **User Management**: View, manage, and monitor all banking users
- **Alert Monitoring**: Track and respond to system alerts (low balance, bill due, budget exceeded)
- **System Insights**: Analyze user growth, alert trends, and system health
- **Activity Logs**: Maintain audit trails of all administrative actions
- **Settings Management**: Configure system parameters and notification preferences

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Admin Authentication** | Secure JWT-based login system with session management |
| **User Management** | View user details, KYC status, account counts, and activity |
| **Alerts Monitoring** | Track low balance, bill due, and budget exceeded alerts |
| **System Insights** | Dashboard with charts showing growth trends and statistics |
| **Logs Tracking** | View administrative action logs with filtering |
| **Settings Management** | Configure thresholds, notifications, and security settings |

---

## 🛠 Tech Stack

### Frontend
- **React 18.3** - UI library
- **Tailwind CSS 4.1** - Styling framework
- **Vite 6.3** - Build tool
- **Recharts** - Data visualization
- **Radix UI** - Component primitives
- **Lucide React** - Icons

### Backend
- **FastAPI 0.128** - Web framework
- **SQLAlchemy 2.0** - ORM
- **Pydantic 2.12** - Data validation
- **Python-Jose** - JWT handling
- **Uvicorn** - ASGI server

### Database
- **PostgreSQL** - Primary database (optional - mock data fallback available)
- **SQLite fallback** - In-memory data for development

---

## 📁 Folder Structure

```
modern-digital-banking-jan-26/
│
├── client/                    # React Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/         # API service layer
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── context/     # React Context (Auth)
│   │   │   └── pages/       # Page components
│   │   ├── styles/          # CSS and Tailwind
│   │   └── main.tsx         # Entry point
│   ├── vite.config.ts       # Vite configuration
│   ├── tsconfig.json        # TypeScript config
│   └── package.json
│
├── server/                   # FastAPI Backend
│   ├── src/
│   │   ├── api.py           # App initialization
│   │   ├── main.py          # Entry point
│   │   ├── auth/            # Authentication module
│   │   ├── users/           # User management
│   │   ├── alerts/          # Alert system
│   │   ├── dashboard/      # Dashboard statistics
│   │   ├── logs/            # Activity logging
│   │   ├── settings/        # System settings
│   │   └── database/        # Database configuration
│   └── requirements.txt
│
├── admin/                    # Legacy location (backup)
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.9+
- **PostgreSQL** (optional)

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/modern-digital-banking-jan-26.git
cd modern-digital-banking-jan-26
```

---

### 2. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create environment file (optional)
echo "VITE_API_URL=http://localhost:8000" > .env
```

---

### 3. Backend Setup

```bash
# Navigate to server directory
cd server

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

---

### 4. Database Setup (Optional)

The backend works with **mock data** by default. To use PostgreSQL:

```bash
# Create PostgreSQL database
createdb digital_banking_admin

# Set environment variables
export DATABASE_URL="postgresql://username:password@localhost/digital_banking_admin"
```

If no database is configured, the system automatically uses mock data fallback.

---

## ▶️ How to Run

### Start the Backend

```bash
cd server
source venv/bin/activate

# Run with uvicorn
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

The API will be available at: **http://localhost:8000**

API Documentation (Swagger UI): **http://localhost:8000/docs**

---

### Start the Frontend

```bash
cd client
npm run dev
```

The frontend will be available at: **http://localhost:5173**

---

### Build for Production

```bash
cd client
npm run build
```

The production build will be in `client/dist/`

---

## 📊 API Overview

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/auth/token` | Admin login |
| GET | `/admin/auth/me` | Get current admin |

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard/stats` | Get dashboard statistics |
| GET | `/admin/dashboard/health` | System health check |

### User Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users/` | List all users |
| GET | `/admin/users/stats` | User statistics |
| PATCH | `/admin/users/{id}/status` | Update user status |

### Alert Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/alerts/` | List alerts |
| PATCH | `/admin/alerts/{id}/read` | Mark alert as read |
| PATCH | `/admin/alerts/{id}/status` | Update alert status |

### Logs Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/logs/` | List activity logs |
| GET | `/admin/logs/stats` | Log statistics |

### Settings Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/settings/` | Get system settings |
| PUT | `/admin/settings/` | Update settings |

---

## 🔧 Environment Variables

### Backend (.env)

```env
# Database (optional - uses mock data if not set)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT Secret (change in production!)
JWT_SECRET_KEY=your-secret-key-here

# Server
HOST=0.0.0.0
PORT=8000
```

### Frontend (.env)

```env
# API URL
VITE_API_URL=http://localhost:8000
```

---

## 📱 Default Credentials

For testing purposes, you can use these credentials:

```
Email: admin@banking.com
Password: admin123
```

> ⚠️ **Important**: Change these credentials in production!

---

## 🔄 Mock Data Fallback

The application works without a database using built-in mock data:

- ✅ User data is simulated
- ✅ Alert data is simulated
- ✅ Dashboard statistics are simulated
- ✅ All API endpoints return realistic data

To enable real database storage, configure the `DATABASE_URL` environment variable.

---


## 🔮 Future Improvements

- [ ] Real-time WebSocket updates
- [ ] Advanced filtering and search
- [ ] Export data to CSV/Excel
- [ ] Email/SMS notification system
- [ ] Multi-admin support with roles
- [ ] Audit log archival
- [ ] API rate limiting
- [ ] Docker containerization
- [ ] CI/CD pipeline setup

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

Created as a portfolio project for internship applications.

---

## 🙏 Acknowledgments

- [React](https://react.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Radix UI](https://www.radix-ui.com/)
