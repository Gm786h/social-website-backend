const express = require('express');
const auth = require('../middleware/auth');
const { commentController } = require('../controller');

const router = express.Router();

router.post('/:postId', auth, commentController.addComment);

module.exports = router;
