from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, learning, testing

app = FastAPI(title="AI Spam Detection API")

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