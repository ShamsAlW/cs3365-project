import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';

function App() {
    return (
        <Router>
            <div className="container">
                <Navbar />

                <Routes>
                    {/* Default path (homepage) */}
                    <Route path="/" element={<HomePage />} />

                    {/* Admin editing page */}
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;