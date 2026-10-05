import React, { useState } from "react";

function App() {
  // --- STATE HOOKS ---
  const [signUpData, setSignUpData] = useState({ first_name: '', last_name: '', email: '', password: '', country: '' });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [memos, setMemos] = useState([]);
  const [newMemo, setNewMemo] = useState({ title: '', content: '' });

  // --- OPERATIONS / FUNCTIONS ---

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
        setStatusMessage("Account Login successfully! Secure Token generated.");
        localStorage.setItem("user_session_token", data.access_token);
        setLoginEmail('');
        setLoginPassword('');
        fetchMemos();
      } else {
        setStatusMessage(`Login Error : ${data.detail}`);
      }
    } catch (err) {
      setStatusMessage("Network Connection failed.");
    }
  };

  // 3. Save Note to Database
  const handleCreateMemos = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("user_session_token");
    if (!token) {
      setStatusMessage("Unauthorized! Please sign in to fetch a session passport token first");
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/auth/memos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newMemo)
      });

      if (response.ok) {
        setStatusMessage("Success! Private memo saved securely to the SQLite table");
        setNewMemo({ title: '', content: '' });
        fetchMemos();
      } else {
        setStatusMessage("Failed to add note");
      }
    } catch (err) {
      setStatusMessage("Network Error");
    }
  };

  // 4. Fetch Notes
  const fetchMemos = async () => {
    const token = localStorage.getItem("user_session_token");
    if (!token) {
      setStatusMessage("No token found! Authenticate first.");
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/auth/memos", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok) {
        setMemos(data);
        setStatusMessage(`Loaded ${data.length} personal memos isolated dynamically by JWT!`);
      } else {
        setStatusMessage("Server rejected session token");
      }
    } catch (err) {
      setStatusMessage("Fetch communication failure");
    }
  };

  // --- UI RENDER VIEW ---
  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#111827' }}>Full-Stack Identity Portal</h2>

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
            <button type="submit" style={{ padding: '10px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Register</button>
          </form>
        </div>

        {/* LOGIN SECTION */}
        <div style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px', background: '#f9fafb' }}>
          <h3>Sign In</h3>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required style={{ padding: '8px' }} />
            <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required style={{ padding: '8px' }} />
            <button type="submit" style={{ padding: '10px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Login</button>
          </form>
        </div>
      </div>

      {/* MEMO APPLICATION WORKSPACE */}
      <div style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px', background: '#fff', marginBottom: '40px' }}>
        <h3>Your Private Notebook</h3>
        <form onSubmit={handleCreateMemos} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <input type="text" placeholder="Memo Title" value={newMemo.title} onChange={e => setNewMemo({ ...newMemo, title: e.target.value })} required style={{ padding: '8px' }} />
          <textarea placeholder="Write content here..." value={newMemo.content} onChange={e => setNewMemo({ ...newMemo, content: e.target.value })} required style={{ padding: '8px', minHeight: '60px' }} />
          <button type="submit" style={{ padding: '10px', background: '#4b5563', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>Save Sticky Note</button>
        </form>

        <button onClick={fetchMemos} style={{ padding: '8px 12px', background: '#9ca3af', color: '#fff', border: 'none', cursor: 'pointer', marginBottom: '20px', borderRadius: '4px' }}>🔄 Sync Notebook from Cloud</button>

        {/* MEMOS RENDER CONTAINER LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {memos.map((memo, idx) => (
            <div key={memo.id || idx} style={{ padding: '15px', borderLeft: '4px solid #3b82f6', background: '#f3f4f6', borderRadius: '0 4px 4px 0' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>{memo.title}</h4>
              <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>{memo.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PORTAL SIGNAL BAR */}
      {statusMessage && (
        <div style={{ marginTop: '30px', padding: '12px', background: '#eff6ff', borderLeft: '4px solid #2563eb', borderRadius: '4px', fontSize: '14px' }}>
          <strong>Portal Signal:</strong> {statusMessage}
        </div>
      )}
    </div>
  );
}

export default App;
