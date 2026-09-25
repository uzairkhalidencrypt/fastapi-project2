from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
# Import your token generation tool
from app.config.security import create_access_token
from app.schemas.user import TokenResponse  # Import your new schema

router = APIRouter(
    prefix="/auth",  # Grouping our authentication endpoints together
    tags=["Authentication"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. SIGN-UP ENDPOINT (Updated POST Route)


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if a user account already occupies that email string address
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Pack up all your new model attributes cleanly
    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        hashed_password=user.password,  # Storing password payload text directly
        country=user.country
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# 2. LOGIN ENDPOINT (Brand-New POST Route)


# @router.post("/login")
# def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
#     # Look up the row dataset by unique email index
#     db_user = db.query(User).filter(User.email == login_data.email).first()

#     # Validation Check 1: Does the user account exist?
#     if not db_user:
#         raise HTTPException(
#             status_code=400, detail="Invalid email or password")

#     # Validation Check 2: Does the plain text password string match?
#     if db_user.hashed_password != login_data.password:
#         raise HTTPException(
#             status_code=400, detail="Invalid email or password")

#     # Return a clean session confirmation payload back to the client app
#     return {
#         "message": "Login successful!",
#         "session_user": {
#             "id": db_user.id,
#             "first_name": db_user.first_name,
#             "last_name": db_user.last_name,
#             "email": db_user.email
#         }
#     }
# Update your POST /login route:
# <- Bind our new token validation model
@router.post("/login", response_model=TokenResponse)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == login_data.email).first()

    if not db_user or db_user.hashed_password != login_data.password:
        raise HTTPException(
            status_code=400, detail="Invalid email or password")

    #  GENERATE THE PASSPORT PAYLOAD DATA:
    # Pack up the public claims metadata we want our token string to carry
    token_payload = {"user_id": db_user.id, "email": db_user.email}
    jwt_token = create_access_token(data=token_payload)

    # Return the verified TokenResponse structure cleanly to the client network
    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "user": db_user
    }


# DIAGNOSTIC: VIEW ALL REGISTERED ACCOUNTS (GET)


@router.get("/profiles", response_model=list[UserResponse])
def view_all_saved_profiles(db: Session = Depends(get_db)):
    # This reaches directly into test.db and extracts every single user row
    return db.query(User).all()
