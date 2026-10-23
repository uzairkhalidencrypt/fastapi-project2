import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
import logging
from fastapi import Request
# Import our database base configuration engine
from app.config.database import engine, Base
# Import our models explicitly so SQLAlchemy knows they exist
from app.models.user import User
# Import our modular controller endpoints router
from app.routers.user import router as user_router
#  Import your independent router sub-modules
from app.routers import user, order

# Set up clean terminal logging patterns
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("EcomereceApp")

# 1. Instruct SQLAlchemy to inspect our models and build the table grids inside test.db
Base.metadata.create_all(bind=engine)

# 2. Initialize the core FastAPI Application instance
app = FastAPI(
    title="Asynchronous E-Commerce Engine",
    description="A clean, enterprise-ready architecture utilizing modular routers and ORM models."
)

# 3. Define trusted browser access endpoints (CORS rule mapping)
origins = [
    "http://localhost:3000",  # React Frontend local runtime port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Only allow requests from your React app
    allow_credentials=True,  # Allow cookies and authentication tokens
    allow_methods=["*"],  # Permits GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],  # Permits all headers
)
# THE CUSTOM LOGGING & PERFORMANCE MIDDLEWARE


@app.middleware("http")
async def process_timer_and_logger(request: Request, call_next):
    """
    Intercepts all incoming requests, clocks processing speed, 
    and logs critical incoming headers for debugging.
    """
    start_time = time.time()

    # 🔍 1. DEBUG ON THE WAY IN: Check what React is sending
    logger.info("=================== MIDDLEWARE TRACE ===================")
    logger.info(f"Incoming Route Call: {request.method} {request.url.path}")

    # Extract the exact Authorization header from the React fetch call
    # HTTP headers are case-insensitive
    auth_header = request.headers.get("authorization")
    logger.info(f"Authorization Header Received: {auth_header}")
    logger.info("========================================================")

    # Let the request proceed to its designated route handler (/orders/cart)
    response = await call_next(request)

    # Calculate execution speeds
    execution_duration = time.time() - start_time
    response.headers["X-Backend-Execution-Time"] = f"{execution_duration:.4f}s"

    # Clean logging output pattern visible in terminal console on exit
    logger.info(
        f"Exit Route: {request.method} {request.url.path} | "
        f"Status: {response.status_code} | "
        f"Time Elapse: {execution_duration:.4f}s"
    )
    return response


# 4. Bind our modular user router endpoints to the system
# Change this line in main.py:
app.include_router(user_router, prefix="/auth", tags=["Authentication"])
app.include_router(user.router, prefix="/products", tags=["Products"])
app.include_router(order.router, prefix="/orders", tags=["Orders"])

# Basic health-check root route


@app.get("/health")
def advanced_system_health():
    return {
        "status": "online",
        "runtime_environment": f"Python {sys.version.split()[0]}",
        "database_engine": "SQLite 3",
        "architecture_framework": "Layered Multi-Directory REST API",
        "active_modules": ["Authentication", "Product Inventory", "Isolated Private Memos"]
    }
