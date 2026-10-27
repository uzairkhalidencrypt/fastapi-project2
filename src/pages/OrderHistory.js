import React, { useState, useEffect } from 'react';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loadingStatus, setLoadingStatus] = useState('idle');

    useEffect(() => {
        const fetchUserOrderHistory = async () => {
            setLoadingStatus('loading');
            const sessionToken = localStorage.getItem("user_session_token");

            if (!sessionToken) {
                setLoadingStatus('unauthorized');
                return;
            }

            try {
                // 🚨 FIXED: Cleaned up the path address to a clean, valid URL string token parameter
                const response = await fetch("http://localhost:8000/orders/", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${sessionToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                    setLoadingStatus('success');
                } else {
                    setLoadingStatus('error');
                }

            } catch (err) {
                console.error("Order history trace failure:", err);
                setLoadingStatus('error');
            }
        };

        fetchUserOrderHistory();
    }, []);

    return (
        <div style={{ marginTop: '20px' }}>
            <h2 style={{ color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '20px' }}>
                Your Past Historical Orders
            </h2>

            {loadingStatus === 'loading' && <p style={{ color: 'orange' }}>⏳ Gathering transaction receipts from database...</p>}
            {loadingStatus === 'unauthorized' && <p style={{ color: 'red' }}>🔒 Unauthorized. Please sign in to sync ledger history.</p>}
            {loadingStatus === 'error' && <p style={{ color: 'red' }}> Failed to communicate with database ledger tables.</p>}

            {loadingStatus === 'success' && orders.length === 0 ? (
                <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', textAlign: 'center', color: '#4b5563', fontStyle: 'italic' }}>
                    You haven't placed any checkout orders on this profile session yet!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {orders.map((order) => (
                        <div key={order.id} style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e5e7eb', paddingBottom: '10px', marginBottom: '10px' }}>
                                <div>
                                    <strong style={{ color: '#1f2937' }}>Receipt ID:</strong> <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>#{order.id}</code>
                                </div>
                                <div style={{ fontWeight: 'bold', color: '#d97706' }}>
                                    ⏱️ Status: {order.status || "Pending"}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '14px', color: '#4b5563' }}>
                                    Shipping Point: <em>{order.shipping_address || "Default point"}</em>
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                                    Total Bill: <span style={{ color: '#2563eb' }}>${order.total_amount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OrderHistory;
