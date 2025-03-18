# AI Spam Detection System

AI 학습과 테스트를 위한 관리 페이지입니다.

## 프로젝트 구조

```
.
├── backend/                # Python FastAPI 백엔드
│   ├── app/               # 애플리케이션 코드
│   ├── learning-data/     # 학습 데이터 저장소
│   ├── ml-model/         # 학습된 모델 저장소
│   └── users/            # 사용자 인증 데이터
└── frontend/             # Next.js 프론트엔드
```

## 시작하기

### 백엔드 설정

1. Python 가상환경 생성 및 활성화:
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows
# source venv/bin/activate   # Linux/Mac
```

2. 의존성 설치:
```bash
pip install -r requirements.txt
```

3. 서버 실행:
```bash
uvicorn app.main:app --reload
```

### 프론트엔드 설정

1. 의존성 설치:
```bash
cd frontend
npm install
```

2. 개발 서버 실행:
```bash
npm run dev
```

## 기능

### 학습
- 학습 파일 업로드 및 관리
- 파일 데이터 페이징 조회
- 선택한 파일로 모델 학습

### 테스트
- 학습된 모델 선택
- 텍스트 입력으로 스팸 여부 테스트
- CSV 파일 업로드로 일괄 테스트

## API 문서

백엔드 서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc