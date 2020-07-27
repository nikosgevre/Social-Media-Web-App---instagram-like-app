const fs = require('fs');
const path = require('path');

const {
  validationResult
} = require('express-validator/check');

const io = require('../socket');

// const Post = require('../models/post');
const User = require('../models/user');
const Message = require('../models/message');

// get the posts for the feed page
exports.getMessages = async (req, res, next) => {
  const user1 = req.query.user1;
  const user2 = req.query.user2;

  // console.log('1: ' + user1 + ' -- 2: ' + user2);

  let total = [];

  try {

    let messages1 = await Message.find({
      from: user1,
      to: user2
    });
    let messages2 = await Message.find({
      from: user2,
      to: user1
    });

    // messages.push(messages2);
    total = messages1.concat(messages2);
    total.sort((a, b) => (a.createdAt > b.createdAt) ? 1 : -1);

    // console.log(total);

    res.status(200).json({
      message: 'Fetched messages successfully.',
      messages: total
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// create new message
exports.createMessage = async (req, res, next) => {
  console.log('dsadsad');
  const from = req.query.from;
  const to = req.query.to;
  console.log('from: ' + from + ' -- to: ' + to);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  // const user1 = await User.findById(from);
  // const user2 = await User.findById(to);

  // create the post
  const content = req.body.message;
  const message = new Message({
    from: from,
    to: to,
    content: content,
  });
  try {
    // save the post
    await message.save();
    //   const user = await User.findById(from);
    //   user.posts.push(post);
    //   await user.save();
    // emit the post creation through socket.io
    io.getIO().emit('chat', {
      action: 'create',
      msg: {
        ...message._doc
      }
    });
    res.status(201).json({
      message: 'Message created successfully!',
      msg: message
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// update post controller
exports.updateMessage = async (req, res, next) => {
  const msgId = req.params.msgId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  // get the new details of the post to be updated
  const content = req.body.content;
  try {
    const msg = await Message.findById(msgId).populate('from');
    if (!msg) {
      const error = new Error('Could not find message.');
      error.statusCode = 404;
      throw error;
    }
    if (msg.from._id.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    // update the details of the post
    post.content = content;
    const result = await msg.save();
    // emit the updated post to the different routes that requested the updated post
    // io.getIO().emit('feed', {
    //   action: 'update',
    //   post: result
    // });
    // io.getIO().emit('singlePost', {
    //   action: 'editPost',
    //   post: result
    // });
    res.status(200).json({
      message: 'Message updated!',
      msg: result
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// get all the details of a single post
exports.getMessage = async (req, res, next) => {
  const msgId = req.params.msgId;
  // console.log(msgId);
  const msg = await Message.findById(msgId)
    .populate('from')
    .populate('to');
  try {
    if (!msg) {
      const error = new Error('Could not find message.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'Message fetched.',
      msg: msg
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// delete message controller
exports.deleteMessage = async (req, res, next) => {
  const msgId = req.params.msgId;
  try {
    // the post to be deleted
    const msg = await Message.findById(msgId);
    if (!msg) {
      const error = new Error('Could not find message.');
      error.statusCode = 404;
      throw error;
    }
    if (msg.from.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }

    // delete the message
    await Message.findByIdAndDelete(msgId);

    // emit the changes to the requested route
    io.getIO().emit('chat', {
      action: 'delete',
      message: msgId
    });
    res.status(200).json({
      message: 'Deleted message.'
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};