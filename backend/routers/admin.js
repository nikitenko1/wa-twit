const express = require('express');
const router = express.Router();
const { auth, authAdmin } = require('../middleware/auth');
const {
  adminGetAllPosts,
  adminGetUsers,
  adminDeleteUser,
  adminGetPost,
  adminDeletePost,
  adminGetComments,
  adminDeleteComment,
  adminGetProfile,
  adminGetUserPosts,
} = require('../controllers/admin');

router.post('/admin/get-posts', auth, authAdmin, adminGetAllPosts);

router.post('/admin/get-post', auth, authAdmin, adminGetPost);

router.post('/admin/get-comments', auth, authAdmin, adminGetComments);

router.delete(
  '/admin/delete-comment/:id/:post_id/:commented_id',
  auth,
  authAdmin,
  adminDeleteComment
);

router.delete('/admin/delete-post/:id', auth, authAdmin, adminDeletePost);

router.post('/admin/get-users', auth, authAdmin, adminGetUsers);

router.delete('/admin/delete-user/:id', auth, authAdmin, adminDeleteUser);

router.get('/admin/get-profile/:username', auth, authAdmin, adminGetProfile);

router.post('/admin/get-user-posts', auth, authAdmin, adminGetUserPosts);

module.exports = router;
