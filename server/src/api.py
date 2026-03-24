from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.core import Base, engine

# Import all routers
from .users.controller import router as users_router
from .alerts.controller import router as alerts_router
from .logs.controller import router as logs_router
from .settings.controller import router as settings_router
from .dashboard.controller import router as dashboard_router
from .auth.controller import router as auth_router

# Try to create database tables, but don't fail if database is not available
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not connect to database. Some features may be limited. Error: {e}")

# Initialize FastAPI app
app = FastAPI(
    title="Digital Banking Admin API",
    description="Admin Dashboard API for Digital Banking System",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(alerts_router)
app.include_router(logs_router)
app.include_router(settings_router)
app.include_router(dashboard_router)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Digital Banking Admin API is running"}

@app.get("/")
async def root():
    return {
        "name": "Digital Banking Admin API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

