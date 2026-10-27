import React, { useState, useEffect } from 'react';

function Dom() {
    // 1. Log during the initial setup/render phase
    console.log(" 1. RENDER PHASE: Component is drawing the blueprint...");

    const [number, setNumber] = useState("");

    // 2. Log inside the useEffect phase
    useEffect(() => {
        console.log(` 3. EFFECT PHASE: The DOM is fully updated! Current number in state is: "${number}"`);

        // This is a direct DOM manipulation outside of React's wrapper
        document.title = `Form Value: ${number || 'Empty'}`;
    }, [number]);

    const handleChange = (event) => {
        const nextValue = event.target.value;
        console.log(` 2. EVENT PHASE: User typed "${nextValue}". Updating state now...`);
        setNumber(nextValue);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h3>Observation Mode</h3>
            <input type="text" value={number} onChange={handleChange} placeholder="Type a number..." />
            <p>Displayed DOM Text: {number}</p>
        </div>
    );
}

export default Dom;
