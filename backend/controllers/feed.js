const fs = require('fs');
const path = require('path');

const {
  validationResult
} = require('express-validator/check');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = Number.MAX_SAFE_INTEGER; //Add number for pagination
  const userId = req.query.userId;

  try {

    const user = await User.findById(userId);
    const followingUsers = user.following;
    followingUsers.push(user);

    const totalItems = await Post.find({creator: { $in: followingUsers }}).countDocuments();
    const posts = await Post.find({creator: { $in: followingUsers }})
      .populate('creator')
      .populate('likes')
      .sort({
        createdAt: -1
      })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    // for (let post of posts){
      // console.log(posts);
    // }

    res.status(200).json({
      message: 'Fetched posts successfully.',
      posts: posts,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUserSpecificPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = Number.MAX_SAFE_INTEGER; //Add number for pagination
  const userId = req.query.userId;

  try {
    const totalItems = await Post.find({
      creator: userId
    }).countDocuments();
    const posts = await Post.find({
        creator: userId
      })
      .populate('creator')
      .populate('likes')
      .sort({
        createdAt: -1
      })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: 'Fetched posts successfully.',
      posts: posts,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    io.getIO().emit('feed', {
      action: 'create',
      post: {
        ...post._doc,
        creator: {
          _id: req.userId,
          name: user.name
        }
      }
    });
    res.status(201).json({
      message: 'Post created successfully!',
      post: post,
      creator: {
        _id: user._id,
        name: user.name
      }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId)
    .populate('creator')
    .populate('likes')
    .populate('comments');
  try {
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'Post fetched.',
      post: post
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error('No file picked.');
    error.statusCode = 422;
    throw error;
  }
  try {
    const post = await Post.findById(postId).populate('creator');
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    const result = await post.save();
    io.getIO().emit('feed', {
      action: 'update',
      post: result
    });
    io.getIO().emit('singlePost', {
      action: 'editPost',
      post: result
    });
    res.status(200).json({
      message: 'Post updated!',
      post: result
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    // to post pou prepei na kanw delete
    const post = await Post.findById(postId).populate('comments');

    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }

    // delete image
    clearImage(post.imageUrl);

    // posts' comments
    let comments = await Comment.find({ post : post._id}).populate('creator');

    // for each comment find the user that made the comment and delete it from his comments reference
    for (let cmc of comments) {
      let userA = await User.findById(cmc.creator._id);
      userA.comments.pull(cmc._id);
      await userA.save();
    }

    // delete the comments of the post
    comments = await Comment.deleteMany({ post: post._id});

    // delete the post
    await Post.findByIdAndDelete(postId);

    // delete the post from its user reference
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    io.getIO().emit('feed', {
      action: 'delete',
      post: postId
    });
    res.status(200).json({
      message: 'Deleted post.'
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  const commentId = req.query.commentId;
  const postId = req.query.postId;
  
  try {
    const comment = await Comment.findById(commentId).populate('post');
    // console.log(comment.post._id);
    // console.log('cmid: ' + commentId);
    // console.log('pstid ' + postId);
    if (!comment) {
      const error = new Error('Could not find comment.');
      error.statusCode = 404;
      throw error;
    }
    if (comment.creator.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    // Check logged in user
    // clearImage(post.imageUrl);

    await Comment.findByIdAndRemove(commentId);

    const user = await User.findById(req.userId);
    user.comments.pull(commentId);
    await user.save();
    const post = await Post.findById(postId).populate('comments');
    post.comments.pull(commentId);
    await post.save();

    io.getIO().emit('singlePost', {
      action: 'deleteComment',
      post: postId
    });
    io.getIO().emit('post', {
      action: 'deleteComment',
      post: postId
    });
    res.status(200).json({
      message: 'Deleted comment.'
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postLike = async (req, res, next) => {
  const postId = req.query.postId;
  const userId = req.query.userId;
  // console.log('pid: ' + postId);
  // console.log('uid: ' + userId);

  try {
    const post = await Post.findById(postId).populate('creator').populate('likes');
    const user = await User.findById(userId);

    if (!post.likes.some(like => like._id.toString() === userId)) {
      post.likes.push(user);
      // console.log('liked a post');
      const result = await post.save();
      io.getIO().emit('singlePost', {
        action: 'postLike',
        post: postId
      });
      io.getIO().emit('post', {
        action: 'postLike',
        post: postId
      });
      res.status(200).json({
        message: 'Post liked!',
        post: result
      });
    } else {
      post.likes = post.likes.filter(el => {
        return el.name != user.name;
      });
      // console.log('Disliked a post');
      const result = await post.save();
      io.getIO().emit('singlePost', {
        action: 'postLike',
        post: postId
      });
      io.getIO().emit('post', {
        action: 'postLike',
        post: postId
      });
      res.status(200).json({
        message: 'Post disliked!',
        post: result
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

};

exports.commentLike = async (req, res, next) => {
  const commentId = req.query.commentId;
  const userId = req.query.userId;
  // console.log('pid: ' + postId);
  // console.log('uid: ' + userId);

  try {
    const comment = await Comment.findById(commentId).populate('creator').populate('likes');
    const user = await User.findById(userId);

    if (!comment.likes.some(like => like._id.toString() === userId)) {
      comment.likes.push(user);
      // console.log('liked a post');
      const result = await comment.save();
      io.getIO().emit('singlePost', {
        action: 'commentLike',
        comment: commentId
      });
      io.getIO().emit('post', {
        action: 'commentLike',
        comment: commentId
      });
      res.status(200).json({
        message: 'Comment liked!',
        comment: result
      });
    } else {
      comment.likes = comment.likes.filter(el => {
        return el.name != user.name;
      });
      // console.log('Disliked a post');
      const result = await comment.save();
      io.getIO().emit('singlePost', {
        action: 'commentLike',
        comment: commentId
      });
      io.getIO().emit('post', {
        action: 'commentLike',
        comment: commentId
      });
      res.status(200).json({
        message: 'Post disliked!',
        comment: result
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

};

exports.postComment = async (req, res, next) => {
  // console.log('yo');
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const comment = req.body.comment;
  const newComment = new Comment({
    comment: comment,
    creator: req.userId,
    post: postId
  });
  try {
    await newComment.save();
    const user = await User.findById(req.userId);
    user.comments.push(newComment);
    await user.save();
    const post = await Post.findById(postId);
    post.comments.push(newComment);
    await post.save();
    io.getIO().emit('post', {
      action: 'createComment',
      post: postId
    });
    io.getIO().emit('singlePost', {
      action: 'createComment',
      post: postId
    });
    res.status(201).json({
      message: 'Comment created successfully!',
      comment: comment,
      post: post
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getComments = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const comments = await Comment.find({ post: postId})
    .populate('creator');
    if (!comments) {
      const error = new Error('Could not find comments.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'Post fetched.',
      comments: comments
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getLikes = async (req, res, next) => {
  const postId = req.params.postId;
  // console.log(postId);
  try {
    // const post = await Post.findById(postId)
    // .populate('creator')
    // .populate('likes')
    // .populate('comments');
    const post = await Post.findById(postId)
    .populate('likes').populate('creator');
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'Post fetched.',
      likes: post.likes
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getCommentsLikes = async (req, res, next) => {
  const commentId = req.params.commentId;
  // console.log(commentId);
  try {
    // const post = await Post.findById(postId)
    // .populate('creator')
    // .populate('likes')
    // .populate('comments');
    const comment = await Comment.findById(commentId)
    .populate('likes').populate('creator');
    if (!comment) {
      const error = new Error('Could not find comment.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'Post fetched.',
      likes: comment.likes
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateComment = async (req, res, next) => {
  const commentId = req.query.commentId;
  const postId = req.query.postId;
  const errors = validationResult(req);
  // console.log(commentId);
  // console.log(postId);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const content = req.body.comment;
  try {
    const comment = await Comment.findById(commentId).populate('creator');
    if (!comment) {
      const error = new Error('Could not find comment.');
      error.statusCode = 404;
      throw error;
    }
    if (comment.creator._id.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    comment.comment = content;
    const resultComment = await comment.save();
    const post = await Post.findById(postId);
    // result = await post.save();
    io.getIO().emit('singlePost', {
      action: 'editComment',
      post: post
    });
    io.getIO().emit('post', {
      action: 'editComment',
      post: post
    });
    res.status(200).json({
      message: 'Post updated!',
      post: post
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