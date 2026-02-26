const axios = require('axios');

// Adding API key to header to safely communicate with backend
const apiClient = axios.create({
    headers: {
        'x-api-key': process.env.API_KEY
    }
});

// Get dashboard
exports.getDashboard = (req, res) => {

    try { 
        res.render('private-dashboard'); 
    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};

// Get edit profile page
exports.getEditProfilePage = async (req, res) => {

    try { 
        const traderId = req.session.user.id;
        const endpoint = `http://localhost:3003/edit-profile/${traderId}`;

        const apiResponse = await apiClient.get(endpoint);
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

        const apiResponse = await apiClient.post(endpoint, { trader_id, trade_type, city, bio, availability });
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

        if (err.response && err.response.status === 400) {

            req.session.message = {
            type: 'is-danger',
            text: err.response.data.message,
            };

            // Forcing the session save to display the message
            return req.session.save(err => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Session save error');
                }
                return res.redirect('/edit-profile');
            });
        }

        console.error(err);
        res.status(500).send('Server Error.');
    }
};

// Get view profile page
exports.getViewProfilePage = async (req, res) => {

    try {
        const traderId = req.session.user.id;
        const endpoint = `http://localhost:3003/view-profile/${traderId}`;

        const apiResponse = await apiClient.get(endpoint);
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
        
    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};

// Get view bookings page
exports.getViewTraderBookingsPage = async (req, res) => {

    try {
        const traderId = req.session.user.id;
        const queryStatus = req.query.status || 'Pending';

        const endpoint = `http://localhost:3003/view-bookings/${traderId}`;

        const apiResponse = await apiClient.get(endpoint, { params : { status : queryStatus }});

        res.render('private-view-trader-bookings', {
            traderId: traderId,   
            bookings: apiResponse.data.result.bookings,
            currentFilter: queryStatus,      
        }); 

    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};


// Get view bookings page
exports.postBookingStatus = async (req, res) => {

    try {
        const { bookingId, newStatus } = req.body;
        
        const endpoint = `http://localhost:3003/update-booking/${bookingId}`;

        const apiResponse = await apiClient.patch(endpoint, { newStatus : newStatus });

        return res.redirect('/view-bookings');

    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};

// Get view trader services
exports.getViewTraderServices = async (req, res) => {

    try { 
        const traderId = req.session.user.id;
        const endpoint = `http://localhost:3003/view-services/${traderId}`;

        const apiResponse = await apiClient.get(endpoint);
        const data = apiResponse.data.result;

        return res.render('private-view-trader-services', {
            services: data.services,    
        });

        } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};

// Get edit trader service
exports.getEditTraderService = async (req, res) => {

    try {
        const traderId = req.session.user.id;
        const serviceId = req.params.id;
        const endpoint = `http://localhost:3003/edit-service/${serviceId}`;

        const apiResponse = await apiClient.get(endpoint, { params : { traderId : traderId }});
        const data = apiResponse.data.result;

        return res.render('private-edit-trader-service', {
            serviceId : serviceId,
            traderId : traderId,
            service : data.service,
        })

    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};

// Post edit trader service
exports.postEditTraderService = async (req, res) => {

    try {
        const { title, description, base_price, price_type } = req.body;
        const traderId = req.session.user.id;
        const serviceId = req.params.id;
        const endpoint = `http://localhost:3003/edit-service/${serviceId}`;

        const apiResponse = await apiClient.post(endpoint, { serviceId, traderId, title, description, base_price, price_type });
        const data = apiResponse.data.result;

        req.session.message = {
            type: 'is-success',
            text: 'Your service has been edited succesfully.',
        };
        
        // Forcing the session save to display the message
        req.session.save(err => {
            if (err) {
                console.error(err);
                return res.status(500).send('Session save error');
            }
            return res.redirect(`/edit-service/${serviceId}`);
        });

    } catch (err) {

        if (err.response && err.response.status === 400) {

            req.session.message = {
            type: 'is-danger',
            text: err.response.data.message,
            };

            // Forcing the session save to display the message
            return req.session.save(err => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Session save error');
                }
                return res.redirect(`/edit-service/${serviceId}`);
            });
        }
        
        console.error(err);
        res.status(500).send('Server Error.');
    }
};

// Get add trader service
exports.getAddTraderService = async (req, res) => {

    try {
        const traderId = req.session.user.id;

        return res.render('private-add-trader-service', {
            traderId : traderId,
        })

    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};


// Post add trader service
exports.postAddTraderService = async (req, res) => {

    try {
        const { title, description, base_price, price_type } = req.body;
        const traderId = req.session.user.id;
        const endpoint = `http://localhost:3003/add-service`;

        const apiResponse = await apiClient.post(endpoint, { traderId, title, description, base_price, price_type });
        const data = apiResponse.data.result;

        req.session.message = {
            type: 'is-success',
            text: 'Your service has been added succesfully.',
        };
        
        // Forcing the session save to display the message
        req.session.save(err => {
            if (err) {
                console.error(err);
                return res.status(500).send('Session save error');
            }
            return res.redirect(`/add-service/`);
        });

    } catch (err) {

        if (err.response && err.response.status === 400) {

            req.session.message = {
            type: 'is-danger',
            text: err.response.data.message,
            };

            // Forcing the session save to display the message
            return req.session.save(err => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Session save error');
                }
                return res.redirect('/add-service');
            });
        }

        console.error(err);
        res.status(500).send('Server Error.');
    }
};

// Post delete trader service
exports.postDeleteTraderService = async (req, res) => {
    
    try {
        const traderId = req.session.user.id;
        const serviceId = req.params.id;
        const endpoint = `http://localhost:3003/delete-service/${serviceId}`;

        const apiResponse = await apiClient.delete(endpoint, { data : { traderId : traderId }});
        const data = apiResponse.data.result;

        req.session.message = {
            type: 'is-success',
            text: 'Your service has been deleted succesfully.',
        };
        
        // Forcing the session save to display the message
        req.session.save(err => {
            if (err) {
                console.error(err);
                return res.status(500).send('Session save error');
            }
            return res.redirect(`/view-services/`);
        });

    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};

exports.getEditTraderAvailability = async (req, res) => {
    
    try {
        const traderId = req.session.user.id;
        const endpoint = `http://localhost:3003/edit-availability/${traderId}`;

        const apiResponse = await apiClient.get(endpoint);
        const data = apiResponse.data.result;

        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const safe_days = {};

        for (const day of daysOfWeek) {
            safe_days[day] = {
                start_time: data[day]?.start_time || '09:00',
                end_time: data[day]?.end_time || '17:00',
                selected: data[day]?.selected || 'No',
            };
        }

        res.render('private-edit-trader-availability', {
            trader_id: traderId,
            days: safe_days,    
        }); 

    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};

exports.postEditTraderAvailability = async (req, res) => {
    
    try {
        const traderId = req.session.user.id;
        const endpoint = `http://localhost:3003/edit-availability/${traderId}`;

        const availabilityData = [];
        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        for (const day of daysOfWeek) {
            availabilityData.push({
                day_of_week: day.charAt(0).toUpperCase() + day.slice(1), 
                start_time: req.body[`${day}1`],
                end_time: req.body[`${day}2`],
                selected: req.body[`${day}3`]
            });
        }

        await apiClient.post(endpoint, { trader_id: traderId, availability: availabilityData });

        req.session.message = {
            type: 'is-success',
            text: 'Your availability has been updated successfully.',
        };
        
        req.session.save(err => {
            if (err) {
                console.error(err);
                return res.status(500).send('Session save error');
            }
            return res.redirect('/edit-availability');
            });
        
    } catch (err) {
        console.error("Network error: ", err.message);
        return res.render('errorPage500', { message: 'Services unavailable. Please try again later.' });
    }
};