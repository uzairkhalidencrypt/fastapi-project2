import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Cal from './cal';
import Timer from './timer';
import Input from './input';
import ExInput from './exInput';
import NewInput from './newInput';
import Theme from './theme';

function App() {
    const [showNav, setShowNav] = useState(true)

    // console.log("window>>>", window.location);
    // const location = useLocation();

    return (

        <div>App


            {/* {window.location.pathname == '/timer' ? null : */}
            {/* {location.pathname === '/timer' ? null : ( */}
            {showNav && (
                <nav>
                    <Link to="/cal">Cal</Link> |{" "}
                    <Link to="/timer">Timer</Link> |{" "}
                    <Link to="/input">Input</Link> |{" "}
                    <Link to="/exInput">ExInput</Link> |{" "}
                    <Link to="/newInput">NewInput</Link> |{" "}
                    <Link to="/theme">Theme</Link> |{" "}
                </nav>
            )}
            {/* )} */}
            {/* } */}
            <Routes>
                <Route path="/cal" element={<Cal />} />
                <Route path="/timer" element={<Timer setHideLayout={setShowNav} />} />
                <Route path="/input" element={<Input />} />
                <Route path="/exInput" element={<ExInput />} />
                <Route path="/newInput" element={<NewInput />} />
                <Route path="/theme" element={<Theme />} />
            </Routes>

        </div>
    );
}

export default function AppContent() {
    return (<BrowserRouter>
        <App />
    </BrowserRouter>);

}