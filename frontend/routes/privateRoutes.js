const express = require('express');
const router = express.Router();
const privateController = require('../controllers/privateController');

router.get('/login', privateController.getLoginPage);
router.post('/login', privateController.postLogin);
router.get('/logout', privateController.getLogout);

router.get('/edit-profile', privateController.getEditProfilePage);
router.post('/edit-profile', privateController.postEditProfilePage);

router.get('/view-profile', privateController.getViewProfilePage);

router.get('/view-bookings', privateController.getViewTraderBookingsPage);

router.post('/update-booking', privateController.postBookingStatus);

module.exports = router;