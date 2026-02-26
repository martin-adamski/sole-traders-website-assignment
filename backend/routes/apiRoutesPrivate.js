const express = require('express');
const router = express.Router();
const apiControllerPrivate = require('../controllers/apiControllerPrivate');
const { sanitiseInput, verifyApiKey } = require('../middleware/middleware');

router.use(verifyApiKey);
router.use(sanitiseInput);

router.post('/register', apiControllerPrivate.postRegisterPage);
router.post('/login', apiControllerPrivate.postLogin);

router.get('/edit-profile/:id', apiControllerPrivate.getEditProfilePage);
router.post('/edit-profile', apiControllerPrivate.postEditProfilePage);

router.get('/view-profile/:id', apiControllerPrivate.getViewProfilePage);

router.get('/view-bookings/:id', apiControllerPrivate.getViewTraderBookingsPage);
router.patch('/update-booking/:id', apiControllerPrivate.patchBookingStatus);

router.get('/view-services/:id', apiControllerPrivate.getViewTraderServices);
router.get('/edit-service/:id', apiControllerPrivate.getEditTraderService);
router.post('/edit-service/:id', apiControllerPrivate.postEditTraderService);
router.post('/add-service', apiControllerPrivate.postAddTraderService);
router.delete('/delete-service/:id', apiControllerPrivate.deleteDeleteTraderService);

router.get('/edit-availability/:id', apiControllerPrivate.getEditTraderAvailability);
router.post('/edit-availability/:id', apiControllerPrivate.postEditTraderAvailability);

module.exports = router;