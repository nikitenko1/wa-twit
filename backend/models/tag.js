const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    tag_name: {
      type: String,
      unique: true,
    },
    number: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Tag = mongoose.model('Tag', tagSchema);
module.exports = Tag;
