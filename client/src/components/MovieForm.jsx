import React, { useState, useEffect } from 'react';
import './MovieForm.css';

function MovieForm({ onMovieChange, movieToEdit, setMovieToEdit }) {

    const initialFormState = {
        title: '',
        poster_url: '',
        rating: 'PG',
        description: '',
        // --- NEW: Add status and release_date to the initial state ---
        status: 'streaming', // Default to 'streaming'
        release_date: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [showtimes, setShowtimes] = useState([{ date: '', times: [''] }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    // Handle Edit Mode
    useEffect(() => {
        if (movieToEdit) {
            // 1. Get the status first, defaulting to 'streaming'
            const movieStatus = movieToEdit.status || 'streaming';

            setFormData({
                title: movieToEdit.title,
                poster_url: movieToEdit.poster_url,
                rating: movieToEdit.rating,
                description: movieToEdit.description || '',
                // Ensure status and release_date are loaded
                status: movieStatus,
                release_date: movieToEdit.release_date || '',
            });

            // 2. Load existing showtimes ONLY if the movie's status is 'streaming'
            if (movieStatus === 'streaming' && movieToEdit.showtimes && movieToEdit.showtimes.length > 0) {
                setShowtimes(movieToEdit.showtimes.map(st => ({
                    date: st.date,
                    // Ensure each date has at least one empty time slot if times array is empty
                    times: st.times.length > 0 ? st.times : ['']
                })));
            } else {
                // If it's an upcoming movie or has no showtimes, reset to one blank entry
                setShowtimes([{ date: '', times: [''] }]);
            }

            setMessage(`Editing: ${movieToEdit.title}`);
        } else {
            // Reset state when not editing
            setFormData(initialFormState);
            setShowtimes([{ date: '', times: [''] }]);
            setMessage('');
        }
    }, [movieToEdit]); // Dependency array remains correct

    // Input Change Handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    // --- Showtimes handlers (remain the same) ---
    const addShowtimeDate = () => {
        setShowtimes([...showtimes, { date: '', times: [''] }]);
    };

    const removeShowtimeDate = (index) => {
        if (showtimes.length > 1) {
            const newShowtimes = showtimes.filter((_, i) => i !== index);
            setShowtimes(newShowtimes);
        }
    };

    const updateShowtimeDate = (index, date) => {
        const newShowtimes = [...showtimes];
        newShowtimes[index].date = date;
        setShowtimes(newShowtimes);
    };

    const addTimeSlot = (showtimeIndex) => {
        const newShowtimes = [...showtimes];
        newShowtimes[showtimeIndex].times.push('');
        setShowtimes(newShowtimes);
    };

    const removeTimeSlot = (showtimeIndex, timeIndex) => {
        const newShowtimes = [...showtimes];
        if (newShowtimes[showtimeIndex].times.length > 1) {
            newShowtimes[showtimeIndex].times = newShowtimes[showtimeIndex].times.filter((_, i) => i !== timeIndex);
            setShowtimes(newShowtimes);
        }
    };

    const updateTimeSlot = (showtimeIndex, timeIndex, value) => {
        const newShowtimes = [...showtimes];
        newShowtimes[showtimeIndex].times[timeIndex] = value;
        setShowtimes(newShowtimes);
    };
    // --- End Showtimes handlers ---

    // Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const method = movieToEdit ? 'PUT' : 'POST';
        const url = movieToEdit ? `/api/movies/${movieToEdit.id}` : '/api/movies';

        // --- NEW: Conditional validation and data structure for API call ---
        let movieToSend = {
            title: formData.title,
            poster_url: formData.poster_url,
            rating: formData.rating,
            description: formData.description,
            status: formData.status,
            // Initialize fields to null/empty so they aren't sent if they shouldn't be
            showtimes: [],
            release_date: null,
        };

        if (formData.status === 'streaming') {
            const validShowtimes = showtimes.filter(st =>
                st.date && st.times.some(t => t.trim() !== '')
            ).map(st => ({
                date: st.date,
                times: st.times.filter(t => t.trim() !== '')
            }));

            if (validShowtimes.length === 0) {
                setMessage('Error: Please add at least one showtime with a date and time for a streaming movie.');
                setIsSubmitting(false);
                return;
            }
            movieToSend.showtimes = validShowtimes;
        } else if (formData.status === 'upcoming') {
            if (!formData.release_date) {
                setMessage('Error: Please enter a release date for an upcoming movie.');
                setIsSubmitting(false);
                return;
            }
            movieToSend.release_date = formData.release_date;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(movieToSend),
            });

            if (response.ok) {
                const result = await response.json();
                const successMsg = method === 'POST'
                    ? `Success! Added movie: ${result.title}`
                    : `Success! Updated movie: ${result.title}`;

                setMessage(successMsg);
                onMovieChange();
                setFormData(initialFormState);
                setShowtimes([{ date: '', times: [''] }]);
                if (movieToEdit) {
                    setMovieToEdit(null);
                }
            } else {
                const errorData = await response.json();
                setMessage(`Error: Failed to ${method === 'POST' ? 'add' : 'update'} movie. ${errorData.message || ''}`);
            }
        } catch (error) {
            setMessage(`Network error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cancel Edit Mode
    const handleCancelEdit = () => {
        setMovieToEdit(null);
    };

    const submitText = isSubmitting
        ? (movieToEdit ? 'Saving Changes...' : 'Adding...')
        : (movieToEdit ? 'Save Changes' : 'Add Movie');

    return (
        <div className="movie-form-container">
            <h3>{movieToEdit ? 'Edit Existing Movie' : 'Add New Movie'}</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div>
                    <label>Poster URL:</label>
                    <input type="text" name="poster_url" value={formData.poster_url} onChange={handleChange} required />
                </div>

                {/* --- NEW: Status Dropdown --- */}
                <div>
                    <label>Status:</label>
                    <select name="status" value={formData.status} onChange={handleChange} required>
                        <option value="streaming">Streaming</option>
                        <option value="upcoming">Upcoming</option>
                    </select>
                </div>
                {/* ----------------------------- */}

                <div>
                    <label>Rating:</label>
                    <select name="rating" value={formData.rating} onChange={handleChange}>
                        <option value="G">G</option>
                        <option value="PG">PG</option>
                        <option value="PG-13">PG-13</option>
                        <option value="R">R</option>
                    </select>
                </div>
                <div>
                    <label>Description (optional):</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                    />
                </div>

                {/* --- NEW: Conditional Rendering for Streaming/Upcoming fields --- */}
                {formData.status === 'streaming' && (
                    <div className="showtimes-section">
                        <label>Showtimes:</label>
                        {showtimes.map((showtime, showtimeIndex) => (
                            <div key={showtimeIndex} className="showtime-group">
                                <div className="showtime-header">
                                    <input
                                        type="date"
                                        value={showtime.date}
                                        onChange={(e) => updateShowtimeDate(showtimeIndex, e.target.value)}
                                        required
                                    />
                                    {showtimes.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-date-btn"
                                            onClick={() => removeShowtimeDate(showtimeIndex)}
                                        >
                                            Remove Date
                                        </button>
                                    )}
                                </div>

                                <div className="times-list">
                                    {showtime.times.map((time, timeIndex) => (
                                        <div key={timeIndex} className="time-input-group">
                                            <input
                                                type="time"
                                                value={time}
                                                onChange={(e) => updateTimeSlot(showtimeIndex, timeIndex, e.target.value)}
                                                required
                                            />
                                            {showtime.times.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="remove-time-btn"
                                                    onClick={() => removeTimeSlot(showtimeIndex, timeIndex)}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="add-time-btn"
                                        onClick={() => addTimeSlot(showtimeIndex)}
                                    >
                                        + Add Time
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="add-date-btn"
                            onClick={addShowtimeDate}
                        >
                            + Add Another Date
                        </button>
                    </div>
                )}

                {formData.status === 'upcoming' && (
                    <div>
                        <label>Release Date:</label>
                        <input
                            type="date"
                            name="release_date"
                            value={formData.release_date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}
                {/* ------------------------------------------------------------- */}

                <button type="submit" disabled={isSubmitting}>
                    {submitText}
                </button>

                {movieToEdit && (
                    <button type="button" onClick={handleCancelEdit} disabled={isSubmitting} style={{ marginTop: '10px', backgroundColor: '#6c757d' }}>
                        Cancel Edit
                    </button>
                )}
            </form>
            {message && <p className={message.startsWith('Success') ? 'success-message' : 'error-message'}>{message}</p>}
        </div>
    );
}

export default MovieForm;