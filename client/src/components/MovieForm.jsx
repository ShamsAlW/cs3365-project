import React, { useState, useEffect } from 'react';
import './MovieForm.css';

// We receive onMovieChange (to refresh list), movieToEdit (data), and setMovieToEdit (to cancel edit mode)
function MovieForm({ onMovieChange, movieToEdit, setMovieToEdit }) {

    const initialFormState = {
        title: '',
        poster_url: '',
        rating: 'PG',
        showtimes: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    // Handle Edit Mode
    useEffect(() => {
        if (movieToEdit) {
            // If editing, pre-fill the form with the movie data
            const currentShowtimes = movieToEdit.showtimes
            && movieToEdit.showtimes.length > 0
                ? movieToEdit.showtimes[0].times.join(', ')
                : '';

            setFormData({
                title: movieToEdit.title,
                poster_url: movieToEdit.poster_url,
                rating: movieToEdit.rating,
                showtimes: currentShowtimes,
            });
            setMessage(`Editing: ${movieToEdit.title}`);
        } else {
            // If not editing, clear the form
            setFormData(initialFormState);
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

    // Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Determine the method (POST for new, PUT for existing)
        const method = movieToEdit ? 'PUT' : 'POST';
        const url = movieToEdit ? `/api/movies/${movieToEdit.id}` : '/api/movies';

        // Data structure conversion (simplified: assuming all times are for today)
        const showtimesArray = formData.showtimes.split(',').map(time => time.trim());
        const structuredShowtimes = [{
            // For editing, keep the existing date structure; for new, use today
            date: movieToEdit && movieToEdit.showtimes.length > 0
                ? movieToEdit.showtimes[0].date
                : new Date().toISOString().split('T')[0],
            times: showtimesArray.filter(t => t !== '')
        }];

        const movieToSend = {
            title: formData.title,
            poster_url: formData.poster_url,
            rating: formData.rating,
            showtimes: structuredShowtimes,
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
                onMovieChange(); // Refreshes the list and clears movieToEdit in App.jsx
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
        setMovieToEdit(null); // Clear the movieToEdit state in App.jsx
    };

    // Render
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
                    <label>Showtimes:</label>
                    <input type="text" name="showtimes" value={formData.showtimes} onChange={handleChange} required />
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