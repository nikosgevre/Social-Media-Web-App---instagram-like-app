const {
  validationResult
} = require('express-validator/check');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const io = require('../socket');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try {
    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      email: email,
      password: hashedPw,
      name: name
    });

    console.log('Sending email for welcome to: ' + user.email);
    const msg = {
      to: user.email,
      from: 'welcome@insta.com',
      subject: 'Welcome!',
      html: '<strong>Welcome to my app' + user.name + '!</strong>',
    };
    sgMail.send(msg);

    const result = await user.save();

    io.getIO().emit('search', {
      action: 'createUser',
      user: user
    });

    res.status(201).json({
      message: 'User created!',
      userId: result._id
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  try {
    const user = await User.findOne({
      email: email
    });
    if (!user) {
      const error = new Error('A user with this email could not be found.');
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong password!');
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign({
        email: loadedUser.email,
        userId: loadedUser._id.toString()
      },
      '%Gkevrekis3007.', {
        expiresIn: '1h'
      }
    );
    res.status(200).json({
      token: token,
      userId: loadedUser._id.toString()
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      status: user.status
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    user.status = newStatus;
    await user.save();
    res.status(200).json({
      message: 'User updated.'
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      // return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({
        email: req.body.email
      })
      .then(user => {
        if (!user) {
          const error = new Error('A user with this email could not be found.');
          error.statusCode = 401;
          throw error;
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        // res.redirect('/');
        console.log(result.resetToken);
        console.log('Sending email for reset to: ' + req.body.email);
        const msg = {
          to: req.body.email,
          from: 'reset@insta.com',
          subject: 'Password reset',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
          `,
        };
        sgMail.send(msg).catch(err => {
          console.log(err);
        });
        res.status(200).json({
          message: 'User requested reset password!',
          userId: result._id
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
      resetToken: token,
      resetTokenExpiration: {
        $gt: Date.now()
      }
    })
    .then(user => {
      if (!user) {
        const error = new Error('A user with this token could not be found.');
        error.statusCode = 401;
        throw error;
      }
      res.status(200).json({
        message: 'User requested reset password!',
        userId: user._id,
        passwordToken: token
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  console.log(newPassword);
  console.log(userId);
  console.log(passwordToken);
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.status(200).json({
        message: 'User reseted password!',
        userId: result._id
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};