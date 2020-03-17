const express = require('express');
const { body } = require('express-validator/check');

const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /feed/posts
router.get('/getusers', isAuth, userController.getUsers);

// POST follow handler backend
router.post('/userFollow', isAuth, userController.userFollow);

// POST Search
router.get('/search', isAuth, userController.getSearch);

// GET user profile
router.get('/profile/:userId', isAuth, userController.getProfile);

// // PUT user edit
// router.put('/profileEdit/:userId', isAuth, userController.getProfile);

// PUT update post after edit
router.put(
    '/profileEdit/:userId',
    isAuth,
    [
      body('name')
        .trim()
        .isLength({ min: 1 }),
      body('status')
        .trim()
        .isLength({ min: 1 })
    ],
    userController.updateUser
  );

module.exports = router;