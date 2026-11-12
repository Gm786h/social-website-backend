const express = require('express');
const auth = require('../middleware/auth');
const { likeController } = require('../controller');

const router = express.Router();

router.post('/:postId/like', auth, likeController.likePost);
router.get('/:postId/status', auth, likeController.checkIfLiked);

module.exports = router;
