import React, { useState, useEffect } from "react";

function Timer() {
    const [seconds, setSeconds] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {

        if (isPaused)
            return;
        const interval = setInterval(() => {
            setSeconds((seconds) => seconds + 1)

        }, 1000);
        return () => clearInterval(interval);
    }
        , [isPaused]);

    const handlePause = () => {
        setIsPaused(!isPaused);

    };
    console.log("Seconds:", seconds);
    console.log("Is paused?:", isPaused);


    return (
        <div>
            <p>Timer</p>
            <p>Elapsed time: {seconds} seconds</p>
            <button onClick={() => setSeconds(0)}>Reset</button>
            <button onClick={handlePause}>
                {isPaused ? "Resume" : "Pause"}
            </button>
        </div>


    );
}

export default Timer