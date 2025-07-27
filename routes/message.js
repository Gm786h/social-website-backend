const express = require('express');
const router = express.Router();
const{ messageController} = require('../controller');
const auth= require('../middleware/auth'); 
router.get('/:otherUserId', auth, messageController.getChatHistory);
router.post('/', auth, messageController.sendMessage);
module.exports = router;
