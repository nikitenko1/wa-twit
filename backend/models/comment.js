const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: {
      ref: 'Post',
      type: mongoose.Types.ObjectId,
    },
    commentedBy: {
      ref: 'UserData',
      type: mongoose.Types.ObjectId,
    },
    content: {
      type: String,
      max: 256,
    },
    image: {
      url: String,
      key: String,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
