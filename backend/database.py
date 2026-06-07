import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.config import DATABASE_URL, IS_SQLITE, BASE_DIR

# SQLAlchemy Engine setup with remote database connectivity check & SQLite fallback
connect_args = {}
engine = None

try:
    if DATABASE_URL and not DATABASE_URL.startswith("sqlite"):
        # Create engine with a short connection timeout to fail fast if DB is offline
        connect_args_pg = {"connect_timeout": 3}
        test_engine = create_engine(DATABASE_URL, connect_args=connect_args_pg)
        # Test connection actively
        with test_engine.connect() as conn:
            pass
        engine = test_engine
        IS_SQLITE = False
        print(f"Database: Successfully connected to remote database: {DATABASE_URL.split('@')[-1]}")
    else:
        raise ValueError("No postgres database configured, using SQLite fallback.")
except Exception as e:
    db_path = os.path.join(BASE_DIR, "trader.db")
    DATABASE_URL = f"sqlite:///{db_path}"
    IS_SQLITE = True
    connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
    print(f"Database: PostgreSQL connection failed or not configured ({e}). Falling back to local SQLite: trader.db")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get db session in FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

