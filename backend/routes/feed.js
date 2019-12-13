const express = require('express');
const { body } = require('express-validator/check');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// GET /feed/userPosts
router.get('/userPosts', isAuth, feedController.getUserSpecificPosts);

// GET /feed/getLikes
router.get('/getLikes/:postId', isAuth, feedController.getLikes);

// GET /feed/getComments
router.get('/getComments/:postId', isAuth, feedController.getComments);

// POST like handler backend
router.post('/postLike', isAuth, feedController.postLike);

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
      .isLength({ min: 0 })
  ],
  feedController.createPost
);

// POST /feed/postComment
router.post(
  '/postComment/:postId',
  isAuth,
  [
    body('comment')
      .trim()
      .isLength({ min: 0 })
  ],
  feedController.postComment
);

// PUT update comment
router.put(
  '/editComment',
  isAuth,
  [
    body('comment')
      .trim()
      .isLength({ min: 0 })
  ],
  feedController.updateComment
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

// DELETE delete comment
router.delete('/comment', isAuth, feedController.deleteComment);

module.exports = router;
