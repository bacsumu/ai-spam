from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import json
import os
from pathlib import Path
from ..config import settings
from pydantic import BaseModel
from typing import Optional

# 프로젝트 루트 디렉토리 설정
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# JWT 설정
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"payload : {payload}")
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None

def load_users():
    users_file = BASE_DIR / "users" / "auth.dat"
    if not users_file.exists():
        return {}
    try:
        with open(users_file, "r") as f:
            return json.load(f)
    except:
        return {}

def save_users(users: dict):
    users_dir = BASE_DIR / "users"
    users_dir.mkdir(exist_ok=True)
    users_file = users_dir / "auth.dat"
    with open(users_file, "w") as f:
        json.dump(users, f) 

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None 