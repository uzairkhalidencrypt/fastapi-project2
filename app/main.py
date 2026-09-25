from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import our database base configuration engine
from app.config.database import engine, Base

# Import our models explicitly so SQLAlchemy knows they exist
from app.models.user import User

# Import our modular controller endpoints router
from app.routers.user import router as user_router

# 1. Instruct SQLAlchemy to inspect our models and build the table grids inside test.db
Base.metadata.create_all(bind=engine)

# 2. Initialize the core FastAPI Application instance
app = FastAPI(
    title="Layered Full-Stack API",
    description="A clean, enterprise-ready architecture utilizing modular routers and ORM models."
)

# 3. Define trusted browser access endpoints (CORS rule mapping)
origins = [
    "http://localhost:3000",  # React Frontend local runtime port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Permits GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],  # Permits all headers
)

# 4. Bind our modular user router endpoints to the system
app.include_router(user_router)

# Basic health-check root route


@app.get("/")
def root_health_check():
    return {"status": "healthy", "architecture": "layered-multi-directory"}
