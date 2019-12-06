const express = require('express');

const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// POST follow handler backend
router.post('/userFollow', isAuth, userController.userFollow);

// POST Search
router.get('/search', isAuth, userController.getSearch);

// GET user profile
router.get('/profile/:userId', isAuth, userController.getProfile);

module.exports = router;