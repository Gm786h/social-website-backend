const express = require('express');
const auth = require('../middleware/auth');
const { frController } = require('../controller');

const router = express.Router();

router.post('/send', auth, frController.sendRequest);
router.post('/accept', auth, frController.acceptRequest);
router.post('/cancel', auth, frController.cancelRequest);
router.post('/unfriend', auth, frController.unfriend);
router.get('/received', auth, frController.getReceivedRequests);
router.get('/sent', auth, frController.getSentRequests);
router.get('/friends', auth, frController.getFriends);

module.exports = router;
