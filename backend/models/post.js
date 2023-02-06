const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'UserData',
    },
    content: {
      type: String,
      max: 256,
    },
    tag: {
      type: mongoose.Types.ObjectId,
      ref: 'Tag',
      default: '',
    },
    retweet: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'UserData',
      },
    ],
    like: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'UserData',
      },
    ],
    comment_number: {
      type: Number,
      default: 0,
    },
    images: [
      {
        type: Object,
      },
    ],
    type: {
      type: String,
      default: 'post',
    },
    origin_post: {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
    },
    retweetedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'UserData',
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
