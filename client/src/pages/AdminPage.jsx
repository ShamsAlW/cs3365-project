import React, { useState, useEffect } from 'react';
import AdminMovieList from '../components/AdminMovieList.jsx';
import MovieForm from '../components/MovieForm';
import './AdminPage.css';

function AdminPage() {
    const [movies, setMovies] = useState([]);
    const [movieToEdit, setMovieToEdit] = useState(null);

    // Function to fetch movies from the backend
    const fetchMovies = async () => {
        try {
            const res = await fetch('/api/movies');
            if (!res.ok) {
                console.error("Failed to fetch movies. Status:", res.status);
                return;
            }

            const data = await res.json();
            setMovies(data);
            console.log("Movies loaded:", data);
        } catch (err) {
            console.error("Error fetching movies:", err);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    // Handler passed to trigger a refresh after any CUD operation
    const handleMovieChange = () => {
        fetchMovies();
        setMovieToEdit(null);
    };

    // Function to pass to AdminMovieList when an Edit button is clicked
    const startEdit = (movie) => {
        setMovieToEdit(movie);
    };

    return (
        <div className="admin-page-container">

            <header className="admin-page-header">
                <h2>Movie Catalog Administration Dashboard</h2>
            </header>

            <main className="admin-main-content">

                {/* Left section for the form */}
                <section className="admin-form-section">
                    <MovieForm
                        onMovieChange={handleMovieChange}
                        movieToEdit={movieToEdit}
                        setMovieToEdit={setMovieToEdit}
                    />
                </section>

                {/* Right section for the list */}
                <section className="admin-list-section">
                    <AdminMovieList
                        movies={movies}
                        onMovieChange={handleMovieChange}
                        onStartEdit={startEdit}
                    />
                </section>
            </main>
        </div>
    );
}

export default AdminPage;