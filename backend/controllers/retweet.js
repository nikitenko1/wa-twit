const UserData = require('../models/userdata');
const Post = require('../models/post');
const Notification = require('../models/notification');

exports.retweet = async (req, res) => {
  const { _id } = req.user;
  const { postId, ownerPostId } = req.body;
  try {
    const result = await Post.findOne({
      retweetedBy: _id,
      origin_post: postId,
    });
    if (result) {
      return res.status(400).json({
        error: 'You could not retweet this post anymore.',
      });
    }

    const user = await UserData.findOne({ _id: ownerPostId }).select(
      'follower private'
    );
    const tagPost = await Post.findOne({
      _id: postId,
    });

    if (user) {
      if (user.private) {
        if (user.follower.includes(_id) || _id == ownerPostId) {
          const updated = await Post.updateOne(
            { _id: postId },
            { $push: { retweet: _id } }
          );
          if (!updated) {
            return res.status(400).json({
              error: 'Could not retweet.',
            });
          }
          const newRetweet = new Post({
            postedBy: ownerPostId,
            tag: tagPost.tag,
            type: 'retweet',
            origin_post: postId,
            retweetedBy: _id,
          });
          const retweet = await newRetweet.save();
          if (!retweet) {
            return res.status(400).json({
              error: 'Could not retweet.',
            });
          }
          const newRetweetId = retweet._id;
          const newTweet = await Post.findOne({ _id: newRetweetId })
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
            .populate('origin_post', '_id content images');

          if (_id == ownerPostId) {
            res.json({
              message: 'Retweeted',
              newTweet,
            });
          } else {
            const newAlert = new Notification({
              type: 'retweet',
              from_user: _id,
              to_user: ownerPostId,
              origin_post: postId,
            });
            await newAlert.save();

            res.json({
              message: 'Retweeted',
              newTweet,
            });
          }
        } else {
          res.status(401).json({
            error: 'You are not allowed to retweet this post.',
          });
        }
      }
      if (!user.private) {
        await Post.updateOne({ _id: postId }, { $push: { retweet: _id } });

        const newRetweet = new Post({
          postedBy: ownerPostId,
          tag: tagPost.tag,
          type: 'retweet',
          origin_post: postId,
          retweetedBy: _id,
        });
        const retweet = await newRetweet.save();
        if (!retweet) {
          return res.status(400).json({
            error: 'Could not retweet.',
          });
        }
        const newRetweetId = retweet._id;
        const newTweet = await Post.findOne({ _id: newRetweetId })
          .populate({
            path: 'postedBy',
            select: 'user profile_image',
            populate: { path: 'user', select: 'username name' },
          })
          .populate({
            path: 'retweetedBy',
            select: 'user',
            populate: { path: 'user', select: 'username name' },
          })
          .populate('origin_post', '_id content images');

        if (_id == ownerPostId) {
          res.json({
            message: 'Retweeted',
            newTweet,
          });
        } else {
          const newAlert = new Notification({
            type: 'retweet',
            from_user: _id,
            to_user: ownerPostId,
            origin_post: postId,
          });
          await newAlert.save();

          res.json({
            message: 'Retweeted',
            newTweet,
          });
        }
      }
    } else {
      res.status(400).json({
        error: 'Could not find this user.',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.cancelRetweet = async (req, res) => {
  const { _id } = req.user;
  const { postId, ownerPostId } = req.body;

  try {
    const user = await UserData.findOne({ _id: ownerPostId }).select(
      'follower private'
    );

    if (user) {
      if (user.private) {
        if (user.follower.includes(_id) || _id === ownerPostId) {
          const resultBeforeDelete = await Post.findOneAndDelete({
            retweetedBy: _id,
            origin_post: postId,
            postedBy: ownerPostId,
          });
          await Post.updateOne({ _id: postId }, { $pull: { retweet: _id } });

          if (_id === ownerPostId) {
            res.status(200).json({
              message: 'Canceled',
              deletedRetweet: resultBeforeDelete._id,
            });
          } else {
            Notification.deleteOne({
              type: 'retweet',
              from_user: _id,
              origin_post: postId,
            });
            res.status(200).json({
              message: 'Canceled',
              deletedRetweet: resultBeforeDelete._id,
            });
          }
        } else {
          res.status(401).json({
            error: 'You could not cancel retweet this post.',
          });
        }
      }
      if (!user.private) {
        const resultBeforeDelete = await Post.findOneAndDelete({
          retweetedBy: _id,
          origin_post: postId,
          postedBy: ownerPostId,
        });
        await Post.updateOne({ _id: postId }, { $pull: { retweet: _id } });
        await Notification.deleteOne({
          type: 'retweet',
          from_user: _id,
          origin_post: postId,
        });

        res.status(200).json({
          message: 'Canceled',
          deletedRetweet: resultBeforeDelete._id,
        });
      }
    } else {
      res.status(400).json({
        error: 'Could not find a user.',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
