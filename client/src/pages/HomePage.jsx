import React, { useState, useEffect } from 'react';
import MovieList from '../components/MovieList';
import SearchBar from '../components/SearchBar';
import './HomePage.css';

function HomePage() {
    const [movies, setMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

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

    // Filter movies based on search query
    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="home-page-container">
            <div style={{ marginTop: '30px', width: '90%' }}>
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                {searchQuery && (
                    <p style={{ color: '#888', marginBottom: '20px', textAlign: 'center' }}>
                        {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''} found
                    </p>
                )}
                <MovieList movies={filteredMovies} />
            </div>

        </div>
    );
}

export default HomePage;