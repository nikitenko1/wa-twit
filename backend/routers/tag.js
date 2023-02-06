const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createTagValidator } = require('../validators/tag-validator');
const { runValidation } = require('../validators/index');
const {
  createTag,
  getPopularTag,
  getTags,
  getPostsOfTag,
} = require('../controllers/tag');

router.post('/tag/create', auth, createTagValidator, runValidation, createTag);

router.get('/tag/get-popular-tag', auth, getPopularTag);

router.get('/tag/get-tags', auth, getTags);

router.post('/tag/get-posts', auth, getPostsOfTag);

module.exports = router;
