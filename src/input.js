import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';

function Input() {
    const [searchParams, setSearchParams] = useSearchParams();
    // const [number, setNumber] = useState(() => {
    // return localStorage.getItem("input1Value")
    // });
    const number = searchParams.get("input1") || "";
    // const [number2, setNumber2] = useState(() => {
    // return localStorage.getItem("input2Value")
    // });
    const number2 = searchParams.get("input2") || "";


    const handleChange = (event) => {
        // setNumber(event.target.value);
        // localStorage.setItem("input1Value", event.target.value)
        const params = new URLSearchParams(searchParams);
        params.set("input1", event.target.value);
        setSearchParams(params, { replace: true });

    };


    const handleChange2 = (event) => {
        // setNumber2(event.target.value);
        // localStorage.setItem("input2Value", event.target.value)
        const params = new URLSearchParams(searchParams);
        params.set("input2", event.target.value);
        setSearchParams(params, { replace: true });

    }
    // useEffect(() => {
    //     setNumber(localStorage.getItem("input1Value",))
    //     setNumber2(localStorage.getItem("input2Value",))

    // }, []);

    return (
        <div>
            {/* input */}<h3>URL State Manage Input</h3>
            <form onSubmit={(e) => e.preventDefault()}>
                <label>
                    Input 1:
                    <input
                        // style={{ backgroundColor: "white", width: '45px', height: "39px" }}
                        type="int"
                        placeholder='hello'
                        value={number}
                        onChange={handleChange}
                    />
                </label>
            </form>
            <form onSubmit={(e) => e.preventDefault()}>
                <label>
                    {/* Number: */} Input 2:
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
