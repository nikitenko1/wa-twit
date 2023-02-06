const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getNotifications,
  getRequests,
} = require('../controllers/notification');

router.post('/notifications', auth, getNotifications);

router.get('/notification/requests', auth, getRequests);

module.exports = router;
