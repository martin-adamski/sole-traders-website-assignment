const db = require('../config/dbconnection');
const { validateRegistration, validateBooking } = require('../utils/validation');

// Hardcoded consts variables to use for directory filters
const ALLOWED_TRADES = ['Plumber', 'Electrician', 'Carpenter', 'Builder', 'Gardener'];
const ALLOWED_REGIONS = ['London', 'Cardiff', 'Manchester', 'Birmingham', 'Leeds'];

// Get all traders
exports.getAllTraders = async (req, res) => {
    try {
        const { type, region } = req.query;

        let query =
        `SELECT 
        tp.*
        , u.full_name
        , r.average_rating
        FROM trader_profiles tp 
        LEFT JOIN users u 
            ON tp.user_id = u.id
        LEFT JOIN (
	        SELECT 
	        trader_user_id
	        , ROUND(AVG(rating), 2) as average_rating
	        FROM reviews
	        GROUP BY trader_user_id
        ) as r
	    on tp.user_id = r.trader_user_id
        WHERE 1=1`

        const params = [];

        if (type && type !== 'All') {
            query += ' AND trade_type = ?';
            params.push(type);
        }

        if (region && region !== 'All') {
            query += ' AND region = ?';
            params.push(region)
        }

        const [traders] = await db.query(query, [type, region]);

        return res.status(200).json({
            status: 'success',
            result: {
                title: 'Trader Directory',
                traders: traders,
                types: ALLOWED_TRADES,
                regions: ALLOWED_REGIONS,
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
        SELECT 
        tp.*
        , u.full_name
        , r.average_rating
        FROM trader_profiles tp 
        LEFT JOIN users u 
            ON tp.user_id = u.id
        LEFT JOIN (
	        SELECT 
	        trader_user_id
	        , ROUND(AVG(rating), 2) as average_rating
	        FROM reviews
	        GROUP BY trader_user_id
        ) as r
	    on tp.user_id = r.trader_user_id
        WHERE tp.user_id = ?;
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

// Post create booking / send to database
exports.postCreateBooking = async (req, res) => {
    
    try {
        const { isValid, errors } = validateBooking(req.body);
        if (!isValid) return res.status(400).json({ status: 'error', message: errors.join(' ') });

        const serviceId = req.params.id;
        const {client_user_id, client_name, client_email, job_date, job_start_time, job_description} = req.body;

        const checkQuery = `
        SELECT * FROM bookings
        WHERE service_id = ?
            AND date(job_date) = ?
            AND time(job_start_time) = ?
            AND status = 'Confirmed'
        `;

        const [check] = await db.query(checkQuery, [serviceId, job_date, job_start_time]);

        if (check.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'Booking failed: time slot already taken. Try other times or dates.'
            });
        };

        const query = `
        INSERT INTO bookings
        (service_id, client_user_id, client_name, client_email, job_date, job_start_time, job_description, status)
        SELECT ?, ?, ?, ?, ?, ?, ?, 'Pending'
        FROM DUAL
        WHERE EXISTS (
            SELECT 1 FROM services s
            INNER JOIN trader_availability ta
                ON s.trader_user_id = ta.trader_user_id
                AND DAYNAME(?) = ta.day_of_week
                AND ? between ta.start_time and ta.end_time
                AND ta.selected = 'Yes'
            WHERE s.id = ?
        )
        `;

        const [result] = await db.query(query, [serviceId, client_user_id, client_name, client_email, job_date, job_start_time, job_description, job_date, job_start_time, serviceId]);

        if (result.affectedRows === 0) {
            return res.status(409).json({
                status: 'error',
                message: 'Booking failed: trader not available at selected date and time. Check trader availability.'
            });
        };

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
    }
};

// Post register page
exports.postRegisterPage = async (req, res) => {

    try {
        const { isValid, errors } = validateRegistration(req.body);
        if (!isValid) return res.status(400).json({ status: 'error', message: errors.join(' ') });

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

exports.postSubmitRating = async (req, res) => {

    try {
        const {traderId, rating} = req.body;

        const query = `
        INSERT INTO reviews
        (trader_user_id, rating)
        VALUES (?, ?)
        `;

        await db.query(query, [traderId, rating]);

        return res.status(200).json({
            status: 'success',
            message: 'Rating submission successful'
        });

    } catch (err) {
        console.error("API Error: ", err);
        return res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    };
};