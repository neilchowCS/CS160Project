import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CarbonTrackUI from "./CarbonTrackUI";
import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";
import EditProfile from "./EditProfile";
import Help from "./Help";

function RequireAuth({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('jwt') || '';
    if (!token) return <Navigate to="/login" replace />;
    return children;
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/home" element={
                <RequireAuth>
                    <CarbonTrackUI />
                </RequireAuth>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/help" element={
                        <RequireAuth>
                        <Help />
                        </RequireAuth>
                    }
                    />
            </Routes>
        </Router>
    );
}

export default App;
