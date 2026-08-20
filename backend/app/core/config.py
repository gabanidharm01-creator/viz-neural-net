import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "NeuroVision Lab Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # CORS & Server
    FRONTEND_URL: str = "http://localhost:5173"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # LLM Settings
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gemini-1.5-flash"
    LLM_PROVIDER: str = "gemini"
    
    # Upload & Temp Storage
    MAX_UPLOAD_SIZE_MB: int = 50
    TEMP_DIR: Path = Path(__file__).resolve().parent.parent.parent / "temp_uploads"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure temp directory exists
settings.TEMP_DIR.mkdir(parents=True, exist_ok=True)
