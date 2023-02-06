const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getPosts,
  getPost,
  createPost,
  getYourPost,
  getUserPost,
  deletePost,
} = require('../controllers/post');
const { createPostValidator } = require('../validators/post-validator');
const { runValidation } = require('../validators/index');

router.post('/posts', auth, getPosts);

router.post(
  '/post/create',
  auth,
  createPostValidator,
  runValidation,
  createPost
);

router.post('/post/get-posts', auth, getYourPost);

router.post('/post/get-post', auth, getPost);

router.post('/post/get-user-posts', auth, getUserPost);

router.delete('/post/delete-post/:post', auth, deletePost);

module.exports = router;
