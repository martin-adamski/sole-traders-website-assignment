const axios = require('axios');

// Get home page
exports.getHomePage = (req, res) => {
    res.render('index', { title: 'SoleTraders.co.uk' });
};

// Get all traders
exports.getAllTraders = async (req, res) => {
    try {
        const selectedType = req.query.tradeTypeChoice || 'All';
        const selectedRegion = req.query.regionChoice || 'All';

        const endpoint = 'http://localhost:3003/directory';

        const apiResponse = await axios.get(endpoint, { params : { type: selectedType, region: selectedRegion } });
        const data = apiResponse.data.result;

        res.render('public-directory', { 
            title: data.title,
            traders: data.traders, 
            types: data.types,
            regions: data.regions,
            currentFilter: {
                type: selectedType,
                region: selectedRegion,
            }

        });

    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};

// Get trader profile
exports.getTraderProfile = async (req, res) => {
    
    try {
        const traderId = req.params.id;
        const endpoint = `http://localhost:3003/traders/${traderId}`;
        
        const apiResponse = await axios.get(endpoint);
        const data = apiResponse.data.result;

        res.render('public-trader-profile', {
            title: data.title,
            trader: data.trader,
            services: data.services,
        })

    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};

// Get booking page
exports.getBookingPage = async (req, res) => {
    
    try {

        if (req.session.user && req.session.user.role === 'Trader') {
            return res.redirect('/');
        }

        const serviceId = req.params.id;
        const endpoint = `http://localhost:3003/services/${serviceId}/book`;

        const apiResponse = await axios.get(endpoint);
        const data = apiResponse.data.result;

        res.render('public-book-service', {
            title: data.title,
            service: data.service,
            trader: data.trader,
        })
            
    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};

// Create booking / send to database
exports.createBooking = async (req, res) => {
    
    try {
        const serviceId = req.params.id;
        const endpoint = `http://localhost:3003/services/${serviceId}/book`;

        let {client_user_id, client_name, client_email, job_date, job_start_time, job_description} = req.body;
        // converting to null again
        client_user_id = client_user_id === '' ? null : client_user_id;

        await axios.post(endpoint, {client_user_id, client_name, client_email, job_date, job_start_time, job_description});

        res.locals.successfulMessage = 'Booking Successful.';
        return exports.getBookingPage(req, res);
    
    } catch (err) {

        if (err.status === 409 || err.response.status === 400) {
            res.locals.errorMessage = `${err.response.data.message}`;
            return exports.getBookingPage(req, res);
        }

        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};

// Get register page
exports.getRegisterPage = (req, res) => {
    
    try {

        if (!req.session.isloggedin || req.session.role === 'Admin') {
            res.render('public-register'); 
        } else {
            return res.redirect('/');
        }

    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};

// Post register page
exports.postRegisterPage = async (req, res) => {


    try {
        const { useremail, userpass, username, userfullname, userrole } = req.body;
        const endpoint = `http://localhost:3003/register`;

        await axios.post(endpoint, { useremail, userpass, username, userfullname, userrole });

        req.session.message = {
        type: 'is-success',
        text: 'Registered Successfully. You can now log into your account.',
    };

        // Forcing the session save to display the message
        return req.session.save(err => {
            if (err) {
                console.error(err);
                return res.status(500).send('Session save error');
            }
            return res.redirect('/login');
        });

    } catch (err) {

        if (err.response && err.response.status === 400) {

            req.session.message = {
            type: 'is-danger',
            text: `Registration unsuccessful: ${err.response.data.message}`,
            };

            // Forcing the session save to display the message
            return req.session.save(err => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Session save error');
                }
                return res.redirect('/login');
            });
        }

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