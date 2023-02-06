const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    to_user: {
      ref: 'UserData',
      type: mongoose.Types.ObjectId,
    },
    from_user: {
      ref: 'UserData',
      type: mongoose.Types.ObjectId,
    },
    type: String,
    comment_id: String,
    origin_post: {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
