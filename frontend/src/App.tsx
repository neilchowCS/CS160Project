import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CarbonTrackUI from "./CarbonTrackUI";
import Login from "./Login";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<CarbonTrackUI />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;
