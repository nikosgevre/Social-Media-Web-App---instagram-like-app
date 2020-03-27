const express = require('express');
const { body } = require('express-validator/check');

const User = require('../models/user');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// PUT signup route
router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('E-Mail address already exists!');
          }
        });
      })
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 5 }),
    body('name')
      .trim()
      .not()
      .isEmpty()
  ],
  authController.signup
);

// POST /login
router.post('/login', authController.login);

// GET user status
router.get('/status', isAuth, authController.getUserStatus);

// PATCH update user status
router.patch(
  '/status',
  isAuth,
  [
    body('status')
      .trim()
      .not()
      .isEmpty()
  ],
  authController.updateUserStatus
);

// POST /reset
router.post('/reset', authController.postReset);

// GET /reset/token
router.get('/reset/:token', authController.getNewCredential);

// POST new credentials
router.post('/new-credentials', authController.postNewCredential);

module.exports = router;
