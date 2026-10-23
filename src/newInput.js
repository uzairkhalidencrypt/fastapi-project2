import React, { useState } from 'react';

function NewInput() {
    // Read from sessionStorage on initial load
    const [number, setNumber] = useState(() => {
        return sessionStorage.getItem("input1Value") || "";
    });
    const [number2, setNumber2] = useState(() => {
        return sessionStorage.getItem("input2Value") || "";
    });

    const handleChange = (event) => {
        setNumber(event.target.value);
        sessionStorage.setItem("input1Value", event.target.value);
    };

    const handleChange2 = (event) => {
        setNumber2(event.target.value);
        sessionStorage.setItem("input2Value", event.target.value);
    };

    return (
        <div>
            <h3>SessionStorage Method</h3>
            <input type="text" value={number} onChange={handleChange} placeholder="hello" />
            <input type="text" value={number2} onChange={handleChange2} placeholder="num2" />
            <p>Value 1: {number}</p>
            <p>Value 2: {number2}</p>
        </div>
    );
}

export default NewInput;
