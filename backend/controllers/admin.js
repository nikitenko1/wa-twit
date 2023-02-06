const User = require('../models/user');
const UserData = require('../models/userdata');
const Comment = require('../models/comment');
const Tag = require('../models/tag');
const Notification = require('../models/notification');
const Post = require('../models/post');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

exports.adminGetAllPosts = async (req, res) => {
  const { limit, skip } = req.body;

  try {
    const posts = await Post.find({ type: { $ne: 'retweet' } })
      .populate({
        path: 'postedBy',
        select: 'user profile_image',
        populate: { path: 'user', select: 'name username' },
      })
      .populate('tag', 'tag_name')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.adminGetProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username })
      .populate('user_data', 'profile_image cover_image following follower bio')
      .select('name username');

    if (user) {
      res.json(user);
    } else {
      res.status(400).json({
        error: 'User not found.',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.adminGetPost = async (req, res) => {
  const postId = req.body.id;

  try {
    const post = await Post.findOne({ _id: postId })
      .populate({
        path: 'postedBy',
        select: 'user profile_image',
        populate: { path: 'user', select: 'name username' },
      })
      .populate('tag', 'tag_name');

    if (!post) {
      return res.status(400).json({
        error: 'Could not fine post.',
      });
    }
    res.json(post);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.adminGetUserPosts = async (req, res) => {
  const { limit, skip, userId } = req.body;

  try {
    const user = await UserData.findOne({ _id: userId }).select('_id');

    if (!user) {
      return res.status(400).json({
        error: 'Could not find user.',
      });
    }
    const posts = await Post.find({ postedBy: userId, type: 'post' })
      .populate({
        path: 'postedBy',
        select: 'user profile_image',
        populate: { path: 'user', select: 'name username' },
      })
      .populate('tag', 'tag_name')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const deletePostImages = async (images) => {
  for (let image of images) {
    await cloudinary.uploader.destroy(image.public_id);
  }
};

const deleteCommentImages = async (comments) => {
  for (let comment of comments) {
    await cloudinary.uploader.destroy(comment.image.public_id);
  }
};

exports.adminDeletePost = async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await Post.findOne({ _id: postId }).select(
      'postedBy images tag'
    );

    await Post.deleteOne({ _id: postId });

    deletePostImages(post.images);

    await Notification.deleteMany({ origin_post: postId });

    const comments = await Comment.find({ post: postId }).select('image');

    deleteCommentImages(comments);

    await Comment.deleteMany({ post: postId });

    await Post.deleteMany({
      origin_post: postId,
      type: 'retweet',
    });

    await Tag.updateOne({ _id: post.tag }, { $inc: { number: -1 } });

    res.json({
      message: 'Deleted',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.adminGetComments = async (req, res) => {
  const { limit, skip, postId } = req.body;

  try {
    const comments = await Comment.find({ post: postId })
      .populate({
        path: 'commentedBy',
        select: 'user profile_image',
        populate: { path: 'user', select: 'name username' },
      })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.adminDeleteComment = async (req, res) => {
  const { id, post_id, commented_id } = req.params;

  try {
    const comment = await Comment.findOne({ _id: id }).select('image');

    if (comment.image.key) {
      await cloudinary.uploader.destroy(comment.image.key);
    }
    await Comment.deleteOne({ _id: id });

    await Post.updateOne({ _id: post_id }, { $inc: { comment_number: -1 } });

    await Notification.deleteOne({
      comment_id: id,
      from_user: commented_id,
      type: 'comment',
    });

    res.json({
      message: 'Deleted',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.adminGetUsers = async (req, res) => {
  const { limit, skip } = req.body;
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .populate('user_data', 'profile_image')
      .select('name username')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const deleteUserImage = async (profile_image, cover_image) => {
  if (profile_image.key !== '') {
    await cloudinary.uploader.destroy(profile_image.key);
  }
  if (cover_image.key !== '') {
    await cloudinary.uploader.destroy(cover_image.key);
  }
};

const deletePostImage = async (posts) => {
  for (let post of posts) {
    for (let image of post.images) {
      await cloudinary.uploader.destroy(image.key);
    }
  }
};

const deleteCommentsImage = async (comments) => {
  for (let comment of comments) {
    if (comment.image.key) {
      await cloudinary.uploader.destroy(comment.image.key);
    }
  }
};

const updateCommentNumberInPosts = async (comments, res) => {
  try {
    for (let comment of comments) {
      await Post.updateOne(
        { _id: comment.post },
        { $inc: { comment_number: -1 } }
      );
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateFollowerAndFollowing = async (id, res) => {
  try {
    await UserData.updateMany(
      { follower: { $in: id } },
      { $pull: { follower: id } }
    );
    await UserData.updateMany(
      {
        following: {
          $in: id,
        },
      },
      { $pull: { following: id } }
    );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateLikeAndRetweet = async (id, followingArray, res) => {
  try {
    await Post.updateMany(
      { $and: [{ postedBy: { $in: followingArray } }, { type: 'post' }] },
      { $pull: { like: id } }
    );
    await Post.updateMany(
      { $and: [{ postedBy: { $in: followingArray } }, { type: 'post' }] },
      { $pull: { retweet: id } }
    );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.adminDeleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await UserData.findOne({ _id: id }).select(
      'user following follower profile_image cover_image'
    );

    if (user) {
      await UserData.deleteOne({ _id: id });
      await User.deleteOne({ _id: user.user });

      const posts = await Post.find({
        $and: [{ postedBy: id }, { type: 'post' }],
      }).select('images');

      await Post.deleteMany({
        $or: [{ postedBy: id }, { retweetedBy: id }],
      });
      await Notification.deleteMany({
        or: [{ from_user: id }, { to_user: id }],
      });
      const comments = await Comment.find({ commentedBy: id }).select(
        'post image'
      );

      await Comment.deleteMany({ commentedBy: id });
      res.json({
        message: 'Deleted',
      });

      deleteUserImage(user.profile_image, user.cover_image);
      deletePostImage(posts);
      deleteCommentsImage(comments);
      updateCommentNumberInPosts(comments);
      updateLikeAndRetweet(id, user.following);
      updateFollowerAndFollowing(id);
    } else {
      return res.status(400).json({
        error: 'Could not found user.',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
