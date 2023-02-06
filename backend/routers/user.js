const express = require('express');
const router = express.Router();
const { editProfileValidator } = require('../validators/profile-validator');
const { passwordValidator } = require('../validators/auth-validator');
const { runValidation } = require('../validators/index');
const { auth } = require('../middleware/auth');
const {
  getProfile,
  editProfile,
  getPopularUser,
  changePassword,
  getUserAutocomplete,
  getUserSearching,
  getUserProfile,
  getFollowingUser,
  requestToFollow,
  unFollow,
  fetchFollowing,
  fetchFollower,
  acceptRequest,
  declineRequest,
  removeFollower,
  getInitialProfile,
} = require('../controllers/user');

router.get('/user/get-profile', auth, getProfile);

router.get('/user/get-initial-profile', auth, getInitialProfile);

router.post(
  '/user/edit-profile',
  auth,
  editProfileValidator,
  runValidation,
  editProfile
);
router.get('/user/popular-user', auth, getPopularUser);

router.post(
  '/user/change-password',
  auth,

  passwordValidator,
  runValidation,
  changePassword
);

router.post('/user/user-autocomplete', auth, getUserAutocomplete);

router.post('/user/user-searching', auth, getUserSearching);

router.post('/user/user-profile', auth, getUserProfile);

router.get('/user/get-following', auth, getFollowingUser);

router.post('/user/follow', auth, requestToFollow);

router.post('/user/un-follow', auth, unFollow);

router.post('/user/fetch-following', auth, fetchFollowing);

router.post('/user/fetch-follower', auth, fetchFollower);

router.post('/user/accept-request', auth, acceptRequest);

router.post('/user/decline-request', auth, declineRequest);

router.post('/user/remove-follower', auth, removeFollower);

module.exports = router;
