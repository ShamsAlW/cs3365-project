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

    // Review State
    const [reviews, setReviews] = useState([]);
    const [newReviewText, setNewReviewText] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewMessage, setReviewMessage] = useState('');

    const fetchReviews = async (movieId) => {
        try {
            // Fetch reviews (same endpoint as before)
            const reviewsRes = await fetch(`/api/reviews?movieId=${movieId}`);
            if (reviewsRes.ok) {
                const reviewData = await reviewsRes.json();
                setReviews(reviewData);
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
        }
    }

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

                if (foundMovie?.showtimes?.length > 0) {
                    setSelectedDate(foundMovie.showtimes[0].date);
                    if (foundMovie.showtimes[0].times?.length > 0) {
                        setSelectedTime(foundMovie.showtimes[0].times[0]);
                    }
                }
            } catch (err) {
                console.error("Error fetching movie details:", err);
            }

            // Call review fetch function
            await fetchReviews(id);

            setLoading(false);
        };

        fetchMovieDetail();
    }, [id]);

    // Helper functions
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + userTimezoneOffset);

        return adjustedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getTimesForDate = (date) => {
        const showtime = movie?.showtimes?.find(s => s.date === date);
        return showtime?.times || [];
    };

    // Handle booking (omitted for brevity)
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

    // Updated handleReviewSubmit in MovieDetailPage.jsx
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setReviewMessage('You must be logged in to submit a review.');
            return;
        }
        if (newReviewText.trim() === '') {
            setReviewMessage('Review cannot be empty.');
            return;
        }

        setReviewLoading(true);
        setReviewMessage('');

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accountId: user.accountId,
                    movieId: movie.id,
                    text: newReviewText,
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setReviewMessage(data.message || 'Failed to submit review.');
                return;
            }

            // 1. Clear the input box (Keep this)
            setNewReviewText('');

            // 2. Add the new review to the beginning of the reviews list (Keep this for live update)
            setReviews(prevReviews => [data, ...prevReviews]);

        } catch (err) {
            setReviewMessage('Network error submitting review.');
            console.error(err);
        } finally {
            setReviewLoading(false);
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

    const isUpcoming = movie.status === 'upcoming';

    return (
        <div className="movie-detail-container">
            <button className="back-button" onClick={() => navigate('/')}>
                ← Back to Movies
            </button>

            {showConfirmation && (
                <div className="booking-confirmation">
                    {/* Confirmation Modal JSX (omitted for brevity) */}
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

                    {/* Content for Upcoming Movies (Release Date) */}
                    {isUpcoming && (
                        <div className="upcoming-info-section">
                            <h3>Anticipated Release Date</h3>
                            <p className="release-date-display">
                                {formatDate(movie.release_date || 'N/A')}
                            </p>
                            <p className="release-message">
                                This movie is **Coming Soon!** Showtimes and ticket booking will be available closer to the release date.
                            </p>
                        </div>
                    )}

                    {/* Booking Section - Only for Streaming */}
                    {!isUpcoming && movie.showtimes && movie.showtimes.length > 0 && (
                        <div className="booking-section">
                            <h3>Book Tickets</h3>

                            <div className="booking-form">
                                {/* Date Selection (omitted for brevity) */}
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

                                {/* Time Selection (omitted for brevity) */}
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

                                {/* Seats Selection (omitted for brevity) */}
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

                    {/* NEW: Review Section */}
                    <div className="review-section">
                        <h3>User Reviews</h3>

                        {/* Review Submission Form (Conditional) */}
                        {isAuthenticated ? (
                            <form onSubmit={handleReviewSubmit} className="review-form">
                                <textarea
                                    value={newReviewText}
                                    onChange={(e) => setNewReviewText(e.target.value)}
                                    placeholder="Write your review here (max 500 characters)..."
                                    rows="4"
                                    maxLength="500"
                                    disabled={reviewLoading}
                                    required
                                />
                                <button type="submit" disabled={reviewLoading}>
                                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                                </button>
                                {reviewMessage && (
                                    <p className={reviewMessage.includes('successfully') ? 'success-message' : 'error-message'}>
                                        {reviewMessage}
                                    </p>
                                )}
                            </form>
                        ) : (
                            <p className="login-prompt">
                                <button onClick={() => navigate('/login')} className="login-button-review">
                                    Login
                                </button>
                                to write a review.
                            </p>
                        )}

                        {/* Display Existing Reviews */}
                        {reviews.length > 0 ? (
                            <div className="reviews-list">
                                {reviews.map((review, index) => (
                                    <div key={review.id || index} className="review-card">
                                        <p className="review-header">
                                            <span className="reviewer-name">
                                                {review.user?.username || 'Anonymous User'}
                                            </span>
                                            <span className="review-date">
                                                {review.timestamp ? formatDate(review.timestamp) : 'N/A'}
                                            </span>
                                        </p>
                                        <p className="review-text">{review.text}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-reviews">Be the first to leave a review!</p>
                        )}
                    </div>
                    {/* END NEW: Review Section */}
                </div>
            </div>
        </div>
    );
}

export default MovieDetailPage;