const Tag = require('../models/tag');
const UserData = require('../models/userdata');
const Post = require('../models/post');

exports.createTag = async (req, res) => {
  try {
    const { tag } = req.body;
    if (tag.trim().replace(' ', '').length < tag.trim().length) {
      return res.status(400).json({
        error: 'Tag name must not has a space.',
      });
    }

    const data = await Tag.findOne({ tag_name: tag }).select('_id');

    if (data) {
      res.status(400).json({
        error: `${tag} has already existed.`,
      });
    }
    if (!data) {
      const newTag = new Tag({ tag_name: tag });
      newTag.save((err) => {
        if (err) {
          return res.status(400).json({
            error: 'Could not create a tag.',
          });
        }
        res.json({
          message: 'Created successfully.',
        });
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getPopularTag = async (req, res) => {
  try {
    const data = await Tag.find({}).sort({ number: -1 }).limit(5);

    res.json({
      tags: data,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getTags = async (req, res) => {
  try {
    const data = await Tag.find({}).sort({ number: -1 });

    res.json({
      tags: data,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getPostsOfTag = async (req, res) => {
  const { _id } = req.user;
  const { tag, limit, skip } = req.body;
  try {
    const tagData = await Tag.findOne({ _id: tag }).select('tag_name');

    const user = await UserData.findOne({ _id }).select('following');

    const users = await UserData.find({ private: false }).select('_id');

    const publicUsers = users.map((u) => u._id);

    const data = await Post.find({
      tag,
      $or: [
        { $and: [{ postedBy: _id }, { type: 'post' }] },
        {
          $and: [{ postedBy: { $in: user.following } }, { type: 'post' }],
        },
        {
          $and: [{ postedBy: { $in: publicUsers } }, { type: 'post' }],
        },
      ],
    })
      .populate({
        path: 'postedBy',
        select: 'user profile_image',
        populate: { path: 'user', select: 'username name' },
      })
      .populate('tag', 'tag_name')
      .skip(skip)
      .limit(limit);

    if (!data) {
      return res.status(400).json({
        error: '์No posts in this tag.',
      });
    }
    res.json({
      posts: data,
      tag_name: tagData.tag_name,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
