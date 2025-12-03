import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AccountPage.css';

function AccountPage() {
    const { user, isAuthenticated, updateUser } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        fetchBookings();
    }, [isAuthenticated, navigate]);

    const fetchBookings = async () => {
        try {
            const res = await fetch(`/api/users/${user.accountId}/bookings`);
            if (!res.ok) {
                throw new Error('Failed to fetch bookings');
            }
            const data = await res.json();
            setBookings(data);
        } catch (err) {
            console.error("Error fetching bookings:", err);
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            const res = await fetch(`/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accountId: user.accountId
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to cancel booking');
            }

            // Update local state
            setBookings(bookings.filter(b => b.id !== bookingId));

            // Update user context
            const updatedUser = {
                ...user,
                bookings: user.bookings.filter(b => b.id !== bookingId)
            };
            updateUser(updatedUser);

            alert('Booking cancelled successfully!');
        } catch (err) {
            console.error("Error canceling booking:", err);
            alert(err.message || 'Failed to cancel booking');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    if (loading) {
        return (
            <div className="account-page-container">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="account-page-container">
            <div className="account-header">
                <h1>My Account</h1>
                <div className="account-info">
                    <p><strong>Account ID:</strong> {user?.accountId}</p>
                    {user?.isAdmin && <span className="admin-badge">Admin</span>}
                </div>
            </div>

            <div className="bookings-section">
                <h2>My Bookings</h2>

                {error && (
                    <div className="error-message">{error}</div>
                )}

                {bookings.length === 0 ? (
                    <div className="empty-state">
                        <h3>No bookings yet</h3>
                        <p>You haven't booked any movies yet. Browse our selection and book your first movie!</p>
                        <button onClick={() => navigate('/')} className="browse-btn">
                            Browse Movies
                        </button>
                    </div>
                ) : (
                    <div className="bookings-grid">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="booking-card">
                                {booking.movie ? (
                                    <>
                                        <div className="booking-poster">
                                            <img
                                                src={booking.movie.poster_url}
                                                alt={booking.movie.title}
                                            />
                                        </div>
                                        <div className="booking-details">
                                            <h3>{booking.movie.title}</h3>
                                            <div className="booking-info">
                                                <p><strong>Date:</strong> {formatDate(booking.date)}</p>
                                                <p><strong>Time:</strong> {formatTime(booking.time)}</p>
                                                <p><strong>Seats:</strong> {booking.seats}</p>
                                                <p className="booking-id"><strong>Booking ID:</strong> {booking.id}</p>
                                            </div>
                                            <button
                                                onClick={() => handleCancelBooking(booking.id)}
                                                className="cancel-btn"
                                            >
                                                Cancel Booking
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="booking-error">
                                        <p>Movie information not available</p>
                                        <button
                                            onClick={() => handleCancelBooking(booking.id)}
                                            className="cancel-btn"
                                        >
                                            Cancel Booking
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AccountPage;
