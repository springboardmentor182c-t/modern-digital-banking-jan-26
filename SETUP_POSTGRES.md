# Setting up PostgreSQL for NeoVault on Windows

The application is configured to use a local PostgreSQL database. Follow these steps to install and configure it.

## 1. Install PostgreSQL
1.  Download the **PostgreSQL Installer** for Windows from [postgresql.org](https://www.postgresql.org/download/windows/).
2.  Run the installer:
    -   Keep default components (Server, pgAdmin, Command Line Tools).
    -   **Important**: When asked for a password for the `postgres` superuser, enter `password` (or remember what you set and update `server/src/config.py`).
    -   Keep default port `5432`.

## 2. Verify Installation
Open a new PowerShell window and run:
```powershell
psql --version
```
If not found, add `C:\Program Files\PostgreSQL\15\bin` to your system PATH.

## 3. Create Database
Open `pgAdmin` (installed with Postgres) or use command line:
```powershell
# Login as postgres user
psql -U postgres
# Enter password when prompted

# Create database
CREATE DATABASE neovault;
\q
```

## 4. Run Application
Once Postgres is running:
1.  Verify `server/src/config.py` matches your setup:
    ```python
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/neovault"
    ```
2.  Run migrations:
    ```bash
    cd server
    venv\Scripts\activate
    alembic upgrade head
    ```
3.  Seed data:
    ```bash
    python seed_data_sync.py
    ```
4.  Start server:
    ```bash
    uvicorn src.main:app --reload
    ```
