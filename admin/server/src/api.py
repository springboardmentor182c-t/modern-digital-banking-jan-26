from users.controller import router as users_router
from alerts.controller import router as alerts_router
from logs.controller import router as logs_router
from settings.controller import router as settings_router
from dashboard.controller import router as dashboard_router

def register_routes(app):
    app.include_router(users_router)
    app.include_router(alerts_router)
    app.include_router(logs_router)
    app.include_router(settings_router)
    app.include_router(dashboard_router)
