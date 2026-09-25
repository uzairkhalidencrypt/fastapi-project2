from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. authoritative SQLite connection path string
DATABASE_URL = "sqlite:///./test.db"

# 2.  'check_same_thread'
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# 3. Session factory binding
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Declarative mirror base class
Base = declarative_base()
