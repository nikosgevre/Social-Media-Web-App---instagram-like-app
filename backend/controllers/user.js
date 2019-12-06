const User = require('../models/user');

exports.getSearch = async (req, res, next) => {
    const searchName = req.query.username;
    const limit = req.query.limit;
    let counter = 0;
    let searchResults = [];
    // console.log(searchName);
    // console.log(limit);
    try {
        const users = await User.find();
        // console.log(users);
        for (let user of users) {
            // console.log('user: ' + user);
            // let namae = user.name.toString();
            // console.log('user to string: ' + namae);
            if ((user.name.toString().includes(searchName)) && (counter < limit)) {
                // console.log('vrika: ' + user.name);
                searchResults.push(user);
                counter++;
            }
        }
        // console.log('searchResults: ' + searchResults);
        res.status(200).json({
            message: 'Fetched users successfully.',
            users: searchResults
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getProfile = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId)
            .populate('posts')
            .populate('followers')
            .populate('following');

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

exports.userFollow = async (req, res, next) => {
    const meId = req.query.meId;
    const userId = req.query.userId;

    try {
        const user = await User.findById(userId).populate('followers').populate('following');
        const me = await User.findById(meId).populate('followers').populate('following');

        if (!me.following.some(follow => follow._id.toString() === userId)) {
            me.following.push(user);
            user.followers.push(me);
            const resultMe = await me.save();
            const resultUser = await user.save();
            res.status(200).json({
                message: 'User followed!',
                user: resultUser,
                me: resultMe
            });
        } else {
            me.following = me.following.filter(el => {
                return el.name != user.name;
            });
            user.followers = user.followers.filter(el => {
                return el.name != me.name;
            });
            const resultMe = await me.save();
            const resultUser = await user.save();
            res.status(200).json({
                message: 'User unfollowed!',
                user: resultUser,
                me: resultMe
            });
        }

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

};