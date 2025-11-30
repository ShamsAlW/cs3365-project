import React from 'react';
import './AdminMovieList.css';

function AdminMovieList({ movies, onMovieChange, onStartEdit }) {

    // Delete Handler
    const handleDelete = async (movieId, movieTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${movieTitle}"?`)) {
            return;
        }

        try {
            // Delete request
            const response = await fetch(`/api/movies/${movieId}`, {
                method: 'DELETE',
            });

            if (response.status === 204) {
                // 204 No Content means success
                onMovieChange();
                console.log(`Successfully deleted movie ID: ${movieId}`);
            } else {
                // Handle server errors
                console.error('Failed to delete movie. Server returned status:', response.status);
            }
        } catch (error) {
            console.error('Network error during delete:', error);
        }
    };

    // Handle case where there are no movies
    if (!movies || movies.length === 0) {
        return (
            <div className="movie-list-container">
                <h2>No Movies Currently Airing</h2>
            </div>
        );
    }

    return (
        <div className="movie-list-container">
            <h2>Current Movie Catalog ({movies.length} titles)</h2>
            {movies.map(movie => (
                <div key={movie.id} className="movie-card">

                    <img
                        src={movie.poster_url}
                        alt={`Poster for ${movie.title}`}
                    />

                    <div className="movie-details">
                        <h3>{movie.title} ({movie.rating})</h3>

                        <h4>Showtimes:</h4>
                        {movie.showtimes && movie.showtimes.length > 0 && (
                            <p>
                                **Date:** {movie.showtimes[0].date} | **Times:** {movie.showtimes[0].times.join(', ')}
                            </p>
                        )}

                        {/* EDIT BUTTON: Calls the handler in App.jsx to load the movie data into the form */}
                        <button
                            onClick={() => onStartEdit(movie)}
                            style={{ marginRight: '10px' }}
                        >
                            Edit
                        </button>

                        {/* DELETE BUTTON: Calls the local delete handler */}
                        <button onClick={() => handleDelete(movie.id, movie.title)}>
                            Delete
                        </button>

                    </div>
                </div>
            ))}
        </div>
    );
}

export default AdminMovieList;