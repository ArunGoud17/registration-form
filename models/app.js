const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');  // Import path module for setting views directory

const app = express();



// Set EJS as the view engine
app.set('view engine', 'ejs');

  // Check where Express is looking for views

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/registrationDB')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error: ', err));

// User schema and model
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: String,
    dob: Date,
    gender: String,
    address: String,
});

const User = mongoose.model('User', userSchema);

// Registration form route
app.get('/', (req, res) => {
    res.render('register');  // Should render 'views/register.ejs'
});

// Handle form submission
app.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword, phone, dob, gender, address, terms } = req.body;

    // Check if all required fields are filled
    if (!name || !email || !password || !confirmPassword || !terms) {
        return res.send('All fields are required');
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.send('Passwords do not match');
    }

    try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            dob,
            gender,
            address,
        });

        // Save the user to the database
        await newUser.save();

        // Redirect to login page after successful registration
        res.redirect('/login');
    } catch (err) {
        res.send('Error saving user to database: ' + err.message);
    }
});

// Login form route
app.get('/login', (req, res) => {
    res.render('login');  // Should render 'views/login.ejs'
});

// Handle login form submission
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.send('Please fill in all fields');
    }

    try {
        // Check if user exists in the database
        const user = await User.findOne({ email });

        if (!user) {
            return res.send('User not found');
        }

        // Compare the entered password with the stored password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send('Invalid credentials');
        }

        res.send('Login successful!');
    } catch (err) {
        res.send('Error during login: ' + err.message);
    }
});

// Start the server
app.listen(8085, () => {
    console.log('Server is running on http://localhost:8085');
});
