import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import MovieDetailPage from './pages/MovieDetailPage';

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

                    {/* Movie details page */}
                    <Route path="/movie/:id" element={<MovieDetailPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;