import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MovieDetailPage.css';

function MovieDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, updateUser } = useAuth();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    // Booking state
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [seats, setSeats] = useState(1);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingMessage, setBookingMessage] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);

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

                // Set first available showtime as default
                if (foundMovie?.showtimes?.length > 0) {
                    setSelectedDate(foundMovie.showtimes[0].date);
                    if (foundMovie.showtimes[0].times?.length > 0) {
                        setSelectedTime(foundMovie.showtimes[0].times[0]);
                    }
                }
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

    // Get available times for selected date
    const getTimesForDate = (date) => {
        const showtime = movie?.showtimes?.find(s => s.date === date);
        return showtime?.times || [];
    };

    // Handle booking
    const handleBooking = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!selectedDate || !selectedTime) {
            setBookingMessage('Please select a date and time');
            return;
        }

        setBookingLoading(true);
        setBookingMessage('');

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accountId: user.accountId,
                    movieId: movie.id,
                    date: selectedDate,
                    time: selectedTime,
                    seats: seats
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setBookingMessage(data.message || 'Booking failed');
                return;
            }

            // Update user context with new booking
            const updatedUser = {
                ...user,
                bookings: [...(user.bookings || []), data.booking]
            };
            updateUser(updatedUser);

            setShowConfirmation(true);
            setBookingMessage('');
        } catch (err) {
            console.error("Error creating booking:", err);
            setBookingMessage('Error creating booking. Please try again.');
        } finally {
            setBookingLoading(false);
        }
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

            {showConfirmation && (
                <div className="booking-confirmation">
                    <div className="confirmation-content">
                        <h2>🎉 Booking Confirmed!</h2>
                        <p>Your tickets have been booked successfully.</p>
                        <div className="confirmation-details">
                            <p><strong>Movie:</strong> {movie.title}</p>
                            <p><strong>Date:</strong> {formatDate(selectedDate)}</p>
                            <p><strong>Time:</strong> {formatTime(selectedTime)}</p>
                            <p><strong>Seats:</strong> {seats}</p>
                        </div>
                        <div className="confirmation-buttons">
                            <button onClick={() => navigate('/account')} className="view-bookings-btn">
                                View My Bookings
                            </button>
                            <button onClick={() => setShowConfirmation(false)} className="close-confirmation-btn">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

                    {/* Booking Section */}
                    {movie.showtimes && movie.showtimes.length > 0 && (
                        <div className="booking-section">
                            <h3>Book Tickets</h3>

                            <div className="booking-form">
                                {/* Date Selection */}
                                <div className="form-group">
                                    <label htmlFor="date-select">Select Date:</label>
                                    <select
                                        id="date-select"
                                        value={selectedDate}
                                        onChange={(e) => {
                                            setSelectedDate(e.target.value);
                                            const times = getTimesForDate(e.target.value);
                                            setSelectedTime(times[0] || '');
                                        }}
                                        className="booking-select"
                                    >
                                        {movie.showtimes.map((showtime, index) => (
                                            <option key={index} value={showtime.date}>
                                                {formatDate(showtime.date)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Time Selection */}
                                <div className="form-group">
                                    <label htmlFor="time-select">Select Time:</label>
                                    <div className="time-buttons">
                                        {getTimesForDate(selectedDate).map((time, index) => (
                                            <button
                                                key={index}
                                                className={`time-button ${selectedTime === time ? 'selected' : ''}`}
                                                onClick={() => setSelectedTime(time)}
                                            >
                                                {formatTime(time)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Seats Selection */}
                                <div className="form-group">
                                    <label htmlFor="seats-select">Number of Seats:</label>
                                    <div className="seats-selector">
                                        <button
                                            className="seats-btn"
                                            onClick={() => setSeats(Math.max(1, seats - 1))}
                                            disabled={seats <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="seats-count">{seats}</span>
                                        <button
                                            className="seats-btn"
                                            onClick={() => setSeats(Math.min(10, seats + 1))}
                                            disabled={seats >= 10}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {bookingMessage && (
                                    <p className="booking-error">{bookingMessage}</p>
                                )}

                                {/* Book Button */}
                                <button
                                    className="book-now-btn"
                                    onClick={handleBooking}
                                    disabled={bookingLoading || !selectedDate || !selectedTime}
                                >
                                    {bookingLoading ? 'Booking...' : (isAuthenticated ? 'Book Now' : 'Login to Book')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Showtimes Display */}
                    <div className="movie-showtimes">
                        <h3>All Showtimes</h3>
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