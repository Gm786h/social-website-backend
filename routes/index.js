const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./auth');
const userRoutes = require('./users');
const postRoutes = require('./post');
const likeRoutes=require('./like');
const commentRoter=require('./comment');
const FriendRequestRoutes=require('./friendRequest')
const messageRoutes=require('./message');
const profileRoutes = require('./profile');
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/likes',likeRoutes);
router.use('/comments',commentRoter);
router.use('/Addfriend',FriendRequestRoutes);
router.use('/message',messageRoutes)
router.use('/profile', profileRoutes);

module.exports = router;
