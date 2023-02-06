const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { like, unlike } = require('../controllers/like');

router.post('/like', auth, like);

router.post('/like/unlike', auth, unlike);

module.exports = router;
