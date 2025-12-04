import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import MovieDetailPage from './pages/MovieDetailPage';
import AccountPage from './pages/AccountPage';

// Protected route component for admin
function AdminRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!user.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}

// Protected route component for authenticated users
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function AppRoutes() {
    return (
        <div className="container">
            <Navbar />
            <Routes>
                {/* Default path (homepage) */}
                <Route path="/" element={<HomePage />} />

                {/* Login page */}
                <Route path="/login" element={<LoginPage />} />

                {/* Register page */}
                <Route path="/register" element={<RegisterPage />} />

                {/* Admin page - protected */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminPage />
                        </AdminRoute>
                    }
                />

                {/* Account page - protected */}
                <Route
                    path="/account"
                    element={
                        <ProtectedRoute>
                            <AccountPage />
                        </ProtectedRoute>
                    }
                />

                {/* Movie details page */}
                <Route path="/movie/:id" element={<MovieDetailPage />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;