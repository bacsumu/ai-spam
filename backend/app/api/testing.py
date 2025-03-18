from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from typing import List
import os
from pathlib import Path
import pandas as pd
from app.models.ml_models import SpamClassifier
from app.core.auth import verify_token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 프로젝트 루트 디렉토리 설정
BASE_DIR = Path(__file__).resolve().parent.parent.parent

@router.get("/models")
async def list_models(token: str = Depends(oauth2_scheme)):
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")
        
    model_dir = BASE_DIR / "ml-model"
    models = []
    if model_dir.exists():
        models = [f.name for f in model_dir.iterdir()]
    return {"models": models}

@router.post("/predict-text")
async def predict_text(model_name: str, text: str, token: str = Depends(oauth2_scheme)):
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")
        
    try:
        model = SpamClassifier.load_model(model_name)
        prediction = model.predict([text])[0]
        return {
            "text": text,
            "is_spam": bool(prediction)
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Model not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict-file")
async def predict_file(
    model_name: str,
    file: UploadFile = File(...),
    token: str = Depends(oauth2_scheme)
):
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")
        
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    try:
        content = await file.read()
        df = pd.read_csv(pd.io.common.BytesIO(content))
        
        if 'text' not in df.columns:
            raise HTTPException(status_code=400, detail="File must contain 'text' column")
        
        model = SpamClassifier.load_model(model_name)
        predictions = model.predict(df['text'].tolist())
        
        results = []
        for i, (_, row) in enumerate(df.iterrows()):
            results.append({
                "text": row['text'],
                "is_spam": bool(predictions[i])
            })
        
        return {"results": results}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Model not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 