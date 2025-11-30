import React, { useState, useEffect } from 'react';
import MovieList from '../components/MovieList';
import './HomePage.css';

function HomePage() {
    const [movies, setMovies] = useState([]);

    // Function to fetch movies
    const fetchMovies = async () => {
        try {
            const res = await fetch('/api/movies');
            if (!res.ok) {
                console.error("Failed to fetch movies. Status:", res.status);
                return;
            }
            const data = await res.json();
            setMovies(data);
        } catch (err) {
            console.error("Error fetching movies:", err);
        }
    };

    // Fetch data when the component mounts
    useEffect(() => {
        fetchMovies();
    }, []);

    return (
        <div className="home-page-container">
            <div style={{ marginTop: '30px', width: '90%' }}>
                <MovieList movies={movies} />
            </div>

        </div>
    );
}

export default HomePage;