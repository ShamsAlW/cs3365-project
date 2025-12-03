const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data', 'movies.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// ------------ Middleware Setup ------------
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

// Function to read users from the JSON file
const readUsers = () => {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log('Users file not found. Starting with an empty user list.');
            // Create the data directory if it doesn't exist
            const dataDir = path.join(__dirname, 'data');
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
        } else {
            console.error('Error reading user data:', err);
        }
        return [];
    }
};

// Function to write users back to the JSON file
const writeUsers = (users) => {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
};

// ------------ Authentication Endpoints ------------

// REGISTER: Create a new user account (POST /api/auth/register)
app.post('/api/auth/register', async (req, res) => {
    const { accountId, password } = req.body;

    // Validate input
    if (!accountId || !password) {
        return res.status(400).json({ message: 'Account ID and password are required' });
    }

    if (accountId.length < 3) {
        return res.status(400).json({ message: 'Account ID must be at least 3 characters' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const users = readUsers();

    // Check if account ID already exists
    if (users.find(u => u.accountId.toLowerCase() === accountId.toLowerCase())) {
        return res.status(409).json({ message: 'Account ID already exists' });
    }

    try {

        // Create new user
        const newUser = {
            accountId,
            password,
            isAdmin: false,
            bookings: [] // Array of { movieId, date, time }
        };

        users.push(newUser);
        writeUsers(users);

        // Return user without password
        const userResponse = {
            accountId: newUser.accountId,
            isAdmin: newUser.isAdmin,
            bookings: newUser.bookings
        };

        res.status(201).json({
            message: 'Account created successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ message: 'Error creating account' });
    }
});

// LOGIN: Authenticate a user (POST /api/auth/login)
app.post('/api/auth/login', async (req, res) => {
    const { accountId, password } = req.body;

    // Validate input
    if (!accountId || !password) {
        return res.status(400).json({ message: 'Account ID and password are required' });
    }

    const users = readUsers();

    // Find user
    const user = users.find(u => u.accountId.toLowerCase() === accountId.toLowerCase());

    if (!user) {
        return res.status(401).json({ message: 'Invalid account ID or password' });
    }

    try {
        // Compare passwords
        const isValidPassword = (password === user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid account ID or password' });
        }

        // Return user without password
        const userResponse = {
            accountId: user.accountId,
            isAdmin: user.isAdmin,
            bookings: user.bookings
        };

        res.json({
            message: 'Login successful',
            user: userResponse
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});

// GET USER: Get user data by account ID (GET /api/users/:accountId)
app.get('/api/users/:accountId', (req, res) => {
    const { accountId } = req.params;
    const users = readUsers();

    const user = users.find(u => u.accountId === accountId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Return user without password
    const userResponse = {
        accountId: user.accountId,
        isAdmin: user.isAdmin,
        bookings: user.bookings
    };

    res.json(userResponse);
});

// ------------ Movie API Endpoints ------------

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
    res.status(204).send();
});

// ------------ Booking API Endpoints ------------

// CREATE BOOKING: Book a movie ticket (POST /api/bookings)
app.post('/api/bookings', (req, res) => {
    const { accountId, movieId, date, time, seats } = req.body;

    // Validate input
    if (!accountId || !movieId || !date || !time || !seats) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (seats < 1 || seats > 10) {
        return res.status(400).json({ message: 'Seats must be between 1 and 10' });
    }

    const users = readUsers();
    const movies = readMovies();

    // Find user
    const userIndex = users.findIndex(u => u.accountId === accountId);
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Verify movie exists
    const movie = movies.find(m => m.id === movieId);
    if (!movie) {
        return res.status(404).json({ message: 'Movie not found' });
    }

    // Generate unique booking ID
    const bookingId = 'b' + Date.now();

    // Create booking object
    const newBooking = {
        id: bookingId,
        movieId,
        date,
        time,
        seats,
        bookedAt: new Date().toISOString()
    };

    // Add booking to user's bookings array
    if (!users[userIndex].bookings) {
        users[userIndex].bookings = [];
    }
    users[userIndex].bookings.push(newBooking);

    // Save updated users
    writeUsers(users);

    res.status(201).json({
        message: 'Booking successful',
        booking: newBooking
    });
});

// GET USER BOOKINGS: Get all bookings for a user with movie details (GET /api/users/:accountId/bookings)
app.get('/api/users/:accountId/bookings', (req, res) => {
    const { accountId } = req.params;
    const users = readUsers();
    const movies = readMovies();

    const user = users.find(u => u.accountId === accountId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Enrich bookings with movie details
    const enrichedBookings = (user.bookings || []).map(booking => {
        const movie = movies.find(m => m.id === booking.movieId);
        return {
            ...booking,
            movie: movie || null
        };
    });

    res.json(enrichedBookings);
});

// CANCEL BOOKING: Delete a booking (DELETE /api/bookings/:bookingId)
app.delete('/api/bookings/:bookingId', (req, res) => {
    const { bookingId } = req.params;
    const { accountId } = req.body;

    if (!accountId) {
        return res.status(400).json({ message: 'Account ID is required' });
    }

    const users = readUsers();
    const userIndex = users.findIndex(u => u.accountId === accountId);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }

    const user = users[userIndex];
    const initialLength = user.bookings ? user.bookings.length : 0;

    // Remove the booking
    users[userIndex].bookings = (user.bookings || []).filter(b => b.id !== bookingId);

    if (users[userIndex].bookings.length === initialLength) {
        return res.status(404).json({ message: 'Booking not found' });
    }

    writeUsers(users);
    res.json({ message: 'Booking cancelled successfully' });
});

// ------------ Server Start ------------
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});