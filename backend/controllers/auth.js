const User = require('../models/user');
const UserData = require('../models/userdata');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const shortId = require('shortid');
const authEmail = require('../services/authEmail');
const sendEmail = require('../services/sendEmail');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

let urls = {
  test: `http://localhost:3001`,
  development: 'http://localhost:3000',
  production: 'https://your-production-url.com',
};
const CLIENT_URL = urls[process.env.NODE_ENV];

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const data = await User.findOne({ email }).select(
      'email password name username salt role'
    );

    if (!data) {
      return res.status(400).json({
        error: 'Email not found.',
      });
    }
    let clientHashedPassword;
    try {
      clientHashedPassword = crypto
        .createHmac('sha1', data.salt)
        .update(password)
        .digest('hex');
    } catch (e) {
      clientHashedPassword = '';
    }
    if (clientHashedPassword !== data.password) {
      return res.status(400).json({
        error: 'Password is incorrect.',
      });
    }
    const dataFromUserData = await UserData.findOne({ user: data._id }).select(
      '_id following'
    );

    const token = jwt.sign(
      { _id: dataFromUserData._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '1d',
      }
    );
    res.status(200).json({
      message: 'Logged in',
      token,
      userData: {
        role: data.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  const { email, name, password, confirm } = req.body;

  try {
    if (password !== confirm) {
      return res.status(400).json({
        error: 'Password does not match.',
      });
    }
    User.findOne({ email })
      .select('email')
      .exec((err, result) => {
        if (err || result) {
          return res.status(400).json({
            error: 'Email has already existed.',
          });
        }
        const token = jwt.sign(
          { email, name, password },
          process.env.ACTIVATION_TOKEN_SECRET,
          {
            expiresIn: '5m',
          }
        );

        const url = `${CLIENT_URL}/activate-account/${token}`;

        const emailFormat = authEmail(
          'Please click the following URL to verify your email. This URL is valid for 5 minutes.',
          url
        );

        sendEmail(email, 'Account Activation', emailFormat)
          .then(() =>
            res.status(202).json({
              msg: `Email has been sent to ${email}. Please click on the link that we sent to activation your account.`,
            })
          )
          .catch(() => {
            res.status(400).json({
              msg: `Could not send an email to ${email}`,
            });
          });
      });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.activate = async (req, res) => {
  const token = req.body.token;

  try {
    const decoded = await jwt.verify(
      token,
      process.env.ACTIVATION_TOKEN_SECRET
    );

    if (!decoded) {
      return res.status(401).json({
        error: 'Expired link or link is invalid. Please try again.',
      });
    }
    const { email, name, password } = decoded;

    const data = await User.findOne({ email }).select('_id');

    if (data) {
      return res.status(400).json({
        error: 'User has already existed.',
      });
    }
    const username = shortId.generate();
    const salt = Math.round(new Date().valueOf() + Math.random()) + '';
    let hashedPassword;

    hashedPassword = crypto
      .createHmac('sha1', salt)
      .update(password)
      .digest('hex');

    const userData = {
      email,
      username,
      name,
      password: hashedPassword,
      salt,
    };
    const newUser = new User(userData);
    const result = await newUser.save();

    const newUserData = new UserData({
      user: result._id,
      follower: [],
      following: [],
      bio: '',
      private: true,
      profile_image: { key: '', url: '' },
      cover_image: { key: '', url: '' },
    });

    const resultFromUserData = await newUserData.save();

    await User.updateOne(
      { _id: result._id },
      { user_data: resultFromUserData._id }
    );

    res.status(200).json({
      message: "Activated. Let's login",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.sendEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email }).select('email');

    if (user) {
      const charactersGenerate = shortId.generate();
      const token = jwt.sign(
        { email, shortId: charactersGenerate },
        process.env.JWT_FORGET_PASSWORD,
        {
          expiresIn: '5m',
        }
      );
      const url = `${CLIENT_URL}/forget-password/${token}`;

      const emailFormat = authEmail(
        'Use the following URL to complete your Forget password procedures. This URL is valid for 5 minutes.',
        url
      );

      sendEmail(email, 'Reset password link', emailFormat)
        .then(() =>
          res.status(202).json({
            msg: `Email has been sent to ${email}. Please click on the link that we sent to activation your account.`,
          })
        )
        .catch(() => {
          res.status(400).json({
            msg: `Could not send an email to ${email}`,
          });
        });
    } else {
      res.status(401).json({
        error: `We could not found ${email}`,
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.newPassword = async (req, res) => {
  const { password, confirm, token } = req.body;
  try {
    if (password !== confirm) {
      return res.status(400).json({
        error: 'Password does not match.',
      });
    }
    const { email } = jwt.decode(token);
    const decoded = await jwt.verify(token, process.env.JWT_FORGET_PASSWORD);

    if (!decoded) {
      return res.status(401).json({
        error: 'Expired link or link is invalid. Please try again.',
      });
    }
    const result = await User.findOne({
      email,
      forgetPasswordToken: token,
    }).select('_id');

    if (result) {
      const salt = Math.round(new Date().valueOf() + Math.random()) + '';
      let hashedPassword;

      hashedPassword = crypto
        .createHmac('sha1', salt)
        .update(password)
        .digest('hex');

      await User.updateOne(
        { _id: result._id },
        { password: hashedPassword, salt, forgetPasswordToken: '' }
      );
      res.json({
        message: "Change password successfully. Let's login.",
      });
    } else {
      res.status(400).json({
        error: 'Token or email is invalid.',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.checkUser = async (req, res) => {
  const { _id } = req.user;
  try {
    const user = await UserData.findOne({ _id }).select('_id');

    if (!user) {
      return res.status(401).json({
        error: 'User does not exist.',
      });
    }
    res.json({
      message: 'You can access this page.',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.checkAdmin = async (req, res) => {
  const { _id } = req.user;
  try {
    const data = await UserData.findOne({ _id })
      .select('user')
      .populate('user', 'role');

    if (data.user.role === 'admin') {
      res.json({
        message: 'You can access this page.',
      });
    } else {
      res.status(401).json({
        error: 'You are not allowed to access this page.',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
