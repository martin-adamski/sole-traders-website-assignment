const db = require('../config/dbconnection');

// Controller function to get home page
exports.getHomePage = (req, res) => {
    res.render('index', { title: 'SoleTraders.co.uk' });
};

// Controller function to get all traders
exports.getAllTraders = async (req, res) => {
    try {
        const [traders] = await db.query('SELECT * FROM traders');

        res.render('directory', { 
            title: 'Find a Trader',
            traders: traders 
        });

    } catch (err) {
        console.error('Error fetching traders:', err);
        res.status(500).send('Server Error');
    }
};

// Controller function to get trader profile
exports.getTraderProfile = async (req, res) => {
    
    try {
        
        const traderId = req.params.id;
        
        const [traderResults] = await db.query('SELECT * FROM traders WHERE id = ?', [traderId]);
        const trader = traderResults[0];

        if (!trader) {
            return res.status(404).send('Trader not found.');
        }

        const [services] = await db.query('SELECT * FROM services WHERE trader_id = ?', [traderId]);

        res.render('trader-profile', {
            title: `${trader.name} - Profile`,
            trader: trader,
            services: services,
        })

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error.');
    }

}

// Controller function to get booking page
exports.getBookingPage = async (req, res) => {
    
    try {

        const serviceId = req.params.id;

        const query = `
            SELECT s.*, t.name as trader_name, t.id as trader_id 
            FROM services s 
            JOIN traders t ON s.trader_id = t.id 
            WHERE s.id = ?
        `;

        const [results] = await db.query(query, [serviceId]);
        const service = results[0];

        if (!service) {
            return res.status(404).send('Service not found.');
        }

        res.render('book-service', {
            title: 'Book Service',
            service: service,
            trader: {id: service.trader_id, name: service.trader_name},
        })
            
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error.');
    }
}

// Controller function to create booking / send to database
exports.createBooking = async (req, res) => {
    
    try {

        const serviceId = req.params.id;

        const { client_name, client_email, job_date, job_start_time, job_description, trader_id} = req.body;

        const query = `
        INSERT INTO bookings
        (service_id, trader_id, client_name, client_email, job_date, job_start_time, job_description, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
        `

        await db.query(query, [serviceId, trader_id, client_name, client_email, job_date, job_start_time, job_description]);

        res.redirect(`/traders/${trader_id}`);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error.');
    }
}