const express = require('express');
const router = express.Router();
const apiControllerPublic = require('../controllers/apiControllerPublic');

router.get('/directory', apiControllerPublic.getAllTraders);

router.get('/traders/:id', apiControllerPublic.getTraderProfile);

router.get('/services/:id/book', apiControllerPublic.getBookingPage);
router.post('/services/:id/book', apiControllerPublic.postCreateBooking);

router.post('/register', apiControllerPublic.postRegisterPage);

module.exports = router;