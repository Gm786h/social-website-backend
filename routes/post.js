const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/multermiddleware');
const { postController } = require('../controller');

const router = express.Router();

router.post('/', auth, upload.single('image'), postController.createPost);
router.get('/', auth, postController.getAllPosts);
router.get('/:postId', auth, postController.getPostById);

module.exports = router;
