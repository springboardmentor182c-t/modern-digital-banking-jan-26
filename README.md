# NeoVault – Modern Digital Banking Dashboard

NeoVault is a high-performance, full-stack digital banking platform featuring a comprehensive user dashboard and a robust administrative control center. Built with a focus on modern aesthetics (glassmorphism), security, and real-time data visualization.

> [!NOTE]
> **Project Status**: The application is fully functional and stable. However, there are significant opportunities for further optimization, feature expansion, and UI/UX polishing in future iterations.

## ✨ Features

### 👤 User Portal
- **Financial Intelligence**: Dynamic spending trends and category breakdown powered by real-time transaction data.
- **Smart Alerts**: Contextual notifications for low balances, upcoming bills, and KYC status.
- **Account Management**: Overview of multiple bank accounts with balance tracking.
- **Budgets & Goals**: Category-based budget tracking with visual progress indicators.
- **Rewards**: Integrated loyalty points system.

### 🛡️ Admin Portal
- **User Management**: Centralized directory to monitor all users and their account statuses.
- **KYC Verification**: Dedicated workflow for approving or rejecting user identity verification requests.
- **Audit Logs**: Real-time system-wide log of all administrative actions for security and compliance.
- **Operations Dashboard**: High-level overview of system health, active users, and system performance.

## 🛠️ Tech Stack

**Backend:**
- **FastAPI**: Asynchronous API framework.
- **SQLAlchemy**: Database ORM.
- **PostgreSQL**: Primary relational database.
- **JWT**: Secure authentication.

**Frontend:**
- **React 18 & Vite**: Fast development and building.
- **Tailwind CSS & Shadcn UI**: Modern design system.
- **Lucide React**: Iconography.
- **Recharts**: Data visualization.

## 🚀 Local Setup & Installation

Follow these steps to get the project running on your local machine.

### 1. Repository Reorganization
The project is split into two main directories:
- `/client`: React Frontend.
- `/server`: FastAPI Backend.

### 2. Infrastructure Setup (Docker)
Ensure Docker is installed and run the following in the root directory to start PostgreSQL and Redis:
```bash
docker-compose up -d
```

### 3. Backend (Server) Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Create and activate a Virtual Environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Unix/Mac
   source venv/bin/activate
   ```
3. Install Dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run Migrations & Seed Data:
   ```bash
   alembic upgrade head
   python scripts/seed_admin.py    # Setup Admin account
   python scripts/seed_alerts.py   # Setup demo notifications
   ```
5. Start the Server:
   ```bash
   uvicorn src.main:app --host 127.0.0.1 --port 8000 --reload
   ```

### 4. Frontend (Client) Setup
1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install Dependencies:
   ```bash
   npm install
   ```
3. Start the Development Server:
   ```bash
   npm run dev -- --host 127.0.0.1 --port 5173
   ```

## 🔑 Access Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **User** | `aditya@example.com` | `password123` |
| **Admin** | `admin@neovault.com` | `admin123` |

## 📍 Local URLs
- **User Portal**: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- **Admin Portal**: [http://127.0.0.1:5173/admin/login](http://127.0.0.1:5173/admin/login)
- **API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## 📂 Project Structure Overview
- `client/src/`: Contains React components, hooks, and context.
- `server/src/`: Contains API routes, models, and business logic.
- `server/scripts/`: Maintenance and seeding utilities.
- `.gitignore`: Configured for multi-stack environments.
