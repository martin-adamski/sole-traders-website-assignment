const db = require('../config/dbconnection');

// Get all traders
exports.getAllTraders = async (req, res) => {
    try {
        const [traders] = await db.query('SELECT tp.*, u.full_name FROM trader_profiles tp LEFT JOIN users u ON tp.user_id = u.id');

        return res.status(200).json({
            status: 'success',
            result: {
                title: 'Trader Directory',
                traders: traders
            }
        });

    } catch (err) {
        console.error("API Error: ", err);
        return res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    };
};

// Get trader profile
exports.getTraderProfile = async (req, res) => {
    
    try {
        const traderId = req.params.id;

        if (!traderId) {
            return res.status(400).json({
                status: 'failure',
                message: 'Trader ID is required'
            });
        };

        const tp_query = `
        SELECT tp.*, u.full_name 
        FROM trader_profiles tp 
        LEFT JOIN users u ON tp.user_id = u.id 
        WHERE tp.user_id = ?
        `;
        
        const [traderResults] = await db.query(tp_query, [traderId]);
        const trader = traderResults[0];

        const [services] = await db.query('SELECT * FROM services WHERE trader_user_id = ?', [traderId]);

        return res.status(200).json({
            status: 'success',
            result: {
                title: `${trader.full_name} - Profile`,
                trader: trader,
                services: services,
            }
        });

    } catch (err) {
        console.error("API Error: ", err);
        return res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    };
};

// Get booking page
exports.getBookingPage = async (req, res) => {
    
    try {
        const serviceId = req.params.id;

        if (!serviceId) {
            return res.status(400).json({
                status: 'failure',
                message: 'Service ID is required'
            });
        };

        const query = `
            SELECT s.*, u.full_name as trader_name
            FROM services s 
            LEFT JOIN users u ON s.trader_user_id = u.id 
            WHERE s.id = ?
        `;

        const [results] = await db.query(query, [serviceId]);
        const service = results[0];

        if (!service) {
            return res.status(404).json({
                status: 'failure',
                message: 'Service not found'
            });
        };
            
        return res.status(200).json({
            status: 'success',
            result: {
                title: 'Book Service',
                service: service,
                trader: {
                    id: service.trader_user_id, 
                    name: service.trader_name
                },
            }
        });

    } catch (err) {
        console.error("API Error: ", err);
        return res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    };
};

// Create booking / send to database
exports.createBooking = async (req, res) => {
    
    try {
        const serviceId = req.params.id;
        const {client_user_id, client_name, client_email, job_date, job_start_time, job_description} = req.body;

        const query = `
        INSERT INTO bookings
        (service_id, client_user_id, client_name, client_email, job_date, job_start_time, job_description, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
        `;

        await db.query(query, [serviceId, client_user_id, client_name, client_email, job_date, job_start_time, job_description]);

        return res.status(200).json({
            status: 'success',
            message: 'Booking successful'
        });

    } catch (err) {
        console.error("API Error: ", err);
        return res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    };
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

        return res.status(200).json({
            status: 'success',
            message: 'Registration successful'
        });

    } catch (err) {
        console.error("API Error: ", err);
        return res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    };
};