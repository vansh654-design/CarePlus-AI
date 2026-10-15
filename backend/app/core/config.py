"""Application configuration settings."""

from pydantic import BaseModel


class Settings(BaseModel):
    APP_NAME: str = "CarePulse AI"
    APP_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DESCRIPTION: str = (
        "Explainable Patient Monitoring & Early-Warning Assistant "
        "(Educational Healthcare AI Demonstration)"
    )
    DEMONSTRATION_MODE: bool = True
    SYNTHETIC_DATA_ONLY: bool = True
    MAX_REQUEST_BODY_BYTES: int = 256 * 1024  # 256 KB max payload
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8008",
        "http://127.0.0.1:8008",
    ]


settings = Settings()
