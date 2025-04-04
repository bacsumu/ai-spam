#import jwt
from jose import JWTError, jwt
import datetime
import pandas as pd

SECRET_KEY = "your_very_secret_key"

# JWT 생성
payload = {
    "user_id": 123,
    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # 만료 시간 1시간
}

token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
print("JWT Token:", token)

# JWT 검증
decoded_payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
print("Decoded Payload:", decoded_payload)


df = pd.read_excel('D:/workspace-ml/ai-spam/backend/learning-data/sample-data.xlsx')
print(df.head())