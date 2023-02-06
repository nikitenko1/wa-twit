const UserData = require('../models/userdata');
const Notification = require('../models/notification');
const Comment = require('../models/comment');
const Post = require('../models/post');
const Tag = require('../models/tag');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

exports.getPosts = async (req, res) => {
  const { _id } = req.user;
  const { limit, skip } = req.body;

  try {
    const followings = await UserData.findOne({ _id }).select('following');

    const data = await Post.find({
      $or: [
        {
          $and: [{ postedBy: { $in: followings.following } }, { type: 'post' }],
        },
        {
          $and: [{ postedBy: _id }, { type: 'post' }],
        },
        { retweetedBy: { $in: followings.following } },
        { retweetedBy: _id },
      ],
    })
      .populate({
        path: 'postedBy',
        select: 'user profile_image',
        populate: { path: 'user', select: 'username name' },
      })
      .populate('tag', 'tag_name')
      .populate({
        path: 'retweetedBy',
        select: 'user',
        populate: { path: 'user', select: 'username name' },
      })
      .populate('origin_post', '_id content images')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getPost = async (req, res) => {
  const { _id } = req.user;
  const { postId } = req.body;
  try {
    const data = await Post.findOne({ _id: postId })
      .populate({
        path: 'postedBy',
        select: 'user profile_image',
        populate: { path: 'user', select: 'username name' },
      })
      .populate('tag', 'tag_name');

    if (!data) {
      return res.status(400).json({
        error: 'Could not find post.',
      });
    }
    const owner = data.postedBy;

    const result = await UserData.findOne({ _id: owner._id }).select(
      'follower private'
    );

    if (result.private) {
      if (
        result.follower.includes(_id) ||
        _id.toString() === owner._id.toString()
      ) {
        res.json(data);
      } else {
        res.status(401).json({
          error: 'You could not access this post',
        });
      }
    }
    if (!result.private) {
      res.json(data);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getYourPost = async (req, res) => {
  const { _id } = req.user;
  const { limit, skip } = req.body;
  try {
    const data = await Post.find({
      $or: [
        { $and: [{ postedBy: _id }, { type: { $ne: 'retweet' } }] },
        { retweetedBy: _id },
      ],
    })
      .populate({
        path: 'postedBy',
        select: 'user profile_image',
        populate: { path: 'user', select: 'username name' },
      })
      .populate('tag', 'tag_name')
      .populate({
        path: 'retweetedBy',
        select: 'user',
        populate: { path: 'user', select: 'username name' },
      })
      .populate('origin_post', '_id content images')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateImageUrl = async (_id, images, res) => {
  try {
    for (let i = 0; i < images.length; i++) {
      // const type = images[i].split(';')[0].split('/')[1];
      // if (!['jpeg', 'png'].includes(type)) {
      //   res.status(400).json({
      //     error: 'Invalid image type',
      //   });
      // }
      const image = await cloudinary.uploader.upload(images[i], {
        // public_id: uuidv4(),
        folder: 'globalPal/profileImages',
      });

      const imageObject = {
        url: image.url,
        public_id: image.public_id,
      };
      await Post.updateOne({ _id }, { $push: { images: imageObject } });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.createPost = async (req, res) => {
  const { content, tag, images } = req.body;

  try {
    const { _id } = req.user;
    if (images.length > 4) {
      return res.status(400).json({
        error: 'Uploaded images must be less than 4.',
      });
    }
    const newPost = new Post({
      postedBy: _id,
      content,
      retweet: [],
      link: [],
      images: [],
      tag,
    });
    const resultFromPost = await newPost.save();

    const result = await Tag.updateOne({ _id: tag }, { $inc: { number: 1 } });
    if (!result) {
      return res.status(400).json({
        error: 'Could not add a new post.',
      });
    }
    if (images.length > 0) {
      updateImageUrl(resultFromPost._id, images);
      setTimeout(
        () =>
          res.json({
            message: 'Your post is posted.',
          }),
        1000
      );
    } else {
      res.json({
        message: 'Your post is posted.',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getUserPost = async (req, res) => {
  const { _id } = req.user;
  const { limit, skip, userId } = req.body;

  try {
    const checkPrivate = await UserData.findOne({ _id: userId }).select(
      'private'
    );

    if (checkPrivate.private) {
      const userData = await UserData.findOne({
        _id: userId,
        follower: { $in: _id },
      }).select('_id');

      if (userData) {
        const data = await Post.find({
          $or: [
            { postedBy: userId, type: 'post' },
            { retweetedBy: userId, type: 'retweet' },
          ],
        })
          .populate({
            path: 'postedBy',
            select: 'user profile_image',
            populate: { path: 'user', select: 'username name' },
          })
          .populate('tag', 'tag_name')
          .populate({
            path: 'retweetedBy',
            select: 'user',
            populate: { path: 'user', select: 'username name' },
          })
          .populate('origin_post', '_id content images')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 });

        res.json(data);
      } else {
        res.status(401).json({
          error: 'Follow this user to see these posts.',
        });
      }
    }
    if (!checkPrivate.private) {
      const data = await Post.find({
        $or: [{ postedBy: userId }, { retweetedBy: userId }],
      })
        .populate({
          path: 'postedBy',
          select: 'user profile_image',
          populate: { path: 'user', select: 'username name' },
        })
        .populate('tag', 'tag_name')
        .populate({
          path: 'retweetedBy',
          select: 'user',
          populate: { path: 'user', select: 'username name' },
        })
        .populate('origin_post', '_id content images')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      res.json(data);
    }
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

exports.deletePost = async (req, res) => {
  const { _id } = req.user;
  const postId = req.params.post;

  try {
    const post = await Post.findOne({ _id: postId }).select(
      'postedBy images tag'
    );

    if (post.postedBy.toString() == _id.toString()) {
      await Post.deleteOne({ _id: postId }).then(async () => {
        deletePostImages(post.images);
        await Notification.deleteMany({ origin_post: postId });

        const comments = await Comment.find({ post: postId }).select('image');
        if (comments) {
          deleteCommentImages(comments);
          await Comment.deleteMany({ post: postId });
        }
        await Post.deleteMany({
          origin_post: postId,
          type: 'retweet',
        });

        await Tag.updateOne({ _id: post.tag }, { $inc: { number: -1 } });
      });
      res.json({
        message: 'Deleted',
      });
    } else {
      res.status(401).json({
        error: 'You could not delete this post.',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
