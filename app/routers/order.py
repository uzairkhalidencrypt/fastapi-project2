from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.models.user import User, Product, Order, OrderItem
from app.schemas.user import OrderCreateIn, OrderOut
from app.config.security import get_current_user
from fastapi.security import OAuth2PasswordBearer
# 🚨 IMPORT YOUR EXISTING VERIFIER STREAM FROM YOUR SECURITY FILE
from app.config.security import verify_access_token

router = APIRouter()

# Declare a clean, local token extractor scheme bound to your master route
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


@router.post("/cart", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def checkout_cart(
    payload: OrderCreateIn,
    db: Session = Depends(get_db),
    # 1. Capture the raw string token directly from the Authorization Bearer header line
    token: str = Depends(oauth2_scheme)
):
    """
    Validates a user shopping cart, verifies inventory stock, 
    calculates transaction totals, and commits rows to orders & order_items.
    """
    # ========================================================
    # 🚀 SURGICAL AUTH EXTRACTION (Bypasses dependency conflicts!)
    # ========================================================
    try:
        # Use the exact verifier method from your security.py file
        current_user = verify_access_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session passport signature validation failed."
        )

    user_id = current_user.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload context parameters."
        )

    # ========================================================

    total_bill = 0
    items_to_save = []

    # 1. Loop through each item to verify pricing and stock levels completely
    for item in payload.cart_item:
        product = db.query(Product).filter(
            Product.id == item.product_id).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID #{item.product_id} does not exist."
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.stock}, Requested: {item.quantity}"
            )

        # Calculate line price and update running total
        line_price = product.price * item.quantity
        total_bill += line_price

        # Lower the physical store inventory parameters
        product.stock -= item.quantity

        # Stage the item object (do not save it yet)
        order_item = OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.price
        )
        items_to_save.append(order_item)

    # 2. Create a SINGLE master order record for the entire cart
    new_order = Order(
        user_id=user_id,  # Clean string variable lookup directly from unpacked payload dictionary
        total_amount=total_bill,
        shipping_address=payload.shipping_address,
        status="Pending"
    )
    db.add(new_order)
    db.flush()  # Generates the new_order.id temporarily so we can link items to it

    # 3. Bind all validated staged items to the single master order ID
    for order_item in items_to_save:
        order_item.order_id = new_order.id
        db.add(order_item)

    # 4. Save everything together safely inside your database tables
    db.commit()
    db.refresh(new_order)

    return new_order


@router.get("/", response_model=List[OrderOut])
def get_order_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns only the past historical orders belonging specifically to the logged in customer
    """
    orders = db.query(Order).filter(Order.user_id == current_user.id).all()
    return orders
