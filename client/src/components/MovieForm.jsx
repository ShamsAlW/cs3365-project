import React, { useState, useEffect } from 'react';
import './MovieForm.css';

function MovieForm({ onMovieChange, movieToEdit, setMovieToEdit }) {

    const initialFormState = {
        title: '',
        poster_url: '',
        rating: 'PG',
        description: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [showtimes, setShowtimes] = useState([{ date: '', times: [''] }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    // Handle Edit Mode
    useEffect(() => {
        if (movieToEdit) {
            setFormData({
                title: movieToEdit.title,
                poster_url: movieToEdit.poster_url,
                rating: movieToEdit.rating,
                description: movieToEdit.description || '',
            });

            // Load existing showtimes
            if (movieToEdit.showtimes && movieToEdit.showtimes.length > 0) {
                setShowtimes(movieToEdit.showtimes.map(st => ({
                    date: st.date,
                    times: st.times.length > 0 ? st.times : ['']
                })));
            } else {
                setShowtimes([{ date: '', times: [''] }]);
            }

            setMessage(`Editing: ${movieToEdit.title}`);
        } else {
            setFormData(initialFormState);
            setShowtimes([{ date: '', times: [''] }]);
            setMessage('');
        }
    }, [movieToEdit]);

    // Input Change Handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Add new showtime date
    const addShowtimeDate = () => {
        setShowtimes([...showtimes, { date: '', times: [''] }]);
    };

    // Remove showtime date
    const removeShowtimeDate = (index) => {
        if (showtimes.length > 1) {
            const newShowtimes = showtimes.filter((_, i) => i !== index);
            setShowtimes(newShowtimes);
        }
    };

    // Update date for a specific showtime
    const updateShowtimeDate = (index, date) => {
        const newShowtimes = [...showtimes];
        newShowtimes[index].date = date;
        setShowtimes(newShowtimes);
    };

    // Add time slot to a specific showtime
    const addTimeSlot = (showtimeIndex) => {
        const newShowtimes = [...showtimes];
        newShowtimes[showtimeIndex].times.push('');
        setShowtimes(newShowtimes);
    };

    // Remove time slot from a specific showtime
    const removeTimeSlot = (showtimeIndex, timeIndex) => {
        const newShowtimes = [...showtimes];
        if (newShowtimes[showtimeIndex].times.length > 1) {
            newShowtimes[showtimeIndex].times = newShowtimes[showtimeIndex].times.filter((_, i) => i !== timeIndex);
            setShowtimes(newShowtimes);
        }
    };

    // Update specific time slot
    const updateTimeSlot = (showtimeIndex, timeIndex, value) => {
        const newShowtimes = [...showtimes];
        newShowtimes[showtimeIndex].times[timeIndex] = value;
        setShowtimes(newShowtimes);
    };

    // Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate showtimes
        const validShowtimes = showtimes.filter(st =>
            st.date && st.times.some(t => t.trim() !== '')
        ).map(st => ({
            date: st.date,
            times: st.times.filter(t => t.trim() !== '')
        }));

        if (validShowtimes.length === 0) {
            setMessage('Error: Please add at least one showtime with a date and time.');
            setIsSubmitting(false);
            return;
        }

        const method = movieToEdit ? 'PUT' : 'POST';
        const url = movieToEdit ? `/api/movies/${movieToEdit.id}` : '/api/movies';

        const movieToSend = {
            title: formData.title,
            poster_url: formData.poster_url,
            rating: formData.rating,
            description: formData.description,
            showtimes: validShowtimes,
        };

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
            } else {
                setMessage(`Error: Failed to ${method === 'POST' ? 'add' : 'update'} movie.`);
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