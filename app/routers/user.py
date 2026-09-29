from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config.database import SessionLocal
from app.models.user import User, Product, Memo
from app.schemas.user import ProductResponse, ProductCreate, Productview, UserCreate, UserLogin, UserResponse, MemoCreate, MemoResponse
# Import your token generation tool
from app.config.security import create_access_token
from app.schemas.user import TokenResponse  # Import your new schema
from app.config.security import get_current_user
from fastapi.security import OAuth2PasswordRequestForm

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
# @router.post("/login", response_model=TokenResponse)
# def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
#     db_user = db.query(User).filter(User.email == login_data.email).first()

#     if not db_user or db_user.hashed_password != login_data.password:
#         raise HTTPException(
#             status_code=400, detail="Invalid email or password")

#     #  GENERATE THE PASSPORT PAYLOAD DATA:
#     # Pack up the public claims metadata we want our token string to carry
#     token_payload = {"user_id": db_user.id, "email": db_user.email}
#     jwt_token = create_access_token(data=token_payload)

#     # Return the verified TokenResponse structure cleanly to the client network
#     return {
#         "access_token": jwt_token,
#         "token_type": "bearer",
#         "user": db_user
#     }

@router.post("/login", response_model=TokenResponse)
def login_user(
    #  Swaps JSON parsing for Form Data parsing
    login_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # OAuth2PasswordRequestForm changes .email property to .username natively
    db_user = db.query(User).filter(User.email == login_data.username).first()

    if not db_user or db_user.hashed_password != login_data.password:
        raise HTTPException(
            status_code=400, detail="Invalid email or password")

    token_payload = {"user_id": db_user.id, "email": db_user.email}
    jwt_token = create_access_token(data=token_payload)

    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "user": db_user
    }


# DIAGNOSTIC: VIEW ALL REGISTERED ACCOUNTS (GET)


# @router.get("/profiles", response_model=list[UserResponse])
# def view_all_saved_profiles(db: Session = Depends(get_db)):
#     # This reaches directly into test.db and extracts every single user row
#     return db.query(User).all()

# 2. UPDATE YOUR GET PROFILES ROUTE:
@router.get("/profiles", response_model=list[UserResponse])
def view_all_saved_profiles(
    db: Session = Depends(get_db),
    #  NEW SECURITY LOCK INJECTED!
    current_user: dict = Depends(get_current_user)
):
    # This print line is a great diagnostic tool—it will display who is accessing your tables in the terminal!
    print(
        f"[Security Gate] Authorized access granted to logged-in user: {current_user['email']}")

    return db.query(User).all()


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    new_product = Product(
        name=product.name,
        price=product.price,
        stock=product.stock
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@router.get("/productview", response_model=list[ProductResponse], status_code=status.HTTP_200_OK)
def view_all_products(db: Session = Depends(get_db)):
    # fetching
    products = db.query(Product).all()
    return products


# product search endpoint
@router.get("/products/search", response_model=list[ProductResponse])
def search_product(name: str, db: Session = Depends(get_db)):
    """
    Search for products by name using a URL Query Parameter.
    Example: http://localhost:8000/auth/products/search?name=Keyboard
    """
    # Looks for any product name containing the search string (case-insensitive)
    products = db.query(Product).filter(Product.name.ilike(f"%{name}%")).all()
    return products

# product deletion endpoint


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Products"])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return None


@router.post("/memos", response_model=MemoResponse, status_code=status.HTTP_201_CREATED)
def create_memo(memo_data: MemoCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    logged_in_user_id = current_user.get("user_id")
    new_memo = Memo(
        title=memo_data.title,
        content=memo_data.content,
        owner_id=logged_in_user_id
    )
    db.add(new_memo)
    db.commit()
    db.refresh(new_memo)
    return new_memo

# view only


@router.get("/memos", response_model=list[MemoResponse])
def view_memo(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):  # Token valodatio guard
    logged_in_user_id = current_user.get("user_id")
    # fetch notes belonging to this specific user ID
    personal_notes = db.query(Memo).filter(
        Memo.owner_id == logged_in_user_id).all()

    return personal_notes

# memo deletion endpoint


@router.delete("/memos/{memo_id}")
def delete_my_memo(memo_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    logged_in_user_id = current_user.get("user_id")

    # Find the memo row
    db_memo = db.query(Memo).filter(Memo.id == memo_id).first()
    if not db_memo:
        raise HTTPException(status_code=404, detail="Memo not found")

    # 🛡️ THE SECURITY ISOLATION LOCK: Prevent users from deleting someone else's notes!
    if db_memo.owner_id != logged_in_user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this memo")

    db.delete(db_memo)
    db.commit()
    return {"status": "Success", "message": f"Memo ID {memo_id} successfully deleted."}
