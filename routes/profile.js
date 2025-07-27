const express = require('express');
const router = express.Router();
const upload = require('../middleware/multermiddleware');
const auth = require('../middleware/auth'); 
const { uploadProfileImage,getProfileImage } = require('../controller/profleController');
router.put('/upload-profile', auth, upload.single('image'), uploadProfileImage);
router.get('/me', auth, getProfileImage);
module.exports = router;