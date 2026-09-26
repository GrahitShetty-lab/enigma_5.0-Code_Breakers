import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    SECRET_KEY: str = "super_secret_key_for_hackathon" # Fallback if not in env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # DB settings
    DATABASE_URL: str = ""
    USE_SQLITE: bool = True
    SQLITE_URL: str = "sqlite:///./aasra.db"
    
    # Storage
    UPLOAD_DIR: str = "uploads/"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

def get_settings() -> Settings:
    return Settings()
