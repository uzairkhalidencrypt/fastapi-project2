import React, { useEffect, useState } from 'react'

function Input() {

    const [number, setNumber] = useState(() => {
        return localStorage.getItem("input1Value")
    });
    const [number2, setNumber2] = useState(() => {
        return localStorage.getItem("input2Value")
    });


    const handleChange = (event) => {
        setNumber(event.target.value);
        localStorage.setItem("input1Value", event.target.value)

    }


    const handleChange2 = (event) => {
        setNumber2(event.target.value);
        localStorage.setItem("input2Value", event.target.value)

    }
    // useEffect(() => {
    //     setNumber(localStorage.getItem("input1Value",))
    //     setNumber2(localStorage.getItem("input2Value",))

    // }, []);

    return (
        <div>
            input
            <form>
                <label>
                    Input:
                    <input
                        // style={{ backgroundColor: "white", width: '45px', height: "39px" }}
                        type="int"
                        placeholder='hello'
                        value={number}
                        onChange={handleChange}
                    />
                </label>
            </form>
            <form>
                <label>
                    Number:
                    <input
                        type="int"
                        placeholder='num2'
                        value={number2}
                        onChange={handleChange2}
                    />
                </label>
                <p>Input 1 Value: {number}</p>
                <p>Input 2 Value: {number2}</p>
            </form>
        </div>
    )
}

export default Input
