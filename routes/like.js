const express=require('express');
const router=express.Router();
const auth=require('../middleware/auth')
const { likeController } = require("../controller");


router.post('/:postId/like',auth,likeController.likePost)
router.get('/:postId/status', auth, likeController.checkIfLiked);

module.exports = router;