from pydantic import BaseModel

# 1. SIGN-UP INPUT GATE: What the frontend must send to register an account


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    country: str

# 2. LOGIN INPUT GATE: Clean schema strictly for authenticating sessions


class UserLogin(BaseModel):
    email: str
    password: str

# 3. OUTBOUND DATA RESPONSE GATE: What is safe to send back across the network to React


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    country: str


class Config:
    from_attributes = True


# 4. TOKEN RESPONSE GATE: The structure returned upon successful login
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
