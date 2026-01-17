require('dotenv').config({path: './config.env'}); // Environment variables
const express = require('express');
const morgan = require('morgan');
const path = require('path');

const cookieParser = require('cookie-parser');
const session = require('express-session');

// Import Database Check
const db = require('./config/dbconnection');

const app = express();
const PORT = process.env.PORT || 3000;

const publicRoutes = require('./routes/publicRoutes');

// 1. Middleware
app.use(morgan('tiny'));
// Parse incoming form data (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));
// Parse incoming JSON data
app.use(express.json());
// Serve static files (CSS, Images) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

app.use((req, res, next) => {
    res.locals.isloggedin = req.session.isloggedin || false;
    res.locals.role = req.session.role;
    next();
});

// 2. View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 3. Routes
app.use('/', publicRoutes)

// 4. Server Start
// DB connection test before starting the server
const startServer = async () => {
    try {
        // Simple query to test DB connection
        await db.query('SELECT 1');
        console.log('Database connected successfully');
        
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1); // Stop the app if DB is dead
    }
};

startServer();