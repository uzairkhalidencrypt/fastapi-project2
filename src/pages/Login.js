import React, { useState } from 'react';

function Login({ setIsAuthenticated, fetchMemos, setMemos, setStatusMessage, statusMessage }) {
    // --- Local states for form inputs ---
    const [signUpData, setSignUpData] = useState({ first_name: '', last_name: '', email: '', password: '', country: '' });
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // 1. Register user account
    const handleSignUp = async (e) => {
        e.preventDefault();
        setStatusMessage('Processing Registration...');
        try {
            const response = await fetch("http://localhost:8000/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(signUpData)
            });

            const data = await response.json();
            if (response.ok) {
                setStatusMessage(`Account created successfully for ${data.first_name}!`);
                setSignUpData({ first_name: '', last_name: '', email: '', password: '', country: '' });
            } else {
                setStatusMessage(`Registration error : ${data.detail}`);
            }
        } catch (err) {
            setStatusMessage("Failed to communicate with backend server.");
        }
    };

    // 2. Login User
    const handleLogin = async (e) => {
        e.preventDefault();
        setStatusMessage('Verifying credentials...');

        try {
            const response = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });

            const data = await response.json();
            if (response.ok) {
                setStatusMessage("Account Login successful! Secure Token generated.");
                localStorage.setItem("user_session_token", data.access_token);
                setLoginEmail('');
                setLoginPassword('');
                setIsAuthenticated(true); // Updates Master Route configuration instantly!
                if (typeof fetchMemos === 'function') fetchMemos();
            } else {
                setStatusMessage(`Login Error: ${typeof data.detail === 'object' ? JSON.stringify(data.detail) : data.detail}`);
            }
        } catch (err) {
            setStatusMessage("Network Connection failed.");
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>

                {/* REGISTER SECTION */}
                <div style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px', background: '#f9fafb' }}>
                    <h3>Create Account</h3>
                    <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="text" placeholder="First Name" value={signUpData.first_name} onChange={e => setSignUpData({ ...signUpData, first_name: e.target.value })} required style={{ padding: '8px' }} />
                        <input type="text" placeholder="Last Name" value={signUpData.last_name} onChange={e => setSignUpData({ ...signUpData, last_name: e.target.value })} required style={{ padding: '8px' }} />
                        <input type="email" placeholder="Email" value={signUpData.email} onChange={e => setSignUpData({ ...signUpData, email: e.target.value })} required style={{ padding: '8px' }} />
                        <input type="password" placeholder="Password" value={signUpData.password} onChange={e => setSignUpData({ ...signUpData, password: e.target.value })} required style={{ padding: '8px' }} />
                        <input type="text" placeholder="Country" value={signUpData.country} onChange={e => setSignUpData({ ...signUpData, country: e.target.value })} required style={{ padding: '8px' }} />
                        <button type="submit" style={{ padding: '10px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>Register</button>
                    </form>
                </div>

                {/* LOGIN SECTION */}
                <div style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px', background: '#f9fafb' }}>
                    <h3>Sign In</h3>
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required style={{ padding: '8px' }} />
                        <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required style={{ padding: '8px' }} />
                        <button type="submit" style={{ padding: '10px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>Login</button>
                    </form>
                </div>

            </div>
        </div>
    );
}

export default Login;
