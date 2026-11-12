const { Op } = require('sequelize');
const { Message, User } = require('../models');
const { getPagination, toPositiveInt } = require('../utils/pagination');

exports.getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const otherUserId = toPositiveInt(req.params.otherUserId, null);
    if (!otherUserId) return res.status(400).json({ error: 'Invalid user id' });

    const { limit, offset } = getPagination(req.query, 100);

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });

    // Return oldest first so the client can render the conversation in order.
    return res.json(messages.reverse());
  } catch (err) {
    return next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const receiverId = toPositiveInt(req.body.receiverId, null);
    const message = (req.body.message || '').trim();

    if (!receiverId || !message) {
      return res.status(400).json({ error: 'receiverId and message are required' });
    }
    if (receiverId === senderId) {
      return res.status(400).json({ error: "You can't message yourself" });
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) return res.status(404).json({ error: 'Receiver not found' });

    const newMessage = await Message.create({ senderId, receiverId, message });
    return res.status(201).json(newMessage);
  } catch (err) {
    return next(err);
  }
};
