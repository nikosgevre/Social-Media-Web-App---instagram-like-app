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
router.get('/getComments/:refId', isAuth, feedController.getComments);

// // GET /feed/getCommentsOfComment
// router.get('/getCommentsOfComment/:commentId', isAuth, feedController.getCommentsOfComments);

// POST post like handler backend
router.post('/postLike', isAuth, feedController.postLike);

// POST comment like handler backend
router.post('/commentLike', isAuth, feedController.commentLike);

// GET /feed/getCommentsLikes
router.get('/getCommentsLikes/:commentId', isAuth, feedController.getCommentsLikes);

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
  '/postComment/',
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

// GET comment
router.get('/getComment/:commentId', isAuth, feedController.getComment);

// PUT update post after edit
router.put(
  '/post/:postId',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 1 }),
    body('content')
      .trim()
      .isLength({ min: 1 })
  ],
  feedController.updatePost
);

// DELETE delete post
router.delete('/post/:postId', isAuth, feedController.deletePost);

// DELETE delete comment
router.delete('/comment', isAuth, feedController.deleteComment);

module.exports = router;
