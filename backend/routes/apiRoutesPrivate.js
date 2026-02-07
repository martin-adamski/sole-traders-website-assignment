const express = require('express');
const router = express.Router();
const apiControllerPrivate = require('../controllers/apiControllerPrivate');

router.post('/login', apiControllerPrivate.postLogin);

router.get('/edit-profile/:id', apiControllerPrivate.getEditProfilePage);
router.post('/edit-profile', apiControllerPrivate.postEditProfilePage);

router.get('/view-profile/:id', apiControllerPrivate.getViewProfilePage);

router.get('/view-bookings/:id', apiControllerPrivate.getViewTraderBookingsPage);
router.patch('/update-booking/:id', apiControllerPrivate.patchBookingStatus);

module.exports = router;