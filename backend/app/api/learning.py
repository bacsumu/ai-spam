from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from typing import List
import pandas as pd
import os
import sys
from loguru import logger
from pathlib import Path
from app.models.ml_models import SpamClassifier
from app.core.auth import verify_token
from pydantic import BaseModel

logger.remove()  # 기본 설정 제거
logger.add(sys.stdout, level="INFO", format="{time} - {level} - {message}")

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# 프로젝트 루트 디렉토리 설정
BASE_DIR = Path(__file__).resolve().parent.parent.parent

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), token: str = Depends(oauth2_scheme)):
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")
        
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Only XLSX files are allowed")
    
    learning_data_dir = BASE_DIR / "learning-data"
    learning_data_dir.mkdir(exist_ok=True)
    file_path = learning_data_dir / file.filename
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    return {"filename": file.filename}

@router.get("/files")
async def list_files(token: str = Depends(oauth2_scheme)):
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")
        
    learning_data_dir = BASE_DIR / "learning-data"
    files = []
    if learning_data_dir.exists():
        files = [f.name for f in learning_data_dir.glob("*.xlsx")]
    
    logger.info(f"files : {files}")

    return {"files": files}

@router.get("/data/{filename}")
async def get_file_data(filename: str, page: int = 1, size: int = 50, token: str = Depends(oauth2_scheme)):
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")
        
    file_path = BASE_DIR / "learning-data" / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        logger.info(f"excel file_path : {file_path}")
        df = pd.read_excel(file_path)
        total = len(df)
        start = (page - 1) * size
        end = start + size
        # 컬럼 이름 강제로 지정
        df.columns = ['text', 'label']
        data = df.iloc[start:end].to_dict('records')
        return {
            "total": total,
            "page": page,
            "size": size,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class FileListRequest(BaseModel):
    filenames: List[str]

@router.post("/deleteFiles")
async def delete_files(filenames: FileListRequest, token: str = Depends(oauth2_scheme)):
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    logger.info(f"delete_files filenames : {filenames}")

    for filename in filenames.filenames:
        file_path = BASE_DIR / "learning-data" / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"파일 {filename}을 찾을 수 없습니다")
            
        try:
            file_path.unlink()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"파일 {filename} 삭제 중 오류 발생: {str(e)}")
            
    return {"message": "파일이 성공적으로 삭제되었습니다"}


@router.post("/train")
async def train_model(filenames: FileListRequest, token: str = Depends(oauth2_scheme)):
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")
        
    texts = []
    labels = []
    
    logger.info(f"train_model filenames : {filenames}")

    for filename in filenames.filenames:
        file_path = BASE_DIR / "learning-data" / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"File {filename} not found")
        
        try:
            df = pd.read_excel(file_path)
            if 'text' not in df.columns or 'label' not in df.columns:
                raise HTTPException(status_code=400, detail=f"File {filename} must contain 'text' and 'label' columns")
            
            texts.extend(df['text'].tolist())
            labels.extend(df['label'].tolist())
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    if not texts:
        raise HTTPException(status_code=400, detail="No data to train")
    
    try:
        model = SpamClassifier()
        model.train(texts, labels)
        model_name = model.save_model()
        return {"model_name": model_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 