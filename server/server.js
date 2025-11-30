const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data', 'movies.json');

// Middleware Setup
app.use(cors());
app.use(bodyParser.json());

// Function to read and parse movie data from the JSON file
const readMovies = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // If the file is missing or corrupted, start with an empty array
        if (err.code === 'ENOENT') {
            console.log('Data file not found. Starting with an empty catalog.');
        } else {
            console.error('Error reading movie data:', err);
        }
        return [];
    }
};

// Function to write movie data back to the JSON file
const writeMovies = (movies) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(movies, null, 2), 'utf8');
};

// API Endpoints (CRUD)

// READ: Get all movies (GET /api/movies)
app.get('/api/movies', (req, res) => {
    const movies = readMovies();
    res.json(movies);
});

// CREATE: Add a new movie (POST /api/movies)
app.post('/api/movies', (req, res) => {
    const newMovieDetails = req.body;
    const movies = readMovies();

    // Generate ID
    const newId = 'm' + Date.now();
    const newMovie = { id: newId, ...newMovieDetails };

    movies.push(newMovie);
    writeMovies(movies);

    // 201 Created is the standard response status
    res.status(201).json(newMovie);
});

// UPDATE: Edit an existing movie (PUT /api/movies/:id)
app.put('/api/movies/:id', (req, res) => {
    const movieId = req.params.id;
    const updatedDetails = req.body;
    let movies = readMovies();

    const movieIndex = movies.findIndex(m => m.id === movieId);

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' });
    }

    movies[movieIndex] = { ...movies[movieIndex], ...updatedDetails, id: movieId };
    writeMovies(movies);

    res.json(movies[movieIndex]);
});

// DELETE: Remove a movie (DELETE /api/movies/:id)
app.delete('/api/movies/:id', (req, res) => {
    const movieId = req.params.id;
    let movies = readMovies();

    const initialLength = movies.length;
    movies = movies.filter(m => m.id !== movieId);

    if (movies.length === initialLength) {
        return res.status(404).json({ message: 'Movie not found' });
    }

    writeMovies(movies);
    // 204 No Content is the standard status for a successful DELETE
    res.status(204).send();
});

// Server Start
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Remember to keep your React client running too!');
});