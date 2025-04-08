from abc import ABC, abstractmethod
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import pandas as pd
import joblib
import os
from datetime import datetime
from pathlib import Path
import sys
from loguru import logger


logger.remove()  # 기본 설정 제거
logger.add(sys.stdout, level="INFO", format="{time} - {level} - {message}")

# 프로젝트 루트 디렉토리 설정
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class SpamClassifier(ABC):
    def __init__(self):
        self.model_types = ['Naive Bayes', 'SVC', 'BERT']

    @abstractmethod 
    def train(self, texts, labels):
        pass
    
    @abstractmethod
    def predict(self, texts):
        pass
    
    @abstractmethod
    def save_model(self, model_name=None):
        pass
    
    @abstractmethod
    def load_model(cls, model_name):
        pass