import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Cal from './cal';
import Timer from './timer';
import Input from './input';

function App() {

    console.log("window>>>", window.location);
    const location = useLocation();

    return (

        <div>App

            {/* {window.location.pathname == '/timer' ? null : */}
            {location.pathname === '/timer' ? null : (
                <nav>
                    <Link to="/cal">Cal</Link> |{" "}
                    <Link to="/timer">Timer</Link> |{" "}
                    <Link to="/input">Input</Link> |{" "}
                </nav>
            )}
            {/* } */}
            <Routes>
                <Route path="/cal" element={<Cal />} />
                <Route path="/timer" element={<Timer />} />
                <Route path="/input" element={<Input />} />
            </Routes>

        </div>
    );
}

export default function AppContent() {
    return (<BrowserRouter>
        <App />
    </BrowserRouter>);

}