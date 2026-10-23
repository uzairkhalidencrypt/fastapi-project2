import React, { useState, useEffect } from 'react';

function Cart({ cartItems, setCartItems }) {
    const [checkoutStatus, setCheckoutStatus] = useState('idle');

    // Checkout View execution logic
    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            alert("Your shopping cart register is empty!");
            return;
        }

        setCheckoutStatus('Processing');

        // Extract the token directly from your persistent browser memory space on demand
        const activeSessionToken = localStorage.getItem("user_session_token");

        try {
            const response = await fetch("http://localhost:8000/orders/cart", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${activeSessionToken}`
                },
                // Inside src/pages/Cart.js — Update your body data mapping!
                // Inside src/pages/Cart.js — Update your body packaging key name!
                body: JSON.stringify({
                    // 🚨 FIXED: Changed key from 'cart_items' to 'cart_item' to match your schema!
                    cart_item: cartItems.map(item => ({
                        product_id: Number(item.product_id),
                        quantity: Number(item.quantity)
                    })),
                    shipping_address: "Standard Delivery Point"
                }),


            });

            if (response.ok) {
                setCheckoutStatus('Success');
                setCartItems([]); // Reset the cart register array upon a 201 Created response
            } else {
                setCheckoutStatus('Error');
            }
        } catch (error) {
            console.error("Network communication interface timeline failure:", error);
            setCheckoutStatus('Error');
        }
    };

    return (
        <div style={{ padding: '20px', border: '2px solid #3b82f6', borderRadius: '8px', background: '#f0f9ff', marginTop: '20px' }}>
            <h2 style={{ marginTop: 0, color: '#1d4ed8' }}>Shopping Cart Checkout</h2>
            <div className="cart-summary">
                <h3>Items in Cart: {cartItems ? cartItems.length : 0}</h3>

                {/* Render simple text items if items exist */}
                {cartItems.map((item, idx) => (
                    <p key={idx} style={{ background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                        📦 Product ID #{item.product_id} — Qty: {item.quantity}
                    </p>
                ))}

                {checkoutStatus === 'Processing' && <p style={{ color: 'orange' }}>⏳ Processing your order inside SQLite database...</p>}
                {checkoutStatus === 'Success' && <p style={{ color: 'green', fontWeight: 'bold' }}>🎉 Order placed successfully! Invoice recorded.</p>}
                {checkoutStatus === 'Error' && <p style={{ color: 'red' }}>❌ Something went wrong. Verify inventory allocations or middleware.</p>}

                <button
                    onClick={handleCheckout}
                    disabled={checkoutStatus === 'Processing'}
                    style={{ padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '10px' }}
                >
                    {checkoutStatus === 'Processing' ? 'Processing...' : 'Proceed to Checkout'}
                </button>
            </div>
        </div>
    );
}

export default Cart;
