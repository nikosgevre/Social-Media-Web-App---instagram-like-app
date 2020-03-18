const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'images/prof_default.png'
  },
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    default: 'I am new!'
  },
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  postLikes: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  commentLikes: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  resetToken: String,
  resetTokenExpiration: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);