const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3002;  // Changed from 3001 to 3002
const JWT_SECRET = 'your_jwt_secret_key';  // Change this to a secure key
const MONGO_URI = 'mongodb://localhost:27017/mydatabase';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Define User schema and model
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

// Route to handle registration
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "Email already registered." });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(200).json({ msg: "Registration successful! Please log in." });
    } catch (err) {
        res.status(500).json({ msg: "Error registering user.", error: err.message });
    }
});

// Route to handle login with JWT token generation
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password });
        if (user) {
            // Generate JWT token
            const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({ msg: `Welcome back, ${user.name}!`, token });
        } else {
            return res.status(401).json({ msg: "Invalid email or password." });
        }
    } catch (err) {
        res.status(500).json({ msg: "Error logging in.", error: err.message });
    }
});

// Protected route (example of JWT token verification)
app.get('/profile', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ msg: "No token provided." });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).json({ msg: "Failed to authenticate token." });
        }

        res.status(200).json({ msg: `Hello, ${decoded.name}. This is your profile.` });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
