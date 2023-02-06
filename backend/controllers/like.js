const UserData = require('../models/userdata');
const Post = require('../models/post');
const Notification = require('../models/notification');

exports.like = async (req, res) => {
  const { _id } = req.user;
  const { postId, ownerPostId } = req.body;
  try {
    const result = await UserData.findOne({ _id: ownerPostId }).select(
      'follower private'
    );

    const data = await Post.findOne({ _id: postId }).select('_id');

    if (data) {
      if (result) {
        if (result.private) {
          if (
            result.follower.includes(_id).toString() ||
            _id.toString() === ownerPostId.toString()
          ) {
            await Post.updateOne({ _id: postId }, { $push: { like: _id } });
            if (_id === ownerPostId) {
              res.json({
                message: 'Liked',
              });
            } else {
              const newAlert = new Notification({
                from_user: _id,
                to_user: ownerPostId,
                type: 'like',
                origin_post: postId,
              });
              await newAlert.save();
              res.json({
                message: 'Liked',
              });
            }
          } else {
            res.status(401).json({
              error: 'You could not like this post.',
            });
          }
        }
        if (!result.private) {
          await Post.updateOne({ _id: postId }, { $push: { like: _id } });

          if (_id.toString() === ownerPostId.toString()) {
            res.json({
              message: 'Liked',
            });
          } else {
            const newAlert = new Notification({
              from_user: _id,
              to_user: ownerPostId,
              type: 'like',
              origin_post: postId,
            });
            await newAlert.save();
            res.json({
              message: 'Liked',
            });
          }
        }
      } else {
        res.status(400).json({
          error: 'Something went wrong.',
        });
      }
    } else {
      res.status(400).json({
        error: 'Post has been deleted.',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.unlike = async (req, res) => {
  const { _id } = req.user;
  const { postId, ownerPostId } = req.body;

  try {
    const result = await UserData.findOne({ _id: ownerPostId }).select(
      'follower private'
    );

    const data = await Post.findOne({ _id: postId }).select('_id');

    if (data) {
      if (result) {
        if (result.private) {
          if (result.follower.includes(_id) || _id === ownerPostId) {
            await Post.updateOne({ _id: postId }, { $pull: { like: _id } });
            await Notification.deleteOne({
              origin_post: postId,
              from_user: _id,
              to_user: ownerPostId,
            });
            res.json({
              message: 'UnLiked',
            });
          } else {
            res.status(401).json({
              error: 'You could not unlike this post.',
            });
          }
        }
        if (!result.private) {
          await Post.updateOne({ _id: postId }, { $pull: { like: _id } });
          await Notification.deleteOne({
            origin_post: postId,
            from_user: _id,
            to_user: ownerPostId,
          });
          res.json({
            message: 'UnLiked',
          });
        }
      } else {
        res.status(400).json({
          error: 'Something went wrong.',
        });
      }
    } else {
      res.status(400).json({
        error: 'Post has been deleted.',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
