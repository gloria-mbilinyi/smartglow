# SmartGlow Backend (FastAPI + PostgreSQL)

The SmartGlow backend is a high-performance Python asynchronous REST API built with FastAPI, SQLAlchemy 2.0, and Pydantic v2.

## Structure
```
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── auth.py
│   │   │   ├── products.py
│   │   │   ├── categories.py
│   │   │   ├── orders.py
│   │   │   └── skin_analysis.py
│   │   └── api.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   ├── db/
│   │   ├── session.py
│   │   └── base.py
│   ├── models/
│   ├── schemas/
│   └── main.py
├── tests/
├── alembic/
├── requirements.txt
└── README.md
```

## Running the API
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Interactive OpenAPI documentation will be accessible at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
