const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.getHomePage);

router.get('/directory', publicController.getAllTraders);

router.get('/traders/:id', publicController.getTraderProfile);

router.get('/services/:id/book', publicController.getBookingPage);

// router.post('/services/:id/book', publicController.createBooking);

router.get('/login', publicController.getLoginPage);
router.post('/login', publicController.postLogin);
router.get('/logout', publicController.getLogout);

module.exports = router;