# 🚀 NeoVault Quick Start Guide

This guide provides the necessary commands to run the NeoVault application after the initial setup is complete.

---

## 1. Start Infrastructure
Ensure Docker is running and start the backend services (PostgreSQL, Redis):
```bash
docker-compose up -d
```

## 2. Start Backend (API)
Navigate to the `server/` directory and run:

```bash
# Activate Virtual Environment (Windows)
venv\Scripts\activate

# Start uvicorn server
uvicorn src.main:app --host 127.0.0.1 --port 8000 --reload
```

## 3. Start Frontend (Web App)
Navigate to the `client/` directory and run:

```bash
# Start Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```

---

## 🔑 Access Details
- **User Portal**: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- **Admin Portal**: [http://127.0.0.1:5173/admin/login](http://127.0.0.1:5173/admin/login)

### Demo Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **User** | `aditya@example.com` | `password123` |
| **Admin** | `admin@neovault.com` | `admin123` |

> [!NOTE]
> For first-time setup, migrations, or database seeding, please refer to the main [README.md](./README.md).
