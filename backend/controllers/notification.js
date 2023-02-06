const Notification = require('../models/notification');

exports.getNotifications = async (req, res) => {
  const { _id } = req.user;
  const { limit, skip } = req.body;
  try {
    const data = await Notification.find({
      to_user: _id,
      type: { $ne: 'request' },
    })
      .populate({
        path: 'from_user',
        select: 'user profile_image',
        populate: { path: 'user', select: 'name username' },
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getRequests = async (req, res) => {
  const { _id } = req.user;
  try {
    const data = await Notification.find({ to_user: _id, type: 'request' })
      .populate({
        path: 'from_user',
        select: 'user profile_image',
        populate: { path: 'user', select: 'name username' },
      })
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
