const express=require('express');
const router=express.Router();
const auth=require('../middleware/auth')
const { commentController } = require('../controller');

router.post('/:postId', auth, commentController.addComment);

module.exports = router;