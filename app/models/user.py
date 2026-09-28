from sqlalchemy import Column, Integer, String, Float
from app.config.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)     # NEW FIELD
    last_name = Column(String, index=True)      # NEW FIELD
    email = Column(String, unique=True, index=True)
    # NEW FIELD (We store the hash, never plain text!)
    hashed_password = Column(String)
    country = Column(String, index=True)  # NEW FIELD


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float, index=True)
    stock = Column(Integer, index=True)
