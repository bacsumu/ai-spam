import logging
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, learning, testing
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from loguru import logger
import traceback
import sys

logger.remove()  # 기본 설정 제거
logger.add(sys.stdout, level="INFO", format="{time} - {level} - {message}")

app = FastAPI(title="AI Spam Detection API")
router = APIRouter()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(learning.router, prefix="/api/learning", tags=["Learning"])
app.include_router(testing.router, prefix="/api/testing", tags=["Testing"])

@app.get("/")
async def root():
    return {"message": "AI Spam Detection API"} 

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # 에러 로그 출력
    logger.error(f"🚨 예외 발생! URL: {request.url}")
    logger.error(f"▶️ 예외 메시지: {str(exc)}")
    logger.error(f"🧵 Traceback:\n{traceback.format_exc()}")

    return JSONResponse(
        status_code=500,
        content={"detail": "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요."},
    )
