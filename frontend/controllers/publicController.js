const db = require('../config/dbconnection');

const axios = require('axios');

// Get home page
exports.getHomePage = (req, res) => {
    res.render('index', { title: 'SoleTraders.co.uk' });
};

// Get all traders
exports.getAllTraders = async (req, res) => {
    try {
        const [traders] = await db.query('SELECT tp.*, u.full_name FROM trader_profiles tp LEFT JOIN users u ON tp.user_id = u.id');

        res.render('public-directory', { 
            title: 'Trader Directory',
            traders: traders 
        });

    } catch (err) {
        console.error('Error fetching traders:', err);
        res.status(500).send('Server Error.');
    }
};

// Get trader profile
exports.getTraderProfile = async (req, res) => {
    
    try {
        
        const traderId = req.params.id;

        const tp_query = `
        SELECT tp.*, u.full_name 
        FROM trader_profiles tp 
        LEFT JOIN users u ON tp.user_id = u.id 
        WHERE tp.user_id = ?
        `;
        
        const [traderResults] = await db.query(tp_query, [traderId]);
        const trader = traderResults[0];

        if (!trader) {
            return res.status(404).send('Trader not found.');
        }

        const [services] = await db.query('SELECT * FROM services WHERE trader_user_id = ?', [traderId]);

        res.render('public-trader-profile', {
            title: `${trader.full_name} - Profile`,
            trader: trader,
            services: services,
        })

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error.');
    }

};

// Get booking page
exports.getBookingPage = async (req, res) => {
    
    try {

        if (req.session.user && req.session.user.role === 'Trader') {
            return res.redirect('/');
        }

        const serviceId = req.params.id;

        const query = `
            SELECT s.*, u.full_name as trader_name
            FROM services s 
            LEFT JOIN users u ON s.trader_user_id = u.id 
            WHERE s.id = ?
        `;

        const [results] = await db.query(query, [serviceId]);
        const service = results[0];

        if (!service) {
            return res.status(404).send('Service not found.');
        }

        res.render('public-book-service', {
            title: 'Book Service',
            service: service,
            trader: {id: service.trader_user_id, name: service.trader_name},
        })
            
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error.');
    }
};

// Create booking / send to database
exports.createBooking = async (req, res) => {
    
    try {

        const serviceId = req.params.id;

        let {client_user_id, client_name, client_email, job_date, job_start_time, job_description} = req.body;
        // converting to null again
        client_user_id = client_user_id === '' ? null : client_user_id;

        const query = `
        INSERT INTO bookings
        (service_id, client_user_id, client_name, client_email, job_date, job_start_time, job_description, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
        `;

        await db.query(query, [serviceId, client_user_id, client_name, client_email, job_date, job_start_time, job_description]);

        res.locals.successfulMessage = 'Booking Successful.';

        return exports.getBookingPage(req, res);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error.');
    }
}

// Get register page
exports.getRegisterPage = (req, res) => {
    

    try {

        if (!req.session.isloggedin || req.session.role === 'Admin') {
            res.render('public-register'); 
        } else {
            return res.redirect('/');
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error.');
    }
};

// Post register page
exports.postRegisterPage = async (req, res) => {


    try {

        const { useremail, userpass, username, userfullname, userrole } = req.body;

        const query = `
        INSERT INTO users
        (username, email, full_name, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
        `;

        await db.query(query, [username, useremail, userfullname, userpass, userrole])

        req.session.message = {
        type: 'is-success',
        text: 'Registered Successfully. You can now log into your account.',
    };

        // Forcing the session save to display the message
        req.session.save(err => {
            if (err) {
                console.error(err);
                return res.status(500).send('Session save error');
            }
            return res.redirect('/login');
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error.');
    }
};

// // get error page
// exports.get404Page = (req, res) => {
//     res.status(404).render('errorPageCatchAll', { 
//         title: 'Page Not Found' 
//     });
// };