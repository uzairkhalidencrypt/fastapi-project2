import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';

// 🚨 IMPORT YOUR BRAND NEW MODULAR PAGE PAGES FROM THE HIERARCHY
import Login from './pages/Login';
import Cart from './pages/Cart';
import ProductCatalog from './pages/ProductCatalog';

// Keep your local layout widgets linked safely if you're still testing them
import Timer from "./timer";

function App() {
  // --- MASTER STATE HOOKS ---
  const [cartItems, setCartItems] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [memos, setMemos] = useState([]);

  // 🚨 FIXED: Removed the const navigate = useNavigate() line from here!

  // ... keep your useEffect hooks exactly the same ...

  const handleLogout = () => {
    localStorage.removeItem("user_session_token");
    setCartItems([]);
    setIsAuthenticated(false);
    setStatusMessage("Logged out successfully.");

    // 🚨 FIXED: Use native browser routing window redirect to bypass the error context loop!
    window.location.href = '/login';
  };

  // --- AUTOMATED INITIAL SESSION SYNC CONTROLLER ---
  useEffect(() => {
    // Inspect local storage memory parameters on boot to detect ongoing login sessions
    const activeToken = localStorage.getItem("user_session_token");
    if (activeToken) {
      setIsAuthenticated(true);
      fetchMemos(); // Automatically recover notebook indexes if logged in
    }

    // Recover local shopping basket configurations if they exist
    const savedCart = localStorage.getItem('e-commerce_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Cart storage tracking error:", e);
      }
    }
  }, []);

  // Sync cart entries down to persistent local storage memory parameters automatically on updates
  useEffect(() => {
    localStorage.setItem('e-commerce_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // --- CORE HELPER UTILITIES ---
  const fetchMemos = async () => {
    const token = localStorage.getItem("user_session_token");
    if (!token) return;
    try {
      const response = await fetch("http://localhost:8000/auth/memos", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMemos(data);
      }
    } catch (err) {
      console.error("Memos background synchronization failure:", err);
    }
  };


  return (
    <div style={{ fontFamily: 'sans-serif', background: '#f9fafb', minHeight: '100vh' }}>

      {/* 🟢 GLOBAL APPLICATION CORE NAVBAR HEADER */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 40px', background: '#111827', color: 'white', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: 0, fontSize: '20px', letterSpacing: '0.5px' }}>🛍️ Full-Stack E-Com</h2>

        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <Link to="/" style={{ color: '#f3f4f6', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }}>Storefront Catalogue</Link>
              <Link to="/cart" style={{ color: '#f3f4f6', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px', background: '#1f2937', padding: '8px 14px', borderRadius: '6px' }}>
                🛒 Cart Basket ({cartItems ? cartItems.length : 0})
              </Link>
              <button
                onClick={handleLogout}
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Authentication Gate</Link>
          )}
        </div>
      </nav>

      {/* GLOBAL DYNAMIC STATUS BANNER NOTIFICATION MESSAGES */}
      {statusMessage && (
        <div style={{ maxWidth: '1000px', margin: '20px auto 0 auto', padding: '0 20px' }}>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '12px', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold' }}>
            🔔 System Alert: {statusMessage}
          </div>
        </div>
      )}

      {/* 🔵 MULTI-PAGE VIEWPORT ROUTING ENGINE CONTAINER SWITCH */}
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        <Routes>
          {/* Gate 1: Login/Register Multi-Form Gateway Path */}
          <Route
            path="/login"
            element={!isAuthenticated ? (
              <Login
                setIsAuthenticated={setIsAuthenticated}
                fetchMemos={fetchMemos}
                setStatusMessage={setStatusMessage}
                statusMessage={statusMessage}
              />
            ) : (
              <Navigate to="/" />
            )}
          />

          {/* Gate 2: Core Storefront Inventory Landing Grid Page */}
          <Route
            path="/"
            element={isAuthenticated ? (
              <ProductCatalog
                cartItems={cartItems}
                setCartItems={setCartItems}
                setStatusMessage={setStatusMessage}
              />
            ) : (
              <Navigate to="/login" />
            )}
          />

          {/* Gate 3: Active Checkout Order Engine Process Page */}
          <Route
            path="/cart"
            element={isAuthenticated ? (
              <Cart
                cartItems={cartItems}
                setCartItems={setCartItems}
              />
            ) : (
              <Navigate to="/login" />
            )}
          />

          {/* Fallback Redirection Route Check logic parameters */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {/* Pinned background stopwatch utility widget layout pane if needed */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', opacity: 0.15, background: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '6px' }}>
        <Timer />
      </div>

    </div>
  );
}

export default App;
