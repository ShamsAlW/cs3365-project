import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MovieList.css';

function MovieList({ movies }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('streaming');

    // Filter movies based on the active tab
    const filteredMovies = movies.filter(movie => movie.status === activeTab);

    // Handle movie click (remains the same)
    const handleMovieClick = (movieId) => {
        navigate(`/movie/${movieId}`);
    };

    // Handle case where there are no movies AT ALL
    if (!movies || movies.length === 0) {
        return (
            <div className="public-movie-list-container">
                <h2>Movie Catalog</h2>
                <p style={{ color: '#ccc' }}>No results found.</p>
            </div>
        );
    }

    return (
        <div className="public-movie-list-container">

            {/* NEW: Tab Navigation now replaces the H2 header */}
            <div className="tab-navigation main-tabs">
                <button
                    className={`tab-btn large-tab ${activeTab === 'streaming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('streaming')}
                >
                    Streaming Now
                </button>
                <button
                    className={`tab-btn large-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Coming Soon
                </button>
            </div>
            {/* END NEW TAB STRUCTURE */}

            {/* Conditional Rendering for the List */}
            {filteredMovies.length === 0 ? (
                <div className="no-movies-message-public">
                    {activeTab === 'streaming'
                        ? <p>No results found in Streaming.</p>
                        : <p>No results found in Upcoming.</p>
                    }
                </div>
            ) : (
                <div className="movie-grid">
                    {filteredMovies.map(movie => (
                        <div
                            key={movie.id}
                            className="public-movie-card"
                            onClick={() => handleMovieClick(movie.id)}
                        >
                            <img
                                src={movie.poster_url}
                                alt={`Poster for ${movie.title}`}
                            />
                            <div className="public-movie-title">
                                <h3>{movie.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MovieList;