const express = require('express');
const router = express.Router();
const {userController} = require('../controller');
const auth=require('../middleware/auth')
const { searchUsers } = require('../controller/FriendRequestController');


router.get('/profile', auth, userController.getProfile);
router.get('/Post',auth,userController.getOneProfile)
router.get('/search', auth, searchUsers);
module.exports = router;
