const express = require('express');
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', messageController.getConversationsList);
router.post('/', messageController.sendMessage);
router.get('/:userId', messageController.getConversation);

module.exports = router;
