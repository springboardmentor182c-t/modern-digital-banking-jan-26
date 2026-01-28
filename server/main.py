from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from server.auth import router as auth_router
from server.src.admin.router import router as admin_dashboard_router

app = FastAPI(title="Modern Digital Banking API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router, prefix="/auth")
app.include_router(admin_dashboard_router)


@app.get("/")
def root():
    return {"status": "Backend is running"}