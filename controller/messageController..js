const { Message } = require('../models');
const { Op } = require('sequelize');

exports.getChatHistory = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = parseInt(req.params.otherUserId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
     

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      },
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

 res.status(200).json( messages.reverse());
  } catch (error) {
    console.error('Pagination Error:', error);
    res.status(500).json({ error: 'Failed to load messages with pagination.' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, message } = req.body;

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
