# IPPL4Y Backend Server

## Kurulum

1. Python bağımlılıklarını yükleyin:
```bash
pip install -r requirements.txt
```

2. `.env` dosyası oluşturun:
```bash
copy .env.example .env
```

3. `.env` dosyasını düzenleyin ve MongoDB bağlantı bilgilerinizi girin:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=ippl4y
CORS_ORIGINS=http://localhost:3000
```

## Backend'i Başlatma

### Windows:
```bash
start_backend.bat
```

### Linux/Mac:
```bash
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

## Gereksinimler

- Python 3.8+
- MongoDB (yerel veya uzak)
- Tüm bağımlılıklar (`requirements.txt`)

## API Endpoints

Backend başlatıldıktan sonra şu adreste erişilebilir:
- API: http://localhost:8000/api
- Docs: http://localhost:8000/docs



