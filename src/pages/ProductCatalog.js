import React, { useState, useEffect } from 'react';

function ProductCatalog({ cartItems, setCartItems, setStatusMessage }) {
    const [products, setProducts] = useState([]);

    // Fetch product row allocations from your FastAPI inventory tables on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("http://localhost:8000/auth/productview");
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                } else {
                    // Fallback mockup array parameters if your database table rows are empty right now
                    setProducts([
                        { id: 1, name: "Breathable Running Board Shoes", price: 45, stock: 15 },
                        { id: 2, name: "Men's Full Zipper Balaclava Hoodie", price: 65, stock: 8 },
                        { id: 3, name: "Functional Wireless Mechanical Keyboard", price: 89, stock: 23 }
                    ]);
                }
            } catch (err) {
                console.error("Backend catalog unreachable, initializing dev mockup:", err);
                setProducts([
                    { id: 1, name: "Breathable Running Board Shoes", price: 45, stock: 15 },
                    { id: 2, name: "Men's Full Zipper Balaclava Hoodie", price: 65, stock: 8 },
                    { id: 3, name: "Functional Wireless Mechanical Keyboard", price: 89, stock: 23 }
                ]);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = (product) => {
        setCartItems((prevItems) => {
            // Check if product identity already exists in basket index array
            const itemExists = prevItems.find((item) => item.product_id === product.id);

            if (itemExists) {
                return prevItems.map((item) =>
                    item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            // Add fresh payload record row matching your OrderCreateIn expectations
            return [...prevItems, { product_id: product.id, name: product.name, price: product.price, quantity: 1 }];
        });

        if (typeof setStatusMessage === 'function') {
            setStatusMessage(`Added "${product.name}" to shopping cart.`);
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <h2 style={{ color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '20px' }}>
                🛍️ Core Storefront Inventory Catalogue
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' }}>
                {products.map((product) => (
                    <div key={product.id} style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '16px' }}>{product.name}</h4>
                        <p style={{ fontWeight: 'bold', color: '#2563eb', margin: '0 0 5px 0' }}>Price: \${product.price}</p>
                        <p style={{ fontSize: '13px', color: product.stock > 0 ? '#10b981' : '#ef4444', margin: '0 0 15px 0' }}>
                            {product.stock > 0 ? `🟢 In Stock (${product.stock} units)` : "🔴 Temporarily Out of Stock"}
                        </p>

                        <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock <= 0}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: product.stock > 0 ? '#2563eb' : '#9ca3af',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                                fontWeight: 'bold'
                            }}
                        >
                            {product.stock > 0 ? "🛒 Add to Basket" : "Sold Out"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductCatalog;
