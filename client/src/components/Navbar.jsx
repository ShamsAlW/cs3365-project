import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";


export default function Navbar() {
    // FIX 1: Fetch the 'user' object instead of 'isAdmin'
    const {logout, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="navbar-logo-link">
                    <img
                        src="/color-movie-icon.svg"
                        alt="Movie App Logo"
                        className="navbar-logo"
                    />
                </Link>
                <Link to={"/"}>
                    <div className="navbar-title">Movie Booking System</div>
                </Link>
            </div>

            <div className="navbar-buttons">
                {/* Home Link */}
                <Link to="/" className="nav-btn">
                    Home
                </Link>

                {/* Conditional rendering based on auth status */}
                {isAuthenticated ? (
                    <>
                        {/* FIX 2: Check that 'user' exists AND user.isAdmin is true */}
                        {user && user.isAdmin && (
                            <Link to="/admin" className="nav-btn">
                                Admin
                            </Link>
                        )}

                        {/* My Account Link */}
                        <Link to="/account" className="nav-btn account-btn">
                            My Account
                        </Link>

                        {/* Logout button */}
                        <button onClick={handleLogout} className="nav-btn logout-btn">
                            Logout
                        </button>
                    </>
                ) : (
                    /* Login Link when not authenticated */
                    <Link to="/login" className="nav-btn login-btn">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}