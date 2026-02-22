const db = require('../config/dbconnection');
const { validateProfile, validateService } = require('../utils/validation');

// Post login page
exports.postLogin = async (req, res) => {
    
    try {
        const { username, userpass } = req.body;

        if (!username || !userpass) {
            return res.status(401).json({
                status: 'failure',
                message: 'Username and password are required'
            });
        };

        // temporary password handling
        const checkUserSQL = `
        SELECT *
        FROM users
        WHERE username = ? and password_hash = ?
        `;
        //

        const [rows] = await db.query(checkUserSQL, [username, userpass]);

        if (rows.length === 0) {
            return res.status(401).json({
                status: 'failure',
                message: 'Invalid credentials'
            });
        };

        if (rows.length === 1) {
            return res.status(200).json({
                status: 'success',
                result: rows[0]
            });
        };

    } catch (err) {
        console.error("API Error: ", err);
        return res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    };
};

// Get edit profile page
exports.getEditProfilePage = async (req, res) => {

    try {
        const traderId = req.params.id;

        const query = `
        SELECT tp.*, u.full_name 
        FROM users u
        LEFT JOIN trader_profiles tp ON u.id = tp.user_id
        WHERE u.id = ?
        `;
        
        const [rows] = await db.query(query, [traderId]);

        if (rows.length === 0) {
            return res.status(401).json({
                stauts: 'failure',
                message: 'User not found'
            });
        };
        
        return res.status(200).json({
            status: 'success',
            result: rows[0]
        });

    } catch (err) {
        console.error("API Error: ", err);
        return res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    };
};

// Post edit page
exports.postEditProfilePage = async (req, res) => {

    try {
        const { isValid, errors } = validateProfile(req.body);
        if (!isValid) return res.status(400).json({ status: 'error', message: errors.join(' ') });

        const { trader_id, trade_type, city, bio, availability } = req.body;

        if (!trader_id) {
            return res.status(401).json({
                status: 'failure',
                message: 'Trader ID is required'
            });
        };

        const query = `
        INSERT INTO trader_profiles
        (user_id, trade_type, region, bio, availability_text)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            trade_type = VALUES(trade_type),
            region = VALUES(region),
            bio = VALUES(bio),
            availability_text = VALUES(availability_text)
        `;
        
        await db.query(query, [trader_id, trade_type, city, bio, availability])
    
        return res.status(200).json({
            status: 'success',
            message: 'Profile saved successfully'
        });

    } catch (err) {
        console.error("API Error: ", err);
        return res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    };
};

// Get view profile page
exports.getViewProfilePage = async (req, res) => {

    try {
        const traderId = req.params.id;

        const query = `
        SELECT tp.*, u.full_name 
        FROM users u
        LEFT JOIN trader_profiles tp ON u.id = tp.user_id
        WHERE u.id = ?
        `;

        const [rows] = await db.query(query, [traderId]);
            
        if (rows.length === 0) {
            return res.status(401).json({
                status: 'failure',
                message: 'User not found'
            });
        };
        
        return res.status(200).json({
            status: 'success',
            result: rows[0]
        });
    
    } catch (err) {
        console.error("API Error: ", err);
        return res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    };
};

