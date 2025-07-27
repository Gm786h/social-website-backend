const express = require('express');
const router = express.Router();
const {postController}= require('../controller');
const auth=require('../middleware/auth')
 const upload= require('../middleware/multermiddleware');

router.post('/', auth, upload.single('image'), postController.createPost);
router.get('/', auth, postController.getAllPosts);
router.get('/:postId',auth,postController.getPostById)
module.exports = router;
