import React, { useState } from 'react';
import './AdminMovieList.css';

function AdminMovieList({ movies, onMovieChange, onStartEdit }) {
    // State to manage active tab (default to streaming)
    const [activeTab, setActiveTab] = useState('streaming');

    // Helper function to format date (unchanged)
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Helper function to format time (unchanged)
    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Delete Handler (unchanged)
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

    // Filter the movies for the tab counts
    const streamingMovies = movies.filter(movie => movie.status !== 'upcoming');
    const upcomingMovies = movies.filter(movie => movie.status === 'upcoming');

    // Select the list to display based on the active tab
    const filteredMovies = activeTab === 'streaming' ? streamingMovies : upcomingMovies;

    // Handle case where there are no movies
    if (!movies || movies.length === 0) {
        return (
            <div className="movie-list-container">
                <p>No movies in the catalog yet.</p>
            </div>
        );
    }

    return (
        <div className="movie-list-container">
            {/* REMOVED: <h2>Admin Movie Catalog</h2> */}

            {/* Tab Navigation with counts */}
            <div className="tab-navigation">
                <button
                    className={activeTab === 'streaming' ? 'active-tab' : ''}
                    onClick={() => setActiveTab('streaming')}
                >
                    Streaming Now ({streamingMovies.length})
                </button>
                <button
                    className={activeTab === 'upcoming' ? 'active-tab' : ''}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming ({upcomingMovies.length})
                </button>
            </div>

            {filteredMovies.length === 0 && (
                <p className="no-movies-message">
                    No {activeTab === 'streaming' ? 'streaming' : 'upcoming'} movies in the catalog.
                </p>
            )}

            {filteredMovies.map(movie => (
                <div key={movie.id} className="movie-card">

                    <img
                        src={movie.poster_url}
                        alt={`Poster for ${movie.title}`}
                    />

                    <div className="movie-details">
                        <h3>{movie.title} ({movie.rating})</h3>

                        {/* Only show tickets booked for 'streaming' movies */}
                        {activeTab === 'streaming' && (
                            <p className="tickets-booked-info">
                                <strong>Tickets Booked: </strong>
                                {(movie.ticketsBooked || 0).toLocaleString()} tickets
                            </p>
                        )}

                        {movie.description && (
                            <p className="movie-description-preview">
                                {movie.description.length > 150
                                    ? `${movie.description.substring(0, 150)}...`
                                    : movie.description}
                            </p>
                        )}

                        <div className="showtimes-section">
                            {/* NEW CONDITIONAL BLOCK: Show showtimes for streaming, release date for upcoming */}
                            {activeTab === 'streaming' ? (
                                <>
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
                                </>
                            ) : (
                                <>
                                    <h4>Release Date:</h4>
                                    <p className="release-date-info">
                                        {movie.release_date ? formatDate(movie.release_date) : 'TBA'}
                                    </p>
                                </>
                            )}
                            {/* END CONDITIONAL BLOCK */}
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