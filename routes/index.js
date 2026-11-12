const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/posts', require('./post'));
router.use('/likes', require('./like'));
router.use('/comments', require('./comment'));
router.use('/Addfriend', require('./friendRequest'));
router.use('/message', require('./message'));
router.use('/profile', require('./profile'));

module.exports = router;
