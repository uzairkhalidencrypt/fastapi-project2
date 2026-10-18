
import React, { useState } from "react";
import Cal from './cal';
import Timer from "./timer";

function App() {

  // --- STATE HOOKS ---
  const [signUpData, setSignUpData] = useState({ first_name: '', last_name: '', email: '', password: '', country: '' });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [memos, setMemos] = useState([]);
  const [newMemo, setNewMemo] = useState({ title: '', content: '' });
  const [allUsers, setAllUsers] = useState([]);


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
  // 2. Login User (Perfect Alignment with Pydantic Schema)
  const handleLogin = async (e) => {
    e.preventDefault();
    setStatusMessage('Verifying credentials...');

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        // Send 'email' instead of 'username' to clear the validation error
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      const data = await response.json();
      if (response.ok) {
        setStatusMessage("Account Login successful! Secure Token generated.");
        localStorage.setItem("user_session_token", data.access_token);
        setLoginEmail('');
        setLoginPassword('');
        fetchMemos(); // Automatically fetches your notes after log in
      } else {
        setStatusMessage(`Login Error: ${typeof data.detail === 'object' ? JSON.stringify(data.detail) : data.detail}`);
      }
    } catch (err) {
      setStatusMessage("Network Connection failed.");
    }
  };

  //Admin Operation: Fetch all created user profiles
  const fetchAllUsers = async () => {
    const token = localStorage.getItem("user_session_token");
    if (!token) {
      setStatusMessage("No token found! Authenticate first.");
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/auth/admin/users", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok) {
        setAllUsers(data);
        setStatusMessage(`Loaded ${data.length} user profiles from the database.`);
      } else {
        setStatusMessage("Server rejected session token or you are not an admin.");
      }
    } catch (err) {
      setStatusMessage("Fetch communication failure");
    }
  };

  // {/* NEW: ROLE-BASED ACCESS / ADMIN VIEW SECTION */ }
  // <div style={{ border: '1px solid #d97706', padding: '20px', borderRadius: '8px', background: '#fff7ed', marginBottom: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
  //   <h3 style={{ borderBottom: '2px solid #d97706', paddingBottom: '8px', color: '#9a3412', marginTop: 0 }}> Admin Panel (Role-Based View)</h3>
  //   <p style={{ fontSize: '14px', color: '#7c2d12', marginBottom: '15px' }}>
  //     This administrative module queries the backend database table directly to list all created user credentials across the platform.
  //   </p>

  //   <button onClick={fetchAllUsers} style={{ padding: '10px 14px', background: '#d97706', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px', marginBottom: '20px' }}>
  //     🔍 Fetch Master User Directory
  //   </button>

  //   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
  //     {allUsers.length === 0 ? (
  //       <p style={{ color: '#9a3412', fontStyle: 'italic', margin: '5px 0', fontSize: '14px' }}>Directory empty or not synced yet.</p>
  //     ) : (
  //       allUsers.map((user, idx) => (
  //         <div key={user.id || idx} style={{ padding: '10px 15px', border: '1px solid #fed7aa', borderRadius: '6px', background: '#fff', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
  //           <div>
  //             <strong>Name:</strong> {user.first_name} {user.last_name}
  //           </div>
  //           <div>
  //             <strong>Email:</strong> <code style={{ background: '#f3f4f6', padding: '2px 4px', borderRadius: '4px' }}>{user.email}</code>
  //           </div>
  //           <div>
  //             <strong>Country:</strong> 🌍 {user.country || "N/A"}
  //           </div>
  //         </div>
  //       ))
  //     )}
  //   </div>
  // </div>


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

  const [count, setCount] = useState(0);


  const handleClick = () => {
    setCount(count + 1);
  };

  const [submit, setSubmit] = useState(false);

  // --- UI RENDER VIEW ---
  return (


    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#111827' }}>Full-Stack Identity Portal</h2>
      {/* Adding this section reads the value, instantly fixing the linter warning! */}
      {statusMessage && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '12px', borderRadius: '6px', marginBottom: '25px', textAlign: 'center' }}>
          {statusMessage}
        </div>
      )}
      <div className="App">
        <Timer />

      </div>

      <div className="App">
        <Cal /> {/* <-- 2. This calls/renders the calculator on the screen */}
      </div>

      <button onClick={handleClick} style={{ padding: '10px 14px', background: '#1b0430', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px', marginBottom: '20px', justifyContent: 'center', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
        Click me! Count: {count}
      </button>
      {/* { */}
      count 0 && (
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '12px', borderRadius: '6px', marginBottom: '25px', textAlign: 'center' }}>
        Count: {count}
      </div>
      )
      {/* // } */}


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



      {/* EVENT LOOP EXPERIMENTAL LABORATORY */}
      <div style={{ border: '1px solid #bfdbfe', padding: '20px', borderRadius: '8px', background: '#eff6ff', marginBottom: '40px' }}>
        <h3 style={{ color: '#1e40af', marginTop: 0 }}>⚡ Event Loop Laboratory</h3>
        <p style={{ fontSize: '14px', color: '#1e3a8a' }}>
          Clicking this will trigger a fake 7-second background process on the backend. Watch how the UI stays active and the server responds immediately!
        </p>
        <button
          onClick={async () => {
            setStatusMessage("Firing asynchronous event loop payload...");
            try {
              const res = await fetch("http://localhost:8000/auth/trigger-event-loop-demo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "testuser@gmail.com", country: "Pakistan" })
              });
              const data = await res.json();
              setStatusMessage(`Backend Event Loop Response: ${data.message}`);
            } catch (err) {
              setStatusMessage("Failed to reach lab route.");
            }
          }}
          style={{ padding: '10px 14px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}
        >
          Fire Non-Blocking Lab Request
        </button>

      </div>

      // 1. Point the URL exactly to your running FastAPI project endpoint
      const url = 'http://localhost:8000/auth/trigger-event-loop-demo';

      {/* INDEPENDENT PROMISE PRACTICE LABORATORY */}
      <div style={{ border: '1px solid #10b981', padding: '20px', borderRadius: '8px', background: '#ecfdf5', marginBottom: '40px' }}>
        <h3 style={{ color: '#065f46', marginTop: 0 }}>🧪 Independent Promise Practice Lab</h3>
        <p style={{ fontSize: '14px', color: '#065f46' }}>
          This card uses your exact <code>.then()</code> and <code>.catch()</code> structure to test network Promises independently.
        </p>

        <button
          onClick={() => {
            // 1. Point the URL exactly to your running FastAPI backend server
            const url = 'http://localhost:8000/auth/trigger-event-loop-demo';

            // 2. Define the payload structure expected by your FastAPI endpoint
            const payload = {
              email: 'practiceuser@gmail.com',
              country: 'Pakistan'
            };

            console.log("[Practice Lab] Button clicked! Dispatching Promise chain...");
            setStatusMessage("Promise practice request dispatched...");

            // 3. Execute using your exact .then() chaining structure
            fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(payload)
            })
              .then(response => {
                console.log("[Practice Lab] Step 1 complete: Received stream response status:", response.status);
                return response.json(); // Converts raw stream data into a readable JS object
              })
              .then(data => {
                console.log("[Practice Lab] Step 2 complete: Extracted data object:", data);

                // This dynamically updates your UI status bar with the message from your python dict
                setStatusMessage(`Promise Lab Success: ${data.message}`);
              })
              .catch(error => {
                console.error("[Practice Lab] Error caught in chain:", error);
                setStatusMessage("The network request failed. See your browser inspect console.");
              });
          }}
          style={{ padding: '10px 14px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}
        >
          Fire Promise (.then) Request
        </button>
      </div>

    </div>

  );


}





export default App;
