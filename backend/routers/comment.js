const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  comment,
  getComments,
  deleteComment,
} = require('../controllers/comment');
const { commentValidator } = require('../validators/comment-validator');
const { runValidation } = require('../validators');

router.post('/comment', auth, commentValidator, runValidation, comment);

router.post('/comment/get-comments', auth, getComments);

router.post('/comment/delete', auth, deleteComment);

module.exports = router;
