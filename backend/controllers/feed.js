const fs = require('fs');
const path = require('path');

const {
  validationResult
} = require('express-validator/check');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = Number.MAX_SAFE_INTEGER; //Add number for pagination

  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
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

exports.getUserSpecificPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = Number.MAX_SAFE_INTEGER; //Add number for pagination
  const userId = req.query.userId;

  // console.log('yoyoyoyoyyoyoyyoyoyo ' + userId);

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
    io.getIO().emit('posts', {
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
  // console.log("**************************");
  const postId = req.params.postId;
  const post = await Post.findById(postId)
    .populate('creator')
    .populate('likes');
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
    io.getIO().emit('posts', {
      action: 'update',
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
    const post = await Post.findById(postId);

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
    // Check logged in user
    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    io.getIO().emit('posts', {
      action: 'delete',
      post: postId
    });
    res.status(200).json({
      message: 'Deleted post.'
    });
    // res.redirect(200, '/');
    // res.json({ message: 'Deleted post.' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postSearch = async (req, res, next) => {
  const searchName = req.body.username;
  let searchResults = [];
  User.find({
      userId: req.user._id
    })
    .then(usernames => {
      for (let name of usernames) {
        console.log('orin: ' + name.name + '  ---  incl: ' + searchName);
        if (usernames.name.toString().includes(searchName)) {
          searchResults.push(name);
        }
      }
      res.status(200).json({
        message: 'Search results fetched.',
        searchResult: searchResult
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getProfile = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId)
      .populate('posts');

    if (!user) {
      const error = new Error('Could not find user profile.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'User profile fetched.',
      user: user
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getFollowers = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId)
      .populate('followers');
    res.status(200).json({
      message: 'User followers fetched.',
      user: user
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getFollowing = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId)
      .populate('following');
    res.status(200).json({
      message: 'User following fetched.',
      user: user
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

  // console.log('userId: ' + userId);

  try {
    const post = await Post.findById(postId).populate('creator').populate('likes');
    const user = await User.findById(userId);

    if (!post.likes.some(like => like._id.toString() === userId)) {
      post.likes.push(user);
      console.log('liked a post');
      const result = await post.save();
      res.status(200).json({
        message: 'Post liked!',
        post: result
      });
    } else {
      post.likes = post.likes.filter(el => {
        return el.name != user.name;
      });
      console.log('Disliked a post');
      const result = await post.save();
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

exports.postDislike = async (req, res, next) => {
  const postId = req.query.postId;
  const userId = req.query.userId;

  console.log('userId: ' + userId);

  try {
    const post = await Post.findById(postId).populate('creator').populate('likes');
    const user = await User.findById(userId);
    // console.log('asdasd ' + (user._id));
    // console.log('post likes: ' + post.likes);
    // console.log('true or false: ' + post.likes.some(liker => liker._id.valueOf() === user._id.valueOf()));
    // console.log('true or false: ' + post.likes.some(like => like._id.toString() === req.query.userId));
    if (post.likes.some(like => like._id.toString() === userId)) {
      // console.log('user pou kanei like: ' + user);
      // post.likes.push(user);
      // let array=post.likes;
      // console.log('___' + post.likes);
      post.likes = post.likes.filter(el => {
        return el.name != user.name;
      });
      // console.log('--- ' + post.likes);
      console.log('Disliked a post');
      const result = await post.save();
      res.status(200).json({
        message: 'Post disliked!',
        post: result
      });
    } else {
      console.log('Post already disliked!');
      res.status(200).json({
        message: 'Post already disliked!',
        post: post
      });
    }

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