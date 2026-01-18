const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.getHomePage);

router.get('/directory', publicController.getAllTraders);

router.get('/traders/:id', publicController.getTraderProfile);

router.get('/services/:id/book', publicController.getBookingPage);

router.post('/services/:id/book', publicController.createBooking);

router.get('/login', publicController.getLoginPage);
router.post('/login', publicController.postLogin);
router.get('/logout', publicController.getLogout);

router.get('/register', publicController.getRegisterPage);
router.post('/register', publicController.postRegisterPage);

router.get('/create-profile', publicController.getCreateProfilePage);
// for later -- router.get('/edit-profile', publicController.getCreateProfilePage);

module.exports = router;