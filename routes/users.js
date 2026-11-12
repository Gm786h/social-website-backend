const express = require('express');
const auth = require('../middleware/auth');
const { userController, frController } = require('../controller');

const router = express.Router();

router.get('/profile', auth, userController.getProfile);
router.get('/Post', auth, userController.getOneProfile);
router.get('/search', auth, frController.searchUsers);

module.exports = router;
