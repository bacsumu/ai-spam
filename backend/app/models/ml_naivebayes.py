from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import pandas as pd
import joblib
import os
from datetime import datetime
from pathlib import Path
import sys
from backend.app.models.ml_models import SpamClassifier
from loguru import logger

class SpamNaiveBayesClassifier(SpamClassifier):
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.classifier = MultinomialNB()
        
    def train(self, texts, labels):
        X = self.vectorizer.fit_transform(texts)
        self.classifier.fit(X, labels)
        
    def predict(self, texts):
        X = self.vectorizer.transform(texts)
        return self.classifier.predict(X)
    
    def save_model(self, model_name=None):
        if model_name is None:
            model_name = datetime.now().strftime("%Y%m%d-%H%M%S")
        
        model_dir = BASE_DIR / "ml-model"
        model_dir.mkdir(exist_ok=True)
        model_path = model_dir / model_name
        
        joblib.dump({
            'vectorizer': self.vectorizer,
            'classifier': self.classifier
        }, model_path)
        
        return model_name
    
    @classmethod
    def load_model(cls, model_name):
        model_path = BASE_DIR / "ml-model" / model_name
        if not model_path.exists():
            raise FileNotFoundError(f"Model {model_name} not found")
        
        model = cls()
        saved_model = joblib.load(model_path)
        model.vectorizer = saved_model['vectorizer']
        model.classifier = saved_model['classifier']
        
        return model 