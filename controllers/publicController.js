const db = require('../config/dbconnection');

// Controller function to get home page
exports.getHomePage = (req, res) => {
    res.render('index', { title: 'SoleTraders.co.uk' });
};

// Controller function to get all traders
exports.getAllTraders = async (req, res) => {
    try {
        const [traders] = await db.query('SELECT tp.*, u.full_name FROM trader_profiles tp LEFT JOIN users u ON tp.user_id = u.id');

        res.render('directory', { 
            title: 'Trader Directory',
            traders: traders 
        });

    } catch (err) {
        console.error('Error fetching traders:', err);
        res.status(500).send('Server Error.');
    }
};

// Controller function to get trader profile
exports.getTraderProfile = async (req, res) => {
    
    try {
        
        const traderId = req.params.id;

        const tp_query = `
        SELECT tp.*, u.full_name 
        FROM trader_profiles tp 
        LEFT JOIN users u ON tp.user_id = u.id 
        WHERE tp.user_id = ?
        `
        
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

// Controller function to get booking page
exports.getBookingPage = async (req, res) => {
    
    try {

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

// // Controller function to create booking / send to database
// exports.createBooking = async (req, res) => {
    
//     try {

//         const serviceId = req.params.id;

//         const {job_date, job_start_time, job_description} = req.body;

//         const query = `
//         INSERT INTO bookings
//         (service_id, client_user_id, job_date, job_start_time, job_description, status)
//         VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
//         `

//         await db.query(query, [serviceId, client_user_id, job_date, job_start_time, job_description]);

//         res.redirect(`/traders/${trader_user_id}`);

//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Server Error.');
//     }
// }

exports.getLoginPage = (req, res) => {
    res.render('login');   
};

exports.postLogin = async (req, res) => {
    
    try {

        const { username, userpass } = req.body;

        // temporary password handling
        const checkUserSQL = `
        SELECT *
        FROM users
        WHERE username = ? and password_hash = ?
        `;

        const [rows] = await db.query(checkUserSQL, [username, userpass]);

        if (rows.length === 1) {
            req.session.isloggedin = true;
            req.session.role = rows[0].role;

            res.redirect('/');
        } else {
            res.render('login', { errorMessage: 'Incorrect username or password.' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error.');
    }
};

exports.getLogout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie();
        res.redirect('/');
    })
}