import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MovieDetailPage.css';

function MovieDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovieDetail = async () => {
            try {
                const res = await fetch('/api/movies');
                if (!res.ok) {
                    console.error("Failed to fetch movies. Status:", res.status);
                    return;
                }
                const data = await res.json();
                const foundMovie = data.find(m => m.id === id);
                setMovie(foundMovie);
            } catch (err) {
                console.error("Error fetching movie details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetail();
    }, [id]);

    // Helper function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
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

    if (loading) {
        return (
            <div className="movie-detail-container">
                <p>Loading...</p>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="movie-detail-container">
                <h2>Movie Not Found</h2>
                <button onClick={() => navigate('/')}>Back to Home</button>
            </div>
        );
    }

    return (
        <div className="movie-detail-container">
            <button className="back-button" onClick={() => navigate('/')}>
                ← Back to Movies
            </button>

            <div className="movie-detail-content">
                <div className="movie-detail-poster">
                    <img
                        src={movie.poster_url}
                        alt={`Poster for ${movie.title}`}
                    />
                </div>

                <div className="movie-detail-info">
                    <h1>{movie.title}</h1>
                    <p className="movie-rating">
                        <span className="rating-badge">{movie.rating}</span>
                    </p>

                    {movie.description && (
                        <div className="movie-description">
                            <h3>Description</h3>
                            <p>{movie.description}</p>
                        </div>
                    )}

                    <div className="movie-showtimes">
                        <h3>Showtimes</h3>
                        {movie.showtimes && movie.showtimes.length > 0 ? (
                            <div className="showtimes-list">
                                {movie.showtimes.map((showtime, index) => (
                                    <div key={index} className="showtime-card">
                                        <div className="showtime-date-header">
                                            {formatDate(showtime.date)}
                                        </div>
                                        <div className="showtime-times-grid">
                                            {showtime.times.map((time, timeIndex) => (
                                                <div key={timeIndex} className="time-badge">
                                                    {formatTime(time)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No showtimes available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MovieDetailPage;