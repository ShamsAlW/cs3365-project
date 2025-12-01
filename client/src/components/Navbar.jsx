import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";


export default function Navbar() {
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

            <input
                type="text"
                placeholder="Search movies..."
                className="navbar-search"
            />


            <div className="navbar-buttons">
                {/* Home Link */}
                <Link to="/" className="nav-btn">
                    Home
                </Link>

                {/* Account Link; Currently (temporary) only leads to admin page */}
                <Link to="/admin" className="nav-btn login-btn">
                    Account
                </Link>
            </div>
        </nav>
    );
}