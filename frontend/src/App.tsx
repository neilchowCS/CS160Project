import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CarbonTrackUI from "./CarbonTrackUI";
import Login from "./Login";
import Register from "./Register";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<CarbonTrackUI />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    );
}

export default App;
