const fs = require('fs');
const path = require('path');

const {
    validationResult
  } = require('express-validator/check');

const User = require('../models/user');

exports.getUsers = async (req, res, next) => {
    // console.log('users');
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

exports.getSearch = async (req, res, next) => {
    const searchName = req.query.username;
    const limit = req.query.limit;
    let counter = 0;
    let searchResults = [];
    try {
        const users = await User.find();
        for (let user of users) {
            // case insensitive search
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
        // console.log(user.resetToken);
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

exports.userFollow = async (req, res, next) => {
    const meId = req.query.meId;
    const userId = req.query.userId;

    try {
        const user = await User.findById(userId).populate('followers').populate('following');
        const me = await User.findById(meId).populate('followers').populate('following');

        if (!me.following.some(follow => follow._id.toString() === userId)) {
            me.following.push(user);
            user.followers.push(me);
            const resultMe = await me.save();
            const resultUser = await user.save();
            res.status(200).json({
                message: 'User followed!',
                user: resultUser,
                me: resultMe
            });
        } else {
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

exports.updateUser = async (req, res, next) => {
  const userId = req.params.userId;
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   const error = new Error('Validation failed, entered data is incorrect.');
  //   error.statusCode = 422;
  //   throw error;
  // }
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
  //   if (post.creator._id.toString() !== req.userId) {
  //     const error = new Error('Not authorized!');
  //     error.statusCode = 403;
  //     throw error;
  //   }
    if (imageUrl !== user.image) {
      if(user.image !== 'images/prof_default.png'){
        clearImage(user.image);
      }
    }
    user.name = name;
    user.image = imageUrl;
    user.status = status;
    const result = await user.save();
  //   io.getIO().emit('feed', {
  //     action: 'update',
  //     post: result
  //   });
  //   io.getIO().emit('singlePost', {
  //     action: 'editPost',
  //     post: result
  //   });
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

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};