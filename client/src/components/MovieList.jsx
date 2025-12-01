import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MovieList.css';

function MovieList({ movies }) {
    const navigate = useNavigate();

    if (!movies || movies.length === 0) {
        return (
            <div className="public-movie-list-container">
                <h2>No Movies Currently Airing</h2>
                <p style={{ color: '#ccc' }}>Check back soon for new showtimes.</p>
            </div>
        );
    }

    const handleMovieClick = (movieId) => {
        navigate(`/movie/${movieId}`);
    };

    return (
        <div className="public-movie-list-container">
            <h2>Current Showtimes</h2>
            <div className="movie-grid">
                {movies.map(movie => (
                    <div
                        key={movie.id}
                        className="public-movie-card"
                        onClick={() => handleMovieClick(movie.id)}
                    >
                        <img
                            src={movie.poster_url}
                            alt={`Poster for ${movie.title}`}
                        />
                        <div className="public-movie-title">
                            <h3>{movie.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MovieList;