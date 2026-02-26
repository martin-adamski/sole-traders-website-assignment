const express = require('express');
const router = express.Router();
const apiControllerPublic = require('../controllers/apiControllerPublic');
const { sanitiseInput, verifyApiKey } = require('../middleware/middleware');

router.use(verifyApiKey);
router.use(sanitiseInput);

router.get('/directory', apiControllerPublic.getAllTraders);

router.get('/traders/:id', apiControllerPublic.getTraderProfile);

router.get('/services/:id/book', apiControllerPublic.getBookingPage);
router.post('/services/:id/book', apiControllerPublic.postCreateBooking);

router.post('/submit-rating', apiControllerPublic.postSubmitRating);

module.exports = router;