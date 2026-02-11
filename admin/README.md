# Digital Banking Admin Dashboard

A modern, full-stack admin dashboard for a Digital Banking System with React + Tailwind frontend and FastAPI backend.

## 🚀 Features

- **Frontend**: React 18 + Tailwind CSS v4 + TypeScript
- **Backend**: FastAPI with PostgreSQL + SQLAlchemy
- **Authentication**: JWT-based authentication with demo credentials
- **Components**: Shadcn/ui inspired components with Radix UI
- **Charts**: Recharts for data visualization
- **Real-time**: API integration replacing mock data

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- Python 3.9+ and pip
- PostgreSQL (or use SQLite for development)

## 🛠️ Installation

### 1. Backend Setup

```bash
cd admin/server

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env file with your database URL
# Default: postgresql://admin_user:admin123@localhost:5432/admin_dashboard

# For development without PostgreSQL, you can use SQLite:
# DATABASE_URL=sqlite:///./admin_dashboard.db
```

### 2. Frontend Setup

```bash
cd admin/client

# Install dependencies with pnpm (recommended)
pnpm install

# Or with npm
npm install

# Create environment file
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000
```

## 🏃 Running the Application

### Start Backend

```bash
cd admin/server
source venv/bin/activate  # Activate virtual environment
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Start Frontend

```bash
cd admin/client
pnpm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔐 Demo Credentials

- **Email**: admin@smartbank.com
- **Password**: admin123

## 📡 API Endpoints

### Authentication
- `POST /admin/auth/token` - Get JWT token
- `POST /admin/auth/login` - Admin login
- `GET /admin/auth/me` - Get current user

### Dashboard
- `GET /admin/dashboard/stats` - Dashboard statistics
- `GET /admin/dashboard/health` - System health check

### Users
- `GET /admin/users/` - List users (paginated)
- `GET /admin/users/stats` - User statistics
- `GET /admin/users/{id}` - Get user by ID
- `PATCH /admin/users/{id}/status` - Update user status

### Alerts
- `GET /admin/alerts/` - List alerts (with filters)
- `GET /admin/alerts/{id}` - Get alert by ID
- `PATCH /admin/alerts/{id}/read` - Mark alert as read
- `PATCH /admin/alerts/{id}/status` - Update alert status

### Logs
- `GET /admin/logs/` - List admin logs
- `GET /admin/logs/stats` - Log statistics

### Settings
- `GET /admin/settings/` - Get all settings
- `PUT /admin/settings/` - Update settings

## 🏗️ Project Structure

```
admin/
├── server/
│   ├── src/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── api.py            # Route registration
│   │   ├── database/
│   │   │   └── core.py       # Database configuration
│   │   ├── auth/
│   │   │   └── controller.py # JWT authentication
│   │   ├── users/
│   │   │   ├── controller.py
│   │   │   ├── models.py
│   │   │   └── service.py
│   │   ├── alerts/
│   │   │   ├── controller.py
│   │   │   ├── models.py
│   │   │   └── service.py
│   │   ├── dashboard/
│   │   │   ├── controller.py
│   │   │   └── service.py
│   │   ├── logs/
│   │   │   ├── controller.py
│   │   │   ├── models.py
│   │   │   └── service.py
│   │   └── settings/
│   │       ├── controller.py
│   │       ├── models.py
│   │       └── service.py
│   ├── requirements.txt
│   └── .env
│
└── client/
    ├── src/
    │   ├── app/
    │   │   ├── api/
    │   │   │   └── adminApi.ts     # API service layer
    │   │   ├── components/
    │   │   │   ├── AdminHeader.tsx
    │   │   │   ├── AdminSidebar.tsx
    │   │   │   └── ui/             # UI components
    │   │   ├── context/
    │   │   │   └── AuthContext.tsx # Auth provider
    │   │   ├── pages/
    │   │   │   ├── AdminDashboard.tsx
    │   │   │   ├── AdminUsers.tsx
    │   │   │   ├── AdminAlerts.tsx
    │   │   │   ├── AdminInsights.tsx
    │   │   │   ├── AdminLogs.tsx
    │   │   │   ├── AdminSettings.tsx
    │   │   │   └── AdminLogin.tsx
    │   │   ├── App.tsx
    │   │   └── main.tsx
    │   ├── styles/
    │   │   └── index.css
    │   └── vite-env.d.ts
    ├── package.json
    ├── vite.config.ts
    └── tailwind.config.js
```

## 🔧 Configuration

### Environment Variables

#### Server (.env)
```
DATABASE_URL=postgresql://admin_user:admin123@localhost:5432/admin_dashboard
SECRET_KEY=your-secret-key-change-in-production
```

#### Client (.env)
```
VITE_API_URL=http://localhost:8000
```

## 🚀 Deployment

### Backend (Production)
```bash
cd admin/server
gunicorn src.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (Production)
```bash
cd admin/client
pnpm build
# Serve the dist folder with nginx or any static server
```

## 📦 Key Dependencies

### Backend
- **FastAPI**: Web framework
- **SQLAlchemy**: ORM
- **PostgreSQL**: Database
- **Pydantic**: Data validation
- **python-jose**: JWT handling
- **passlib**: Password hashing

### Frontend
- **React 18**: UI library
- **Tailwind CSS v4**: Styling
- **TypeScript**: Type safety
- **Radix UI**: Accessible components
- **Recharts**: Charts and graphs
- **Lucide React**: Icons
- **Sonner**: Toast notifications
- **React Hook Form**: Form handling

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

