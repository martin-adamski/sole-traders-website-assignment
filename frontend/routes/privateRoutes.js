const express = require('express');
const router = express.Router();
const privateController = require('../controllers/privateController');
const { isAuth } = require('../middleware/middleware');

// Applying isAuth to all routes
router.use(isAuth);

router.get('/dashboard', privateController.getDashboard);

router.get('/edit-profile', privateController.getEditProfilePage);
router.post('/edit-profile', privateController.postEditProfilePage);

router.get('/view-profile', privateController.getViewProfilePage);

router.get('/view-bookings', privateController.getViewTraderBookingsPage);
router.post('/update-booking', privateController.postBookingStatus);

router.get('/view-services', privateController.getViewTraderServices);
router.get('/edit-service/:id', privateController.getEditTraderService);
router.post('/edit-service/:id', privateController.postEditTraderService);
router.get('/add-service/', privateController.getAddTraderService);
router.post('/add-service/', privateController.postAddTraderService);
router.post('/delete-service/:id', privateController.postDeleteTraderService);

router.get('/edit-availability', privateController.getEditTraderAvailability);
router.post('/edit-availability', privateController.postEditTraderAvailability);

module.exports = router;