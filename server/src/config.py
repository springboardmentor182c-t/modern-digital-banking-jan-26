from pydantic_settings import BaseSettings


class Settings(BaseSettings):
<<<<<<< Updated upstream
    # DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/neovault"
    DATABASE_URL: str = "sqlite+aiosqlite:///./neovault.db"
    
=======
    DATABASE_URL: str = "postgresql+asyncpg://postgres:Sahuva%402004@localhost:5432/neovault"
>>>>>>> Stashed changes
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    REDIS_URL: str = "redis://localhost:6379/0"
    GEMINI_API_KEY: str | None = None

    class Config:
        env_file = ".env"


settings = Settings()
