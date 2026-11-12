const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/multermiddleware');
const { profileController } = require('../controller');

const router = express.Router();

router.put('/upload-profile', auth, upload.single('image'), profileController.uploadProfileImage);
router.get('/me', auth, profileController.getProfileImage);

module.exports = router;
