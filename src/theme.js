import React, { useEffect, useState } from 'react'

function Theme() {

    const [input, setInput] = useState("");
    const [theme, setTheme] = useState("light");

    const handleInput = (e) => {

        setInput(e.target.value);
    };
    const handleTheme = (e) => {
        if (theme === "light") {
            setTheme("dark");
        }
        else {
            setTheme("light");
        }
    }

    return (
        <div style={{
            backgroundColor: theme === "light" ? "white" : "#333",
            color: theme === "light" ? "black" : "white",
            padding: '20px',
            minHeight: '100vh'
        }}>
            <form>
                <label>
                    input:
                    <input
                        type='text'
                        placeholder='type'
                        value={input}
                        onChange={handleInput}
                    />

                </label>
            </form>
            <button onClick={handleTheme}
                style={{
                    padding: '15px',
                    backgroundColor: 'pink',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    border: '1px solid',
                    marginTop: '10px'
                }}>Toggle to {theme === "light" ? "Dark" : "light"}</button>
            <p>theme current state : {theme}</p>
        </div>
    );
}

export default Theme;