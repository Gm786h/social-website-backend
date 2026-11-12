const express = require('express');
const auth = require('../middleware/auth');
const { messageController } = require('../controller');

const router = express.Router();

router.get('/:otherUserId', auth, messageController.getChatHistory);
router.post('/', auth, messageController.sendMessage);

module.exports = router;
