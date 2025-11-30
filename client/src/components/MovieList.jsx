import React from 'react';
import './MovieList.css';

function MovieList({ movies }) {

    if (!movies || movies.length === 0) {
        return (
            <div className="public-movie-list-container">
                <h2>No Movies Currently Airing</h2>
                <p style={{ color: '#ccc' }}>Check back soon for new showtimes.</p>
            </div>
        );
    }

    return (
        <div className="public-movie-list-container">
            <h2>Current Showtimes</h2>
            {movies.map(movie => (
                <div key={movie.id} className="public-movie-card">

                    <img
                        src={movie.poster_url}
                        alt={`Poster for ${movie.title}`}
                    />

                    <div className="public-movie-details">
                        <h3>{movie.title} ({movie.rating})</h3>

                        <h4>Showtimes:</h4>
                        {movie.showtimes && movie.showtimes.length > 0 && (
                            <p>
                                **Date:** {movie.showtimes[0].date} | **Times:** {movie.showtimes[0].times.join(', ')}
                            </p>
                        )}

                    </div>
                </div>
            ))}
        </div>
    );
}

export default MovieList;