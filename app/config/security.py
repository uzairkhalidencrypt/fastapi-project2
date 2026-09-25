import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends

# 1. THE ARCHITECTURE CONFIGURATION KEYS
# In production, keep this string completely random and hidden in a .env file!
SECRET_KEY = "SUPER_SECRET_COMPLEX_PASSPHRASE_KEY_DONT_SHARE_THIS"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Token will expire automatically after 1 hour

# 2. FUNCTION: Generates the secure JWT Passport string string


def create_access_token(data: dict):
    to_encode = data.copy()

    # Calculate exact expiration timestamp using modern timezone-aware datetimes
    expire = datetime.now(timezone.utc) + \
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    # Encrypt the package into a signed JWT string
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 3. FUNCTION: Decodes and verifies an incoming client passport token


def verify_access_token(token: str):
    try:
        # Decode the token using our unique server secret key
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Returns the dictionary containing user metadata (id, email)
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid signature authentication token")


# 1. Define the gatekeeper. It tells Swagger UI and FastAPI where to look for tokens.
# It points to our login endpoint so Swagger knows how to authenticate automatically.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# 2. DEPENDENCY FUNCTION: Checks, decrypts, and yields the logged-in user's data


def get_current_user(token: str = Depends(oauth2_scheme)):
    # Automatically pulls the token string from the request header, then passes it to our verifier
    payload = verify_access_token(token)

    # Extract the user identity metadata claims we packed inside during login
    user_id: int = payload.get("user_id")
    email: str = payload.get("email")

    if user_id is None or email is None:
        raise HTTPException(
            status_code=401, detail="Invalid session payload context")

    # Return a clean dictionary of the authenticated user's identity
    return {"user_id": user_id, "email": email}
