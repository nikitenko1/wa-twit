const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { retweet, cancelRetweet } = require('../controllers/retweet');

router.post('/retweet', auth, retweet);

router.post('/retweet/cancel-retweet', auth, cancelRetweet);

module.exports = router;
