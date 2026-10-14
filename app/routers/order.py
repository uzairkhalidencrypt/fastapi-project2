from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
# Targets your unified models file
from app.models.user import User, Product, Order, OrderItem
from app.schemas.user import OrderCreateIn, OrderOut       # Your step 2 schemas
from app.config.security import get_current_user
from app.config.database import SessionLocal

router = APIRouter()


# Checkout shopping cart payload
@router.post("/cart", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def checkout_cart(
    payload: OrderCreateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
   Validates a user shopping cart, verifies inventory stock, 
   calculates transaction totals, and commits rows to orders & order_items.
   """
    total_bill = 0
    items_to_save = []

#  Loop through each item sent from the React cart to verify pricing and stock

    for item in payload.cart_items:
        product = db.query(Product).filter(
            Product.id == item.product_id).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"product with ID #{item.product_id} does not exist."
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.stock}, Requested: {item.quantity} "
            )
            # Calculate this specific line item cost
        line_price = product.price * item.quantity
        total_bill += line_price

        # Lower the physical store inventory quantity parameters
        product.stock -= item.quantity

        # Create the temporary item object block (we save them all after verifying the entire cart)
        order_item = OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.price   # Preserves historical purchase price
        )
        items_to_save.append(order_item)

        # Create the master order invoice record
        new_order = Order(
            user_id=current_user.id,
            total_amount=total_bill,
            shipping_address=payload.shipping_address,
            status="Pending"
        )

        db.add(new_order)
        db.flush()  # Flushes record to generate new_order.id temporarily before saving completely

   # Bind the validated items back to the master order id parent hook
        for order_item in items_to_save:
            order_item.order_id = new_order.id
            db.add(order_item)

   # Commit everything together safely inside SQLite test.db tables
            db.commit()
            db.refresh(new_order)

            return (new_order)

# / GET  Fetch order history matching active user


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
