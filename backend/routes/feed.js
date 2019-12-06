const express = require('express');
const { body } = require('express-validator/check');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// GET /feed/userPosts
router.get('/userPosts', isAuth, feedController.getUserSpecificPosts);

// POST like handler backend
router.post('/postLike', isAuth, feedController.postLike);

// to be deleted
router.post('/postDislike', isAuth, feedController.postDislike);

// POST follow handler backend
router.post('/userFollow', isAuth, feedController.userFollow);

// POST Search
router.get('/search', isAuth, feedController.getSearch);

// GET user profile
router.get('/profile/:userId', isAuth, feedController.getProfile);

// to be deleted
router.get('/userFollowers/:userId', isAuth, feedController.getFollowers);

// to be deleted
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

// GET view post details
router.get('/post/:postId', isAuth, feedController.getPost);

// PUT update post after edit
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

// DELETE delete post
router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;
