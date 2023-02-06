const UserData = require('../models/userdata');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  let decoded;
  try {
    const Authorization = req.header('Authorization');
    const token = Authorization.replace('Bearer ', '');
    if (!token)
      return res.status(400).json({ error: 'No token, authorization denied.' });

    decoded = jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`);
    if (!decoded) return res.status(400).json({ error: decoded });

    const user = await UserData.findOne({ _id: decoded._id })
      .select('user')
      .populate('user', 'role');

    if (!user)
      return res.status(401).json({ error: 'Invalid authentication.' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'the token is not valid' });
  }
};

const authAdmin = (req, res, next) => {
  const { _id } = req.user;
  UserData.findOne({ _id })
    .select('user')
    .populate('user', 'role')
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: 'Something went wrong.',
        });
      }
      if (!data) {
        return res.status(401).json({
          error: 'You are not user in Twizzer. Please register.',
        });
      }
      if (data.user.role === 'admin') {
        next();
      } else {
        res.status(401).json({
          error: 'You are not allowed to get all posts.',
        });
      }
    });
};

module.exports = { auth, authAdmin };
