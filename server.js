const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;  // Changed from 3001 to 3002

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serves the frontend files in the 'public' directory

// In-memory user storage (for demonstration)
let users = [];

// Route to handle registration
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    
    // Check if the email is already registered
    if (users.find(user => user.email === email)) {
        return res.status(400).json({ msg: "Email already registered." });
    }

    // Store user info (in-memory or could be a database)
    users.push({ name, email, password });
    res.status(200).json({ msg: "Registration successful! Please log in." });
});

// Route to handle login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // Check if the email and password match
    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        return res.status(200).json({ msg: `Welcome back, ${user.name}!` });
    } else {
        return res.status(401).json({ msg: "Invalid email or password." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
