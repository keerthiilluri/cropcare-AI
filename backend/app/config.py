import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings:
    PROJECT_NAME: str = "CropCare AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    BASE_DIR: Path = BASE_DIR

    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cropcare_super_secret_jwt_key_2026_secure_farm_token")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'cropcare.db'}")
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    
    # AI Model paths
    MODEL_PATH: Path = BASE_DIR.parent / "ai_model" / "crop_disease_model.onnx"
    LABELS_PATH: Path = BASE_DIR.parent / "ai_model" / "labels.json"
    
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.55"))
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
