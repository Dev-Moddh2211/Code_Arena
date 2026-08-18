import json
from typing import Any, List
from sqlalchemy import create_engine, TypeDecorator, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Determine connect args
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    future=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Type Decorator for portable String List (works in SQLite as JSON-serialized text, and Postgres)
class StringListType(TypeDecorator):
    """Platform-independent String List type. Stored as JSON string in SQLite, handled cleanly."""
    impl = Text
    cache_ok = True

    def process_bind_param(self, value: Any, dialect) -> Any:
        if value is None:
            return "[]"
        if isinstance(value, list):
            return json.dumps(value)
        return str(value)

    def process_result_value(self, value: Any, dialect) -> List[str]:
        if value is None or value == "":
            return []
        if isinstance(value, list):
            return value
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, list) else [str(parsed)]
        except Exception:
            return []

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
