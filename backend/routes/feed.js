const express = require('express');
const { body } = require('express-validator/check');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();



// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// GET /feed/userPosts
router.get('/userPosts', isAuth, feedController.getUserSpecificPosts);

// GET like handler backend
router.post('/postLike', isAuth, feedController.postLike);

// to be deleted
router.post('/postDislike', isAuth, feedController.postDislike);

// POST Search
router.get('/search', isAuth, feedController.getSearch);

router.get('/profile/:userId', isAuth, feedController.getProfile);

router.get('/userFollowers/:userId', isAuth, feedController.getFollowers);

router.get('/userFollowing/:userId', isAuth, feedController.getFollowing);

// POST /feed/post
router.post(
  '/post',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  feedController.createPost
);

router.get('/post/:postId', isAuth, feedController.getPost);

router.put(
  '/post/:postId',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  feedController.updatePost
);

router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;
