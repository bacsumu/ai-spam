from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "your_very_secret_key"  # 실제 운영 환경에서는 환경 변수에서 가져와야 합니다
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 600

settings = Settings() 