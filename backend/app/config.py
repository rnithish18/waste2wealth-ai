import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Waste2Wealth AI Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "waste2wealth_secret_key_msme_hackathon_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./waste2wealth.db")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

settings = Settings()
