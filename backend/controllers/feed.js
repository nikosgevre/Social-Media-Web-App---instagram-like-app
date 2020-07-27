const fs = require('fs');
const path = require('path');

const {
  validationResult
} = require('express-validator/check');

const io = require('../socket');

const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

// get the posts for the feed page
exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = Number.MAX_SAFE_INTEGER; //Add number for pagination
  const userId = req.query.userId;

  let followingUsers = [];

  try {

    const user = await User.findById(userId);
    // if the user has followers, add them to the array of users from whom i can see posts
    if(user.following){
      followingUsers = user.following;
    }
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

// get the posts for my profile
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
        createdAt: 1
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

// sort posts
exports.getSortPosts = async (req, res, next) => {
  const userId = req.query.userId;
  const sort = req.query.sort;

  try {
    const totalItems = await Post.find({
      creator: userId
    }).countDocuments();
    const posts = await Post.find({
        creator: userId
      })
      .populate('creator')
      .populate('likes');

    switch (sort) {
      case "popular":
        console.log("Sorting popular descending");
        posts.sort((a, b) => parseFloat(b.likes.length) - parseFloat(a.likes.length));
        break;
      case "Mrecent":
        console.log("Sorting recent descending");
        posts.sort((a, b) => (a.createdAt > b.createdAt) ? -1 : 1);
        break;
      case "Lrecent":
        console.log("Sorting recent ascending");
        posts.sort((a, b) => (a.createdAt > b.createdAt) ? 1 : -1);
        break;
    }
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

// get all the details of a single post
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

// create new post cotroller
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
  // create the post
  // console.log(req.file.mimetype);
  const type = req.file.mimetype;
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    mimetype: type,
    creator: req.userId
  });
  try {
    // save the post
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    // emit the post creation through socket.io
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

// update post controller
exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  // get the new details of the post to be updated
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
    // update the details of the post
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    const result = await post.save();
    // emit the updated post to the different routes that requested the updated post
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

// delete post controller
exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    // the post to be deleted
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

    // post's comments
    let comments = await Comment.find({ refId : post._id}).populate('creator');

    // for each comment find the user that made the comment and delete it from his comments reference and delete all its nested comments
    for (let cmc of comments) {

      // get the user of the comment and delete the reference
      let userA = await User.findById(cmc.creator._id);
      userA.comments.pull(cmc._id);
      await userA.save();

      // get comment's comments
      let comments2 = await Comment.find({ refId : cmc._id, reference: 'comment' }).populate('creator');

      // for each comment find the user that made the comment and delete it from his comments reference
      for (let cmc2 of comments2) {
        let userA = await User.findById(cmc2.creator._id);
        userA.comments.pull(cmc2._id);
        await userA.save();
      }

      // delete the comments of the comment
      comments2 = await Comment.deleteMany({ refId: cmc._id, reference: 'comment' });
    }

    // delete the comments of the post
    comments = await Comment.deleteMany({ refId: post._id});

    // delete the post
    await Post.findByIdAndDelete(postId);

    // delete the post from its user reference
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    // emit the changes to the requested route
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

// post like/dislike controller
exports.postLike = async (req, res, next) => {
  const postId = req.query.postId;
  const userId = req.query.userId;

  try {
    const post = await Post.findById(postId).populate('creator').populate('likes');
    const user = await User.findById(userId);

    // post like controller
    if (!post.likes.some(like => like._id.toString() === userId)) {
      // add the user the post's likes
      post.likes.push(user);
      user.postLikes.push(post);
      const result = await post.save();
      await user.save();
      // emit the changes
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
    }
    // post dislike controller 
    else {
      // remove the user from the post's likes
      post.likes = post.likes.filter(el => {
        return el.name != user.name;
      });
      user.postLikes.pull(postId);
      const result = await post.save();
      await user.save();
      // emit the changes
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

// create comment to post/comment controller
exports.postComment = async (req, res, next) => {
  const ref = req.query.ref;
  const refId = req.query.refId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  // create the comment
  const comment = req.body.comment;
  const newComment = new Comment({
    comment: comment,
    creator: req.userId,
    reference: ref,
    refId: refId
  });
  try {
    await newComment.save();
    // update the user that created the comment
    const user = await User.findById(req.userId);
    user.comments.push(newComment);
    await user.save();
    // whether the comment belongs to a post or a comment, update the the database accordingly
    if(ref==='post'){
      const post = await Post.findById(refId);
      post.comments.push(newComment);
      post.totalComments += 1;
      await post.save();
    } else if(ref==='comment'){
      // if the comment is a nested comment, update the parent comment
      const parentComment = await Comment.findById(refId);
      parentComment.comments.push(newComment);
      const post = await Post.findById(parentComment.refId);
      post.totalComments += 1;
      await post.save();
      await parentComment.save();
    }
    
    // emit the changes
    io.getIO().emit('post', {
      action: 'createComment',
      post: refId
    });
    io.getIO().emit('singlePost', {
      action: 'createComment',
      post: refId
    });
    res.status(201).json({
      message: 'Comment created successfully!',
      comment: comment
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// update comment controller
exports.updateComment = async (req, res, next) => {
  const commentId = req.query.commentId;
  const postId = req.query.postId;
  const errors = validationResult(req);
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
    // update comment's content
    comment.comment = content;
    await comment.save();
    const post = await Post.findById(postId);

    // emit the changes
    io.getIO().emit('singlePost', {
      action: 'editComment',
      post: post
    });
    io.getIO().emit('post', {
      action: 'editComment',
      post: post
    });
    io.getIO().emit('comment', {
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

// delete comment controller
exports.deleteComment = async (req, res, next) => {
  const commentId = req.query.commentId;
  const postId = req.query.postId;

  let totalItems = 1;
  
  try {
    const comment = await Comment.findById(commentId);
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

    // delete reference to the parent comment
    if(comment.reference==='comment'){
      const parentComment = await Comment.findById(comment.refId);
      if(!parentComment){
        console.log('no parent comment');
      }
      parentComment.comments.pull(commentId);
    }
    
    // get comment's comments
    let comments = await Comment.find({ refId : commentId, reference: 'comment' }).populate('creator');
    totalItems += await Comment.find({ refId : commentId, reference: 'comment' }).countDocuments();

    // for each comment find the user that made the comment and delete it from his comments reference
    for (let cmc of comments) {
      let userA = await User.findById(cmc.creator._id);
      userA.comments.pull(cmc._id);
      await userA.save();
    }

    // delete the comments of the comment
    await Comment.deleteMany({ refId: commentId, reference: 'comment' });

    // delete the main comment
    await Comment.findByIdAndRemove(commentId);

    // update the user and the post
    const user = await User.findById(req.userId);
    user.comments.pull(commentId);
    await user.save();
    const post = await Post.findById(postId).populate('comments');
    post.comments.pull(commentId);
    post.totalComments -= totalItems;
    await post.save();

    // emit the changes
    io.getIO().emit('singlePost', {
      action: 'deleteComment',
      post: postId
    });
    io.getIO().emit('post', {
      action: 'deleteComment',
      post: postId
    });
    io.getIO().emit('comment', {
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

// comment like/dislike controller
exports.commentLike = async (req, res, next) => {
  const commentId = req.query.commentId;
  const userId = req.query.userId;

  try {
    const comment = await Comment.findById(commentId).populate('creator').populate('likes');
    const user = await User.findById(userId);

    // like controller
    if (!comment.likes.some(like => like._id.toString() === userId)) {
      comment.likes.push(user);
      user.commentLikes.push(comment);
      const result = await comment.save();
      await user.save();
      // emit changes
      io.getIO().emit('comment', {
        action: 'commentLike',
        comment: commentId
      });
      io.getIO().emit('singlePost', {
        action: 'commentLike',
        comment: commentId
      });
      res.status(200).json({
        message: 'Comment liked!',
        comment: result
      });
    }
    // dislike controller 
    else {
      comment.likes = comment.likes.filter(el => {
        return el.name != user.name;
      });
      user.commentLikes.pull(commentId);
      const result = await comment.save();
      await user.save();
      // emit changes
      io.getIO().emit('singlePost', {
        action: 'commentLike',
        comment: commentId
      });
      io.getIO().emit('comment', {
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

// get all comments
exports.getComments = async (req, res, next) => {
  const refId = req.params.refId;
  try {
    const comments = await Comment.find({ refId: refId})
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

// sort comments
exports.getSortComments = async (req, res, next) => {
  const refId = req.query.refId;
  const sort = req.query.sort;

  try {
    const comments = await Comment.find({ refId: refId})
    .populate('creator').populate('likes');

    switch (sort) {
      case "popular":
        console.log("Sorting popular descending");
        comments.sort((a, b) => parseFloat(b.likes.length) - parseFloat(a.likes.length));
        break;
      case "Mrecent":
        console.log("Sorting recent descending");
        comments.sort((a, b) => (a.createdAt > b.createdAt) ? -1 : 1);
        break;
      case "Lrecent":
        console.log("Sorting recent ascending");
        comments.sort((a, b) => (a.createdAt > b.createdAt) ? 1 : -1);
        break;
    }
    res.status(200).json({
      message: 'Fetched comments successfully.',
      comments: comments
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// get all post's likes
exports.getLikes = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId)
    .populate('likes').populate('creator');
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'Likes fetched.',
      likes: post.likes
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// get all comments' likes
exports.getCommentsLikes = async (req, res, next) => {
  const commentId = req.params.commentId;
  try {
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

// get comment controller
exports.getComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  const comment = await Comment.findById(commentId)
    .populate('creator')
    .populate('likes')
    .populate('comments');
  try {
    if (!comment) {
      const error = new Error('Could not find comment.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'Comment fetched.',
      comment: comment
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// helper function for deleting an image
const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};