const axios = require('axios');
const { end } = require('../config/dbconnection');


// Get login page
exports.getLoginPage = (req, res) => {
 
    try {
        res.render('login');
    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};
 
// Post login page
exports.postLogin = async (req, res) => {
    
    try {
        const { username, userpass } = req.body;
        const endpoint = 'http://localhost:3003/login';

        const apiResponse = await axios.post(endpoint, { username, userpass });
        const user = apiResponse.data.result;

        req.session.user = {
            isloggedin: true,
            id: user.id,
            role: user.role,
            full_name: user.full_name,
            email: user.email,
        }
        res.redirect('/');
    } catch (err) {
        if (err.response) {
            const status = err.response.status;

            if (status === 400 || status === 401) {
                return res.render('login', { errorMessage: 'Incorrect username or password.' });
            }

            if (status === 500) {
                return res.render('errorPage500', { message: 'Our system are currently down.' });
            }
        }
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};

// Get logout
exports.getLogout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie();
        res.redirect('/');
    })
}

// Get edit profile page
exports.getEditProfilePage = async (req, res) => {

    try { 
        if ((req.session.user?.role === 'Trader' || req.session.user?.role === 'Admin')) {

            const traderId = req.session.user.id;
            const endpoint = `http://localhost:3003/edit-profile/${traderId}`;

            const apiResponse = await axios.get(endpoint);
            const data = apiResponse.data.result;

            const safeProfile = {
                trade_type: data.trade_type || '', 
                region: data.region || '',
                bio: data.bio || '',
                availability: data.availability_text || '',
                full_name: data.full_name
            };

            res.render('private-edit-trader-profile', {
                trader_id: traderId,
                profile: safeProfile,    
            }); 
        } else {
            return res.redirect('/');
        }

    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};

// Post edit page
exports.postEditProfilePage = async (req, res) => {

    try {
        const { trader_id, trade_type, city, bio, availability } = req.body;
        const endpoint = `http://localhost:3003/edit-profile/`;

        const apiResponse = await axios.post(endpoint, { trader_id, trade_type, city, bio, availability });
        const data = apiResponse.data.result;
        
        req.session.message = {
        type: 'is-success',
        text: 'Your profile has been edited succesfully.',
    };
        
        // Forcing the session save to display the message
        req.session.save(err => {
            if (err) {
                console.error(err);
                return res.status(500).send('Session save error');
            }
            return res.redirect('/edit-profile');
        });

    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};

// Get view profile page
exports.getViewProfilePage = async (req, res) => {

    try {
        
        if ((req.session.user?.role === 'Trader' || req.session.user?.role === 'Admin')) {

            const traderId = req.session.user.id;
            const endpoint = `http://localhost:3003/view-profile/${traderId}`;

            const apiResponse = await axios.get(endpoint);
            const data = apiResponse.data.result;

            const safeProfile = {
                trade_type: data.trade_type || '', 
                region: data.region || '',
                bio: data.bio || '',
                availability: data.availability_text || '',
                full_name: data.full_name
            };

            res.render('private-view-trader-profile', {
                trader_id: traderId,
                profile: safeProfile,    
            }); 
        } else {
            return res.redirect('/');
        }

    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};

// Get view bookings page
exports.getViewTraderBookingsPage = async (req, res) => {

    try {
        
        if ((req.session.user?.role === 'Trader' || req.session.user?.role === 'Admin')) {

            const traderId = req.session.user.id;
            const endpoint = `http://localhost:3003/view-bookings/${traderId}`;

            const apiResponse = await axios.get(endpoint);
            const data = apiResponse.data.result;

            res.render('private-view-trader-bookings', {
                trader_id: traderId,   
                bookingsConfirmed: data.confirmed,    
                bookingsPending: data.pending,    
            }); 
        } else {
            return res.redirect('/');
        }

    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};