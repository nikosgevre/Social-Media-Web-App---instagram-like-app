const fs = require('fs');
const path = require('path');

const {
  validationResult
} = require('express-validator/check');

const User = require('../models/user');

// get all the users for search functionality
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users) {
      const error = new Error('Could not find users.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'Users fetched.',
      users: users
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// get the search page. MAY BE DELETED
exports.getSearch = async (req, res, next) => {
  const searchName = req.query.username;
  const limit = req.query.limit;
  let counter = 0;
  let searchResults = [];
  try {
    const users = await User.find();
    for (let user of users) {
      if ((user.name.toString().toLowerCase().includes(searchName.toLowerCase())) && (counter < limit)) {
        searchResults.push(user);
        counter++;
      }
    }
    res.status(200).json({
      message: 'Fetched users successfully.',
      users: searchResults
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// get user profile details
exports.getProfile = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId)
      .populate('posts')
      .populate('followers')
      .populate('following');

    if (!user) {
      const error = new Error('Could not find user profile.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'User profile fetched.',
      user: user
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// user follow/unfollow controller
exports.userFollow = async (req, res, next) => {
  const meId = req.query.meId;
  const userId = req.query.userId;

  try {
    const user = await User.findById(userId).populate('followers').populate('following');
    const me = await User.findById(meId).populate('followers').populate('following');

    // follow controller
    if (!me.following.some(follow => follow._id.toString() === userId)) {
      // add user to my "following", add me to user's "followers"
      me.following.push(user);
      user.followers.push(me);
      const resultMe = await me.save();
      const resultUser = await user.save();
      res.status(200).json({
        message: 'User followed!',
        user: resultUser,
        me: resultMe
      });
    }
    // unfollow controller 
    else {
      // remove user from my "following", remove me from user's "followers"
      me.following = me.following.filter(el => {
        return el.name != user.name;
      });
      user.followers = user.followers.filter(el => {
        return el.name != me.name;
      });
      const resultMe = await me.save();
      const resultUser = await user.save();
      res.status(200).json({
        message: 'User unfollowed!',
        user: resultUser,
        me: resultMe
      });
    }

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

};

// update user after profile edit
exports.updateUser = async (req, res, next) => {
  const userId = req.params.userId;
  const name = req.body.name;
  const status = req.body.status;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  // console.log(status);
  if (!imageUrl) {
    const error = new Error('No file picked.');
    error.statusCode = 422;
    throw error;
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Could not find user.');
      error.statusCode = 404;
      throw error;
    }
    // do not delete the default user profile from the database
    if (imageUrl !== user.image) {
      if (user.image !== 'images/prof_default.png') {
        clearImage(user.image);
      }
    }

    // update the user's details
    user.name = name;
    user.image = imageUrl;
    user.status = status;
    const result = await user.save();
    res.status(200).json({
      message: 'User updated!',
      user: result
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// helper function for deleting an image
const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};