// controllers/index.js

const authController = require('./authController');
const postController = require('./postController');
const userController = require('./userController');
const commentController=require('./commentController');
const likeController=require('./likeController');
const friendController=require('./friendController');
const frController=require('./FriendRequestController')
const messageController=require('./messageController.')
const profileController=require('./profleController')

module.exports = {
  authController,
  postController,
  userController,
  commentController,
  likeController,
  friendController,
  messageController,
  frController,
  profileController

};
