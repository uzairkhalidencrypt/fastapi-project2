import React, { useState, useEffect } from 'react'

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState('idle');
    // Fetch past Historical order matching active logged-in user
    useEffect(() => {
        const fetchUserOrderHistory = async () => {
            setLoadingStatus = ('loading');
            const sessionToken = localStorage.getItem("user_session_token");
            if (!sessionToken) {
                setLoadingStatus('Unauthorized');
                return;
            }
            try {
                //Hits registered order.py endpoint route
                const response = await fetch("http://localhost:8000/orders/", {
                    method: "GET",
                    headers:
            })
            } catch { }
        }
    })
    return (
        <div>OrderHistory</div>
    )
}

export default OrderHistory;