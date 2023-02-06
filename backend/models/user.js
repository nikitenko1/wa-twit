const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    user_data: {
      ref: 'UserData',
      type: mongoose.Types.ObjectId,
    },
    email: {
      type: String,
      unique: true,
    },
    username: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
    },
    password: String,
    salt: String,
    role: {
      type: String,
      default: 'user',
    },
    newPasswordToken: {
      type: 'String',
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
