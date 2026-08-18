import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore"
    )

    PROJECT_NAME: str = "Code Arena"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./arena.db")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "arena_super_secret_jwt_key_change_in_production_987654321")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,*")
    
    JUDGE_DEFAULT_TIMEOUT_MS: int = int(os.getenv("JUDGE_DEFAULT_TIMEOUT_MS", "2000"))
    JUDGE_DEFAULT_MEMORY_MB: int = int(os.getenv("JUDGE_DEFAULT_MEMORY_MB", "256"))
    
    ADMIN_SEED_EMAIL: str = os.getenv("ADMIN_SEED_EMAIL", "admin@codearena.dev")
    ADMIN_SEED_PASSWORD: str = os.getenv("ADMIN_SEED_PASSWORD", "AdminPass123!")
    SEED_DEMO_DATA: bool = os.getenv("SEED_DEMO_DATA", "true").lower() in ("true", "1", "yes")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
