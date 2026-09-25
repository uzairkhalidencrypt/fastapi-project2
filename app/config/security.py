import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status

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
