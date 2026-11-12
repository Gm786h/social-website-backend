const { Op } = require('sequelize');
const { FriendRequest, Friend, User } = require('../models');
const { getPagination, toPositiveInt } = require('../utils/pagination');

// Friendships are stored once per pair with userId1 < userId2.
const orderedPair = (a, b) => ({ userId1: Math.min(a, b), userId2: Math.max(a, b) });

const findFriendship = (a, b) =>
  Friend.findOne({
    where: {
      [Op.or]: [
        { userId1: a, userId2: b },
        { userId1: b, userId2: a },
      ],
    },
  });

exports.sendRequest = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const receiverId = toPositiveInt(req.body.receiverId, null);

    if (!receiverId) return res.status(400).json({ message: 'receiverId is required' });
    if (senderId === receiverId) {
      return res.status(400).json({ message: "You can't send a request to yourself." });
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) return res.status(404).json({ message: 'User not found.' });

    if (await findFriendship(senderId, receiverId)) {
      return res.status(400).json({ message: 'You are already friends.' });
    }

    // If the other user already sent us a request, accept it instead.
    const mutualRequest = await FriendRequest.findOne({
      where: { senderId: receiverId, receiverId: senderId, status: 'pending' },
    });
    if (mutualRequest) {
      await mutualRequest.update({ status: 'accepted' });
      await Friend.create(orderedPair(senderId, receiverId));
      return res.json({ message: 'Mutual request found. You are now friends.' });
    }

    const alreadySent = await FriendRequest.findOne({
      where: { senderId, receiverId, status: 'pending' },
    });
    if (alreadySent) return res.status(400).json({ message: 'Friend request already sent.' });

    const request = await FriendRequest.create({ senderId, receiverId, status: 'pending' });
    return res.status(201).json({ message: 'Friend request sent.', request });
  } catch (err) {
    return next(err);
  }
};

exports.acceptRequest = async (req, res, next) => {
  try {
    const receiverId = req.user.id;
    const senderId = toPositiveInt(req.body.senderId, null);
    if (!senderId) return res.status(400).json({ error: 'senderId is required' });

    const request = await FriendRequest.findOne({
      where: { senderId, receiverId, status: 'pending' },
    });
    if (!request) return res.status(404).json({ error: 'Friend request not found.' });

    if (await findFriendship(senderId, receiverId)) {
      await request.update({ status: 'accepted' });
      return res.status(400).json({ error: 'You are already friends.' });
    }

    await request.update({ status: 'accepted' });
    await Friend.create(orderedPair(senderId, receiverId));
    return res.json({ message: 'Friend request accepted.' });
  } catch (err) {
    return next(err);
  }
};

// Cancels a pending request in either direction:
// - as the receiver (decline): body { senderId }
// - as the sender (withdraw):  body { receiverId }
exports.cancelRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const senderId = toPositiveInt(req.body.senderId, null);
    const receiverId = toPositiveInt(req.body.receiverId, null);

    let where;
    if (senderId) where = { senderId, receiverId: userId, status: 'pending' };
    else if (receiverId) where = { senderId: userId, receiverId, status: 'pending' };
    else return res.status(400).json({ error: 'senderId or receiverId is required' });

    const request = await FriendRequest.findOne({ where });
    if (!request) return res.status(404).json({ error: 'Friend request not found.' });

    await request.update({ status: 'cancel' });
    return res.json({ message: 'Friend request cancelled.' });
  } catch (err) {
    return next(err);
  }
};

exports.unfriend = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const friendId = toPositiveInt(req.body.friendId, null);
    if (!friendId) return res.status(400).json({ error: 'friendId is required' });

    const friendship = await findFriendship(userId, friendId);
    if (!friendship) return res.status(404).json({ error: 'Friendship not found.' });

    await friendship.destroy();
    return res.json({ message: 'Unfriended successfully.' });
  } catch (err) {
    return next(err);
  }
};

exports.getReceivedRequests = async (req, res, next) => {
  try {
    const requests = await FriendRequest.findAll({
      where: { receiverId: req.user.id, status: 'pending' },
      include: [{ model: User, as: 'Sender', attributes: ['id', 'username', 'profileImageUrl'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json(requests);
  } catch (err) {
    return next(err);
  }
};

exports.getSentRequests = async (req, res, next) => {
  try {
    const requests = await FriendRequest.findAll({
      where: { senderId: req.user.id, status: 'pending' },
      include: [{ model: User, as: 'Receiver', attributes: ['id', 'username', 'profileImageUrl'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json(requests);
  } catch (err) {
    return next(err);
  }
};

exports.getFriends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit, offset } = getPagination(req.query, 10);

    const friendships = await Friend.findAll({
      where: { [Op.or]: [{ userId1: userId }, { userId2: userId }] },
      offset,
      limit,
    });
    const friendIds = friendships.map((f) => (Number(f.userId1) === userId ? f.userId2 : f.userId1));
    if (!friendIds.length) return res.json([]);

    const friends = await User.findAll({
      where: { id: friendIds },
      attributes: ['id', 'username', 'profileImageUrl'],
    });
    return res.json(friends);
  } catch (err) {
    return next(err);
  }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const name = (req.query.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Missing name query' });

    const users = await User.findAll({
      where: {
        username: { [Op.like]: `%${name}%` },
        id: { [Op.ne]: userId },
      },
      attributes: ['id', 'username', 'profileImageUrl'],
      limit: 50,
    });
    if (!users.length) return res.json([]);

    const userIds = users.map((u) => u.id);
    const [friends, sentRequests, receivedRequests] = await Promise.all([
      Friend.findAll({
        where: {
          [Op.or]: [
            { userId1: userId, userId2: { [Op.in]: userIds } },
            { userId2: userId, userId1: { [Op.in]: userIds } },
          ],
        },
      }),
      FriendRequest.findAll({
        where: { senderId: userId, receiverId: { [Op.in]: userIds }, status: 'pending' },
      }),
      FriendRequest.findAll({
        where: { receiverId: userId, senderId: { [Op.in]: userIds }, status: 'pending' },
      }),
    ]);

    const friendSet = new Set(friends.map((f) => (Number(f.userId1) === userId ? f.userId2 : f.userId1)));
    const sentSet = new Set(sentRequests.map((r) => r.receiverId));
    const receivedSet = new Set(receivedRequests.map((r) => r.senderId));

    return res.json(
      users.map((user) => {
        let status = 'none';
        if (friendSet.has(user.id)) status = 'friends';
        else if (sentSet.has(user.id)) status = 'request_sent';
        else if (receivedSet.has(user.id)) status = 'request_received';
        return { id: user.id, username: user.username, profileImageUrl: user.profileImageUrl, status };
      })
    );
  } catch (err) {
    return next(err);
  }
};
