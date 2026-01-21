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

router.get('/edit-profile', publicController.getEditProfilePage);
router.post('/edit-profile', publicController.postEditProfilePage);

router.get('/view-profile', publicController.getViewProfilePage);

module.exports = router;