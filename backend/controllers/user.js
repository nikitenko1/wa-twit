const User = require('../models/user');
const UserData = require('../models/userdata');
const Post = require('../models/post');
const Notification = require('../models/notification');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

exports.getProfile = async (req, res) => {
  const { _id } = req.user;
  try {
    const data = await UserData.findOne({ _id }).populate(
      'user',
      'username name'
    );

    res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getInitialProfile = async (req, res) => {
  const { _id } = req.user;

  try {
    const data = await UserData.findOne({ _id })
      .populate('user', 'name')
      .select('profile_image');

    res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getPopularUser = async (req, res) => {
  const { _id } = req.user;

  try {
    const popularUser = await UserData.find({
      $and: [{ role: { $ne: 'admin' } }, { _id: { $ne: _id } }],
    })
      .populate('user', 'username name')
      .sort({ follower: -1 })
      .limit(5);

    res.json({
      popular: popularUser,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.editProfile = async (req, res) => {
  const { private_, name, username, bio, profile_image, cover_image } =
    req.body;
  const { _id } = req.user;

  try {
    // const data = await User.findOne({ username }).populate('user_data', '_id');

    // if (data && data.user_data._id != _id) {
    //   return res.status(400).json({
    //     error: 'Duplicate username. Please change your username.',
    //   });
    // }

    //
    let newProfileImage;
    //
    if (req.body.profile_image) {
      try {
        if (profile_image && profile_image.key) {
          await cloudinary.uploader.destroy(profile_image.key);
        }
        const result_p = await cloudinary.uploader.upload(
          req.body.profile_image,
          {
            // public_id: uuidv4(),
            folder: 'globalPal/profileImages',
          }
        );
        newProfileImage = {
          url: result_p.url,
          key: result_p.public_id,
        };

        await UserData.updateOne({ _id }, { profile_image: newProfileImage });
      } catch (err) {
        res.status(400).json({ error: 'Could not update profile image' });
      }
    }
    //
    let newCoverImage;
    //
    if (req.body.cover_image) {
      try {
        if (cover_image && cover_image.key) {
          await cloudinary.uploader.destroy(cover_image.key);
        }
        const result_c = await cloudinary.uploader.upload(
          req.body.cover_image,
          {
            // public_id: uuidv4(),
            folder: 'globalPal/profileImages',
          }
        );
        newCoverImage = {
          url: result_c.url,
          key: result_c.public_id,
        };
        await UserData.updateOne({ _id }, { cover_image: newCoverImage });
      } catch (err) {
        res.status(400).json({ error: 'Could not update cover image.' });
      }
    }

    const result = await UserData.findOneAndUpdate(
      { _id },
      { bio, private: private_ }
    ).populate('user', '_id');

    await User.updateOne({ _id: result.user._id }, { name, username });

    if (profile_image && cover_image) {
      return res.json({
        message: 'Profile is updated.',
        profile_url: newProfileImage.url,
        cover_url: newCoverImage.url,
      });
    } else if (profile_image) {
      return res.json({
        message: 'Profile is updated.',
        profile_url: newProfileImage.url,
      });
    } else if (cover_image) {
      return res.json({
        message: 'Profile is updated.',
        cover_url: newCoverImage.url,
      });
    } else {
      return res.json({
        message: 'Profile is updated.',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { _id } = req.user;
  const { password, confirm } = req.body;

  try {
    if (password !== confirm) {
      return res.status(400).json({
        error: 'Password does not match.',
      });
    }
    const user = await UserData.findOne({ _id })
      .populate('user', '_id')
      .select('user');

    if (!user) {
      return res.status(401).json({
        error: 'User not found.',
      });
    }
    if (user) {
      const salt = Math.round(new Date().valueOf() + Math.random()) + '';
      let hashedPassword;

      hashedPassword = crypto
        .createHmac('sha1', salt)
        .update(password)
        .digest('hex');

      await User.updateOne(
        { _id: user.user._id },
        { password: hashedPassword, salt }
      );
      res.json({
        message: 'Password is changed successfully.',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getUserAutocomplete = async (req, res) => {
  const keyword = req.body.keyword;
  const { _id } = req.user;
  try {
    const users = await User.find({
      $or: [
        { name: new RegExp('^' + keyword, 'i') },
        { username: new RegExp('^' + keyword, 'i') },
      ],
      role: 'user',
    })
      .select('name username')
      .populate('user_data', '_id')
      .limit(5);

    const filteredUsers = users.filter(
      (user) => user.user_data._id.toString() != _id
    );
    res.json({
      users: filteredUsers,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getUserSearching = async (req, res) => {
  const keyword = req.body.keyword;
  const { _id } = req.user;
  try {
    const data = await User.find({
      $or: [
        { name: new RegExp('^' + keyword, 'i') },
        { username: new RegExp('^' + keyword, 'i') },
      ],
      role: 'user',
    })
      .populate('user_data', '_id profile_image private')
      .select('name username')
      .limit(10);

    const filteredUsers = data.filter(
      (user) => user.user_data._id.toString() != _id
    );
    res.json({
      data: filteredUsers,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  const { _id } = req.user;
  const { userUsername, limit, skip } = req.body;
  try {
    const dataForChecking = await User.findOne({ username: userUsername })
      .populate('user_data', 'private follower')
      .select('_id user_data');

    if (!dataForChecking) {
      return res.status(400).json({
        error: 'Could not find this user.',
      });
    }
    if (
      dataForChecking.user_data.follower.includes(_id) ||
      !dataForChecking.user_data.private
    ) {
      const userData = await UserData.findOne({
        _id: dataForChecking.user_data._id,
      }).populate('user', 'name username');

      const posts = await Post.find({
        $or: [
          { postedBy: dataForChecking.user_data._id, type: 'post' },
          {
            retweetedBy: dataForChecking.user_data._id,
            type: 'retweet',
          },
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

      res.status(200).json({
        user: userData,
        posts,
      });
    } else {
      const userData = await UserData.findOne({
        _id: dataForChecking.user_data._id,
      }).populate('user', 'name username');

      res.json({
        user: userData,
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getFollowingUser = async (req, res) => {
  const { _id } = req.user;
  try {
    const followings = await UserData.findOne({ _id }).select('following');

    res.json({
      following: followings.following,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.requestToFollow = async (req, res) => {
  const { _id } = req.user;
  const { userId } = req.body;
  try {
    const result = await UserData.findOne({
      _id: userId,
      follower: { $in: _id },
    }).select('_id');

    if (result) {
      return res.status(400).json({
        error: 'You has already followed.',
      });
    }
    const checkPrivate = await UserData.findOne({ _id: userId }).select(
      'private'
    );

    if (checkPrivate.private) {
      const data = await Notification.findOne({
        to_user: userId,
        from_user: _id,
        type: 'request',
      }).select('_id');

      if (data) {
        return res.json({
          message: 'Request has been sent.',
        });
      }
      const newAlert = new Notification({
        from_user: _id,
        to_user: userId,
        type: 'request',
      });

      await newAlert.save();
      res.json({
        message: 'Request is sent.',
      });
    }
    if (!checkPrivate.private) {
      const newAlert = new Notification({
        to_user: userId,
        from_user: _id,
        type: 'follow',
      });
      await newAlert.save();

      await UserData.updateOne({ _id }, { $push: { following: userId } });

      await UserData.updateOne({ _id: userId }, { $push: { follower: _id } });

      res.json({
        message: 'Followed',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.unFollow = async (req, res) => {
  const { _id } = req.user;
  const { userId } = req.body;
  try {
    await UserData.updateOne({ _id }, { $pull: { following: userId } });

    await UserData.updateOne({ _id: userId }, { $pull: { follower: _id } });

    res.json({
      message: 'Un followed.',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.fetchFollowing = async (req, res) => {
  const { arrayOfFollowing, userId } = req.body;

  try {
    const data = await UserData.findOne({ _id: userId }).select(
      '_id following private'
    );

    if (!data.private || data) {
      const users = await UserData.find({ _id: { $in: arrayOfFollowing } })
        .populate('user', 'name username')
        .select('profile_image');

      res.json(users);
    } else {
      res.status(400).json({
        error: "Let's follow this account to see following.",
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.fetchFollower = async (req, res) => {
  const { arrayOfFollower, userId } = req.body;

  try {
    const data = await UserData.findOne({ _id: userId }).select(
      '_id follower private'
    );

    if (!data.private || data) {
      const users = await UserData.find({ _id: { $in: arrayOfFollower } })
        .populate('user', 'name username')
        .select('profile_image');

      res.json(users);
    } else {
      res.status(400).json({
        error: "Let's follow this account to see following.",
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.acceptRequest = async (req, res) => {
  const { _id } = req.user;
  const { requestFrom, notificationId } = req.body;

  try {
    const result = await UserData.findOne({ _id: requestFrom }).select('_id');

    if (result) {
      await UserData.updateOne({ _id }, { $push: { follower: requestFrom } });
      await UserData.updateOne(
        { _id: requestFrom },
        { $push: { following: _id } }
      );

      await Notification.deleteOne({ _id: notificationId });
      const newAlert = new Notification({
        from_user: _id,
        to_user: requestFrom,
        type: 'accept',
      });
      await newAlert.save();

      const alertForAccepter = new Notification({
        to_user: _id,
        from_user: requestFrom,
        type: 'follow',
      });

      await alertForAccepter.save();
      res.json({
        message: 'Accepted.',
      });
    } else {
      res.status(400).json({
        error: 'Could not find the user.',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.declineRequest = async (req, res) => {
  const { notificationId } = req.body;
  try {
    await Notification.deleteOne({ _id: notificationId });

    res.json({
      message: 'Declined',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.removeFollower = async (req, res) => {
  const { _id } = req.user;
  const { userId } = req.body;
  try {
    await UserData.updateOne({ _id }, { $pull: { follower: userId } });

    await UserData.updateOne({ _id: userId }, { $pull: { following: _id } });

    await Notification.deleteOne({
      from_user: _id,
      to_user: userId,
      type: 'accept',
    });

    res.json({
      message: 'Removed.',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
