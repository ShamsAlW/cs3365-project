import React from 'react';
import './AdminMovieList.css';

function AdminMovieList({ movies, onMovieChange, onStartEdit }) {

    // Helper function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Helper function to format time to 12-hour format
    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Delete Handler
    const handleDelete = async (movieId, movieTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${movieTitle}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/movies/${movieId}`, {
                method: 'DELETE',
            });

            if (response.status === 204) {
                onMovieChange();
                console.log(`Successfully deleted movie ID: ${movieId}`);
            } else {
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

                        {movie.description && (
                            <p className="movie-description-preview">
                                {movie.description.length > 150
                                    ? `${movie.description.substring(0, 150)}...`
                                    : movie.description}
                            </p>
                        )}

                        <div className="showtimes-section">
                            <h4>Showtimes:</h4>
                            {movie.showtimes && movie.showtimes.length > 0 ? (
                                <div className="showtimes-list">
                                    {movie.showtimes.map((showtime, index) => (
                                        <div key={index} className="showtime-item">
                                            <span className="showtime-date">
                                                {formatDate(showtime.date)}:
                                            </span>
                                            <span className="showtime-times">
                                                {showtime.times.map(time => formatTime(time)).join(', ')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No showtimes available</p>
                            )}
                        </div>

                        <div className="action-buttons">
                            <button
                                className="edit-btn"
                                onClick={() => onStartEdit(movie)}
                            >
                                Edit
                            </button>

                            <button
                                className="delete-btn"
                                onClick={() => handleDelete(movie.id, movie.title)}
                            >
                                Delete
                            </button>
                        </div>

                    </div>
                </div>
            ))}
        </div>
    );
}

export default AdminMovieList;