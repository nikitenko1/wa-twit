const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  follower: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  ],
  following: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  ],
  bio: {
    type: String,
    max: 256,
  },
  private: {
    type: Boolean,
    default: true,
  },
  profile_image: {
    url: String,
    key: String,
  },
  cover_image: {
    url: String,
    key: String,
  },
});

const UserData = mongoose.model('UserData', userDataSchema);
module.exports = UserData;
