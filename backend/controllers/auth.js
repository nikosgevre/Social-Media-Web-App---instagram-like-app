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

// signup controller
exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  // get email, name, password from form
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try {
    // hassh password for security reasons
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPw,
      name: name
    });

    // send welocming email to the new user
    console.log('Sending email for welcome to: ' + user.email);
    const msg = {
      to: user.email,
      from: 'Insta Welcome <welcome@insta.com>',
      subject: 'Welcome!',
      html: '<strong>Welcome to my app ' + user.name + '!</strong>',
    };
    sgMail.send(msg);

    const result = await user.save();

    // emit addition of a new user to search component
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

// login controller
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
    // compare hashed passwords
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong password!');
      error.statusCode = 401;
      throw error;
    }
    // create token
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

// get user status controller
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

// update user status controller
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

// reset password and email controller
exports.postReset = async (req, res, next) => {
  const type = req.query.type;
  const userId = req.body.userId;
  let message = '';

  // create reset token
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString('hex');

    // reset password controller
    if (type === 'password') {
      // find user with the email provided and create a reset token for him
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
          // send email for reset password
          message = 'User requested reset password!';
          console.log('Sending email for \'reset password\' to: ' + req.body.email);
          const msg = {
            to: req.body.email,
            from: 'Insta Reset <reset@insta.com>',
            subject: 'Password reset',
            html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/resetP/${token}">link</a> to set a new password.</p>
          `,
          };
          sgMail.send(msg);
          res.status(200).json({
            message: message,
            userId: result._id
          });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    }
    // reset email controller 
    else if (type === 'email') {
      // find user of the request.user._id and craete a reset token
      User.findById(userId).then(user => {
          if (!user) {
            const error = new Error('A user with this id could not be found.');
            error.statusCode = 401;
            throw error;
          }
          user.resetToken = token;
          user.resetTokenExpiration = Date.now() + 3600000;
          return user.save();
        })
        .then(result => {
          // send email for reset email
          message = 'User requested reset email!';
          console.log('Sending email for \'reset email\' to: ' + req.body.email);
          const msg = {
            to: req.body.email,
            from: 'Insta Reset <reset@insta.com>',
            subject: 'Email reset',
            html: `
            <p>You requested an email reset</p>
            <p>Click this <a href="http://localhost:3000/resetE/${token}">link</a> to set a new email.</p>
          `,
          };
          sgMail.send(msg);
          res.status(200).json({
            message: message,
            userId: result._id
          });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    }
  });
};

// get user's token for reset
exports.getNewCredential = async (req, res, next) => {
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
        resetToken: token
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// update password and email controller
exports.postNewCredential = async (req, res, next) => {
  const userId = req.body.userId;
  const resetToken = req.body.resetToken;
  const type = req.query.type;

  let resetUser;
  let message = '';

  try {
    // find the user that requested a reset
    const user = await User.findOne({
      resetToken: resetToken,
      resetTokenExpiration: {
        $gt: Date.now()
      },
      _id: userId
    });
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    resetUser = user;
    // reset password controller
    if (type === 'password') {
      // hash the new password and save the user
      const newPassword = req.body.password;
      const hashedPassword1 = await bcrypt.hash(newPassword, 12);
      resetUser.password = hashedPassword1;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      await resetUser.save();
      message = 'User password reseted!';
    }
    // reset email controller 
    else if (type === 'email') {
      // update user with new email
      const newEmail = req.body.email;
      resetUser.email = newEmail;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      await resetUser.save();
      message = 'User email reseted!';
    }
    res.status(200).json({
      message: message,
      userId: user._id
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};