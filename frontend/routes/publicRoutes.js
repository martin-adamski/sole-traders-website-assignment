const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.getHomePage);

router.get('/directory', publicController.getAllTraders);

router.get('/traders/:id', publicController.getTraderProfile);

router.get('/services/:id/book', publicController.getBookingPage);
router.post('/services/:id/book', publicController.createBooking);

router.get('/register', publicController.getRegisterPage);
router.post('/register', publicController.postRegisterPage);

router.post('/submit-rating', publicController.postSubmitRating);

// router.use(publicController.get404Page);

module.exports = router;