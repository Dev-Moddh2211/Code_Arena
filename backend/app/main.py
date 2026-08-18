import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, SessionLocal, Base
import app.models # Register all models with Base
from app.services.seed_demo_data import seed_database

# Import routers
from app.routers.auth import router as auth_router
from app.routers.problems import router as problems_router
from app.routers.submissions import router as submissions_router
from app.routers.dashboard import router as dashboard_router
from app.routers.sheets import router as sheets_router
from app.routers.daily_challenge import router as daily_challenge_router
from app.routers.leaderboard import router as leaderboard_router
from app.routers.admin import router as admin_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("code_arena")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    
    if settings.SEED_DEMO_DATA:
        logger.info("Seeding demo and sample data...")
        db = SessionLocal()
        try:
            seed_database(db)
            logger.info("Demo data seeding completed successfully.")
        except Exception as e:
            logger.error(f"Error seeding demo data: {e}", exc_info=True)
            db.rollback()
        finally:
            db.close()
    
    yield
    # Shutdown
    logger.info("Code Arena application shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Code Arena v2 - Production-grade coding workspace, judge platform, and contest CMS.",
    lifespan=lifespan
)

# Configure CORS
origins = settings.cors_origins_list
if "*" in origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register API Routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(problems_router, prefix="/api")
app.include_router(submissions_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(sheets_router, prefix="/api")
app.include_router(daily_challenge_router, prefix="/api")
app.include_router(leaderboard_router, prefix="/api")
app.include_router(admin_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to Code Arena API",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
