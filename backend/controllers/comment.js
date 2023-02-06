const UserData = require('../models/userdata');
const Post = require('../models/post');
const Notification = require('../models/notification');
const Comment = require('../models/comment');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const commenting = async (req, res) => {
  const { _id } = req.user;
  const { ownerId, comment, postId, image } = req.body;

  try {
    if (image) {
      const newComment = new Comment({
        post: postId,
        commentedBy: _id,
        content: comment,
      });

      let newCommentImage;
      //
      try {
        const result = await cloudinary.uploader.upload(req.body.image, {
          // public_id: uuidv4(),
          folder: 'globalPal/profileImages',
        });
        newCommentImage = {
          url: result.url,
          key: result.public_id,
        };
        newComment.image = newCommentImage;
      } catch (err) {
        res.status(400).json({ msg: 'Could not upload image' });
      }

      await newComment.save();

      await Post.updateOne(
        { _id: postId },
        { $inc: { comment_number: 1 } },
        { new: true }
      );

      await Comment.findOne({ _id: newComment._id }).populate({
        path: 'commentedBy',
        select: 'user profile_image',
        populate: { path: 'user', select: 'name username' },
      });

      if (_id === ownerId) {
        res.json({
          message: 'Commented',
          newComment,
        });
      } else {
        const newAlert = new Notification({
          to_user: ownerId,
          from_user: _id,
          type: 'comment',
          comment_id: newComment._id,
          origin_post: postId,
        });

        const result = await newAlert.save();
        if (!result) {
          return res.status(400).json({
            error: 'Could not sent notification to owner post.',
          });
        }
        res.json({
          message: 'Commented',
          newComment,
        });
      }
    }
    if (!image) {
      const newComment = new Comment({
        post: postId,
        commentedBy: _id,
        content: comment,
      });
      const data = await newComment.save();
      if (data) {
        await Post.updateOne(
          { _id: postId },
          { $inc: { comment_number: 1 } },
          { new: true }
        );

        await Comment.findOne({ _id: newComment._id }).populate({
          path: 'commentedBy',
          select: 'user profile_image',
          populate: { path: 'user', select: 'name username' },
        });

        if (_id === ownerId) {
          res.json({
            message: 'Commented',
            newComment,
          });
        }
        if (_id !== ownerId) {
          const newAlert = new Notification({
            to_user: ownerId,
            from_user: _id,
            type: 'comment',
            comment_id: newComment._id,
            origin_post: postId,
          });
          const result = await newAlert.save();

          if (!result) {
            return res.status(400).json({
              error: 'Could not sent notification to owner post.',
            });
          }

          res.json({
            message: 'Commented',
            newComment,
          });
        }
      }
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.comment = async (req, res) => {
  const { _id } = req.user;
  const { ownerId } = req.body;
  try {
    const user = await UserData.findOne({ _id: ownerId }).select(
      'private follower'
    );

    if (user.private) {
      if (
        user.follower.includes(_id).toString() ||
        _id.toString() === ownerId.toString()
      ) {
        commenting(req, res);
      } else {
        res.status(401).json({
          error: 'You could not comment this post.',
        });
      }
    }
    if (!user.private) {
      commenting(req, res);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getComments = async (req, res) => {
  const { postId, limit, skip } = req.body;
  try {
    const result = await Post.findOne({ _id: postId }).select('postedBy');

    if (!result) {
      return res.status(400).json({
        error: 'Could not find post.',
      });
    }
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

exports.deleteComment = async (req, res) => {
  const { _id } = req.user;
  const { commentId } = req.body;

  try {
    const comment = await Comment.findOne({ _id: commentId }).select(
      'post commentedBy'
    );

    if (comment.commentedBy.toString() === _id.toString()) {
      await Comment.deleteOne({ _id: commentId });

      if (comment && comment.image.key) {
        await cloudinary.uploader.destroy(comment.image.key);
      }

      await Post.updateOne(
        { _id: comment.post },
        { $inc: { comment_number: -1 } }
      );

      await Notification.deleteOne({
        comment_id: commentId,
        type: 'comment',
        commentedBy: _id,
      });
      res.json({
        message: 'Deleted',
      });
    } else {
      res.status(401).json({
        error: 'You could not delete this comment.',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
