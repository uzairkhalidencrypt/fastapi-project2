import React, { useState, useEffect } from 'react';

function ProductCatalog({ cartItems, setCartItems, setStatusMessage }) {
  const [products, setProducts] = useState([]);

  // Local state for the product creator form inputs
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });

  // 1. Fetch live product rows from your FastAPI database on boot
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:8000/auth/productview");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Backend catalog unreachable:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Submit new product parameters to database rows (POST)
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/auth/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock)
        })
      });

      if (response.ok) {
        setStatusMessage(`Successfully created product: ${newProduct.name}`);
        setNewProduct({ name: '', price: '', stock: '' }); // Clear input fields
        fetchProducts(); // Refresh catalog instantly from db!
      } else {
        setStatusMessage("Failed to register new product parameters.");
      }
    } catch (err) {
      console.error("Product creation network failure:", err);
    }
  };

  // 3. Delete product row from database table ledger (DELETE)
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const response = await fetch(`http://localhost:8000/auth/testproducts/${id}`, {
        method: 'DELETE'
      });

      if (response.status === 204 || response.ok) {
        setStatusMessage(`Successfully scrubbed "${name}" from inventory.`);
        fetchProducts(); // Refresh catalog grid view rows instantly
      } else {
        setStatusMessage("Server rejected deletion check.");
      }
    } catch (err) {
      console.error("Deletion communication error:", err);
    }
  };

  const handleAddToCart = (product) => {
    setCartItems((prevItems) => {
      const itemExists = prevItems.find((item) => item.product_id === product.id);
      if (itemExists) {
        return prevItems.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { product_id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
    setStatusMessage(`Added "${product.name}" to shopping cart.`);
  };

  return (
    <div style={{ marginTop: '20px' }}>

      {/*  ADMIN INVENTORY MANAGEMENT CONTROL PANEL PANEL */}
      <div style={{ border: '1px solid #d97706', padding: '20px', borderRadius: '8px', background: '#fff7ed', marginBottom: '40px' }}>
        <h3 style={{ marginTop: 0, color: '#9a3412', borderBottom: '2px solid #fed7aa', paddingBottom: '8px' }}>
          Inventory Stock Manager Panel (Admin)
        </h3>
        <form onSubmit={handleCreateProduct} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '15px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#7c2d12', marginBottom: '5px' }}>Product Name</label>
            <input type="text" placeholder="e.g. RGB Mechanical Keyboard" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #fed7aa', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#7c2d12', marginBottom: '5px' }}>Price ($)</label>
            <input type="number" step="0.01" placeholder="89.99" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #fed7aa', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#7c2d12', marginBottom: '5px' }}>Initial Stock</label>
            <input type="number" placeholder="50" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #fed7aa', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" style={{ padding: '11px', background: '#d97706', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            ➕ Seed Item Row
          </button>
        </form>
      </div>

      {/* PUBLIC CUSTOMER SHOP CATALOGUE GRID */}
      <h2 style={{ color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '20px' }}>
        Storefront Catalogue
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative' }}>
            {/* Delete button wrapper inside card */}
            <button
              onClick={() => handleDeleteProduct(product.id, product.name)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}
              title="Delete Product"
            >

            </button>

            <h4 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '16px', paddingRight: '20px' }}>{product.name}</h4>
            <p style={{ fontWeight: 'bold', color: '#2563eb', margin: '0 0 5px 0' }}>Price: ${product.price}</p>
            <p style={{ fontSize: '13px', color: product.stock > 0 ? '#10b981' : '#ef4444', margin: '0 0 15px 0' }}>
              {product.stock > 0 ? `🟢 In Stock (${product.stock} units)` : "🔴 Temporarily Out of Stock"}
            </p>

            <button
              onClick={() => handleAddToCart(product)}
              disabled={product.stock <= 0}
              style={{ width: '100%', padding: '10px', background: product.stock > 0 ? '#2563eb' : '#9ca3af', color: 'white', border: 'none', borderRadius: '4px', cursor: product.stock > 0 ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}
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
