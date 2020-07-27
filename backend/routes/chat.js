const express = require('express');
const { body } = require('express-validator/check');

const chatController = require('../controllers/chat');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /chat/messages
router.get('/messages', isAuth, chatController.getMessages);

// POST send message
router.post(
    '/message',
    isAuth,
    [
      body('message')
        .trim()
        .not()
        .isEmpty()
    ],
    chatController.createMessage
  );

// PUT update post after edit
router.put(
    '/message/:msgId',
    isAuth,
    [
      body('content')
        .trim()
        .isLength({ min: 1 })
    ],
    chatController.updateMessage
  );


// GET view post details
router.get('/message/:msgId', isAuth, chatController.getMessage);

// DELETE delete message
router.delete('/message/:msgId', isAuth, chatController.deleteMessage);

// // GET /feed/userPosts
// router.get('/userPosts', isAuth, feedController.getUserSpecificPosts);

// // GET /feed/getLikes
// router.get('/getLikes/:postId', isAuth, feedController.getLikes);

// // GET /feed/getComments
// router.get('/getComments/:refId', isAuth, feedController.getComments);

// // // GET /feed/getCommentsOfComment
// // router.get('/getCommentsOfComment/:commentId', isAuth, feedController.getCommentsOfComments);

// // POST post like handler backend
// router.post('/postLike', isAuth, feedController.postLike);

// // POST comment like handler backend
// router.post('/commentLike', isAuth, feedController.commentLike);

// // GET /feed/getCommentsLikes
// router.get('/getCommentsLikes/:commentId', isAuth, feedController.getCommentsLikes);

// // POST /feed/post
// router.post(
//   '/post',
//   isAuth,
//   [
//     body('title')
//       .trim()
//       .isLength({ min: 5 }),
//     body('content')
//       .trim()
//       .isLength({ min: 0 })
//   ],
//   feedController.createPost
// );

// // POST /feed/postComment
// router.post(
//   '/postComment/',
//   isAuth,
//   [
//     body('comment')
//       .trim()
//       .isLength({ min: 0 })
//   ],
//   feedController.postComment
// );

// // PUT update comment
// router.put(
//   '/editComment',
//   isAuth,
//   [
//     body('comment')
//       .trim()
//       .isLength({ min: 0 })
//   ],
//   feedController.updateComment
// );

// // GET view post details
// router.get('/post/:postId', isAuth, feedController.getPost);

// // GET comment
// router.get('/getComment/:commentId', isAuth, feedController.getComment);

// // PUT update post after edit
// router.put(
//   '/post/:postId',
//   isAuth,
//   [
//     body('title')
//       .trim()
//       .isLength({ min: 1 }),
//     body('content')
//       .trim()
//       .isLength({ min: 1 })
//   ],
//   feedController.updatePost
// );

// // DELETE delete post
// router.delete('/post/:postId', isAuth, feedController.deletePost);

// // DELETE delete comment
// router.delete('/comment', isAuth, feedController.deleteComment);

// // GET sort posts
// router.get('/sortPosts', isAuth, feedController.getSortPosts);

// // GET sort comments
// router.get('/sortComments', isAuth, feedController.getSortComments);

module.exports = router;