// Get view bookings page
exports.getViewTraderBookingsPage = async (req, res) => {

    try {
        const traderId = req.params.id;
        const queryStatus = req.query.status;

        if (!traderId) {
            return res.status(401).json({
                status: 'failure',
                message: 'Trader ID is required'
            });
        };

        const query = `
        SELECT
        b.id as booking_id
        , s.title as service_name
        , s.description as service_description
        , b.job_description as client_description
        , b.job_date
        , b.job_start_time
        , b.status as job_status
        , s.price_type
        , s.base_price
        , u.id as trader_user_id
        FROM bookings b
        INNER JOIN services s
            on b.service_id = s.id
        INNER JOIN users u
            on u.id = s.trader_user_id
                AND u.id = ?
        WHERE b.status = ?
        ORDER BY b.job_date DESC
            `;

        const [bookings] = await db.query(query, [traderId, queryStatus]);

        return res.status(200).json({
            status: 'success',
            result: {
                bookings: bookings,
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

// Patch booking status
exports.patchBookingStatus = async(req, res) => {
    
    try {
        const bookingId = req.params.id;
        const { newStatus } = req.body;

        if (!bookingId) {
            return res.status(401).json({
                status: 'failure',
                message: 'Booking ID is required'
            });
        };

        const query = `
        UPDATE bookings SET status = ? WHERE id = ?
        `;

        await db.query(query, [newStatus, bookingId]);
    
        return res.status(200).json({
            status: 'success',
            message: 'Booking updated successfully'
        });

    } catch (err) {
        console.error("API Error: ", err);
        return res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    };
};

// Get view trader
exports.getViewTraderServices = async (req, res) => {

    try {
        const traderId = req.params.id;

        if (!traderId) {
            return res.status(401).json({
                status: 'failure',
                message: 'Trader ID is required'
            });
        };

        const query = `
        SELECT *
        FROM services s
        WHERE s.trader_user_id = ?
        `;
        
        const [rows] = await db.query(query, [traderId]);

        if (rows.length === 0) {
            return res.status(401).json({
                stauts: 'failure',
                message: 'User not found'
            });
        };
        
        return res.status(200).json({
            status: 'success',
            result: {
                services: rows
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

// Get edit trader service
exports.getEditTraderService = async (req, res) => {
  
    try {
            const serviceId = req.params.id;
            const traderId = req.query.traderId;

        if (!serviceId) {
            return res.status(401).json({
                status: 'failure',
                message: 'Service ID is required'
            });
        };

        if (!traderId) {
            return res.status(401).json({
                status: 'failure',
                message: 'Trader ID is required'
            });
        };

        const query = `
        SELECT *
        FROM services s
        WHERE 1=1 
            AND s.id = ?
            AND s.trader_user_id = ?
        `;
        
        const [rows] = await db.query(query, [serviceId, traderId]);

        if (rows.length === 0) {
            return res.status(401).json({
                stauts: 'failure',
                message: 'Service not found'
            });
        };
        
        return res.status(200).json({
            status: 'success',
            result: {
                service: rows[0]
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

// Post edit trader service
exports.postEditTraderService = async (req, res) => {

    try {
        const { isValid, errors } = validateService(req.body);
        if (!isValid) return res.status(400).json({ status: 'error', message: errors.join(' ') });

        const { serviceId, traderId, title, description, base_price, price_type } = req.body;

        if (!serviceId) {
            return res.status(400).json({
                status: 'failure',
                message: 'Service ID is required'
            });
        };

        if (!traderId) {
            return res.status(400).json({
                status: 'failure',
                message: 'Trader ID is required'
            });
        };

        query =
        `
        UPDATE services
        set title = ?, description = ?, base_price = ?, price_type = ?
        where 1=1
            AND id = ?
            AND trader_user_id = ?
        `;

        await db.query(query, [title, description, base_price, price_type, serviceId, traderId]);
    
        return res.status(200).json({
            status: 'success',
            message: 'Service saved successfully'
        });

    } catch (err) {
        console.error("API Error: ", err);
        return res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    };
};

// Get add trader service
exports.postAddTraderService = async (req, res) => {
    
    try {
        const { isValid, errors } = validateService(req.body);
        if (!isValid) return res.status(400).json({ status: 'error', message: errors.join(' ') });

        const { traderId, title, description, base_price, price_type } = req.body;

        if (!traderId) {
            return res.status(400).json({
                status: 'failure',
                message: 'Tradeer ID is required'
            });
        };

        const query = `
        INSERT INTO services
        (trader_user_id, title, description, base_price, price_type)
        VALUES (?, ?, ?, ?, ?)
        `;

        await db.query(query, [traderId, title, description, base_price, price_type]);
    
        return res.status(200).json({
            status: 'success',
            message: 'Service added successfully'
        });

    } catch (err) {
        console.error("API Error: ", err);
        return res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    };
};

// Delete delete trader service
exports.deleteDeleteTraderService = async (req, res) => {

        try {

        const serviceId = req.params.id;
        const traderId = req.body.traderId;

        if (!serviceId) {
            return res.status(401).json({
                status: 'failure',
                message: 'Service ID is required'
            });
        };

        if (!traderId) {
            return res.status(401).json({
                status: 'failure',
                message: 'Trader ID is required'
            });
        };

        const query = `
        DELETE FROM services
        WHERE id = ? AND trader_user_id = ?
        `;

        await db.query(query, [serviceId, traderId]);

        return res.status(200).json({
            status: 'success',
            message: 'Service deleted successfully'
        });

    } catch (err) {
        console.error("API Error: ", err);
        return res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    };
};

exports.getEditTraderAvailability = async (req, res) => {

    try {
        const traderId = req.params.id;

        if (!traderId) {
            return res.status(401).json({
                status: 'failure',
                message: 'Trader ID is required'
            });
        };

        const query = `
        SELECT LOWER(day_of_week) AS day, start_time, end_time, selected
        FROM trader_availability
        WHERE trader_user_id = ?
        `;

        const [rows] = await db.query(query, [traderId]);

        const availability = {
            monday: {},
            tuesday: {},
            wednesday: {},
            thursday: {},
            friday: {},
            saturday: {},
            sunday: {}
        };

        rows.forEach(row => {
            availability[row.day] = {
                start_time: row.start_time,
                end_time: row.end_time,
                selected: row.selected
            };
        });

        return res.status(200).json({
            status: 'success',
            result: availability
        });

    } catch (err) {
        console.error("API Error: ", err);
        return res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    };
};

exports.postEditTraderAvailability = async (req, res) => {

    try {
        const traderId = req.params.id;
        const { availability } = req.body;

        if (!traderId) {
            return res.status(401).json({
                status: 'failure',
                message: 'Trader ID is required'
            });
        };

        const query = `
            INSERT INTO trader_availability 
            (trader_user_id, day_of_week, start_time, end_time, selected)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                start_time = VALUES(start_time),
                end_time = VALUES(end_time),
                selected = VALUES(selected)
        `;

        for (const day of availability) {
            await db.query(query, [traderId, day.day_of_week, day.start_time, day.end_time, day.selected]);
        };
    
        return res.status(200).json({
            status: 'success',
            message: 'Availability saved successfully'
        });

    } catch (err) {
        console.error("API Error: ", err);
        return res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    };
};