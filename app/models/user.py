import datetime
from sqlalchemy import Column, DateTime, Integer, String, Float, Text
from app.config.database import Base
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)     # NEW FIELD
    last_name = Column(String, index=True)      # NEW FIELD
    email = Column(String, unique=True, index=True)
    # NEW FIELD (We store the hash, never plain text!)
    hashed_password = Column(String)
    country = Column(String, index=True)  # NEW FIELD
    orders = relationship("Order", back_populates="user",
                          cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float, index=True)
    stock = Column(Integer, index=True)


class Memo(Base):
    __tablename__ = "memos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)
    # Foreign key hold the id of who wrote it
    owner_id = Column(Integer, ForeignKey("users.id"))


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Float, nullable=False, default=0)
    shipping_address = Column(Text, nullable=False)
    # Pending, Shipped, Delivered
    status = Column(String, nullable=False, default="Pending")
    created_at = Column(DateTime, default=datetime.datetime.now)

    # RELATIONS
    # Connects the master invoice line back to the target User profile
    user = relationship("User", back_populates="orders")

    # Cascade ensures that if an order row drops, all its line-item breakdowns drop too
    items = relationship("OrderItem", back_populates="order",
                         cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    # Preserves purchase price history
    unit_price = Column(Float, nullable=False)

    # --- RELATIONS ---
    # Connects each item breakdown block back to its parent invoice row
    order = relationship("Order", back_populates="items")

    # Connects the item breakdown row to the matching product entity row parameters
    product = relationship("Product")


class TestProducts(Base):
    __tablename__ = "test_products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    title = Column(String, index=True)
    price = Column(Float, index=True)
    quantity = Column(Integer, index=True)
