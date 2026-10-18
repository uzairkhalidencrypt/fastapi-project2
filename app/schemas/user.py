from pydantic import BaseModel, Field
from datetime import datetime
from typing import List

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


class ProductCreate(BaseModel):
    name: str
    price: float
    stock: int


class Productview(BaseModel):
    name: str


class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    stock: int

    class Config:
        from_attributes = True


# 4. TOKEN RESPONSE GATE: The structure returned upon successful login
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

    class Config:
        from_attributes = True


class MemoCreate(BaseModel):
    title: str
    content: str


class MemoResponse(BaseModel):
    id: int
    title: str
    content: str
    owner_id: int

    class Config:
        from_attributes = True

# Validates each individual item sent inside the customer's cart


class CartItemIn(BaseModel):
    product_id: int = Field(description=" ID of the purchased product")
    quantity: int = Field(gt=0, description="Quantity must be greater than 0")

# Validates the core checkout payload structure


class OrderCreateIn(BaseModel):
    shipping_address: str = Field(
        min_length=5, description="shipping address required")
    cart_item: list[CartItemIn] = Field(
        min_length=1, description="cart cannot be empty")

#  Formats the line-item response data sent back to the UI


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    # Allows Pydantic to read SQLAlchemy

    class Config:
        from_attributes = True

 # Formats the master order response data sent back to the customer profile view


class OrderOut(BaseModel):
    id: int
    user_id: int
    total_amount: float
    shipping_address: str
    status: str
    created_at: datetime
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True
