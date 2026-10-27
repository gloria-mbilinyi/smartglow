from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.api.api import api_router
from app.initial_data import init_db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smartglow.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist and initialize seed catalog
    logger.info("Initializing SmartGlow database schema...")
    try:
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            init_db(db)
        logger.info("SmartGlow database schema and seed data ready.")
    except Exception as e:
        logger.error(f"Database initialization note: {e}")
    yield
    # Shutdown
    logger.info("Shutting down SmartGlow API...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent cosmetics e-commerce, dermatological catalog, and orders REST API for SmartGlow.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    lifespan=lifespan,
)

# CORS configuration for Web and Mobile clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "status": "online",
        "docs": f"{settings.API_V1_PREFIX}/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "environment": settings.ENVIRONMENT}
