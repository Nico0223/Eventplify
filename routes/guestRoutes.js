// guestRoutes.js
const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');

// Route: POST /guests/add
// Description: Add a new guest
router.post('/add', guestController.addGuest);
router.get('/events/:eventId/guests', guestController.getGuestsByEventId);

module.exports = router;
