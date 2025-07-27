const {FriendRequest,Friend,User}=require('../models')
const { Op } = require('sequelize');


exports.sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return res.status(400).json({ message: "You can't send a request to yourself." });
    }
    const existingFriend = await Friend.findOne({
      where: {
        [Op.or]: [
          { userId1: senderId, userId2: receiverId },
          { userId1: receiverId, userId2: senderId }
        ]
      }
    });

    if (existingFriend) {
      return res.status(400).json({ message: "You are already friends." });

    }

    const mutualRequest = await FriendRequest.findOne({
      where: {
        senderId: receiverId,
        receiverId: senderId,
        status: 'pending'
      }
    });

    if (mutualRequest) {
      await mutualRequest.update({ status: 'accepted' });

      await Friend.create({
        userId1: Math.min(senderId, receiverId),
        userId2: Math.max(senderId, receiverId)
      });

      return res.json({ message: 'Mutual request found. You are now friends.' });
    }

    const alreadySent = await FriendRequest.findOne({
      where: { senderId, receiverId, status: 'pending' }
    });

    if (alreadySent) {
      return res.status(400).json({ message: 'Friend request already sent.' });
    }

    const request = await FriendRequest.create({
      senderId,
      receiverId,
      status: 'pending'
    });

    return res.status(200).json({ message: 'Friend request sent.', request });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.user.id;

    if (!senderId || !receiverId) {
      return res.status(400).json({ error: 'senderId or receiverId is missing' });
    }

    // Check pending request
    const request = await FriendRequest.findOne({
      where: {
        senderId,
        receiverId,
        status: 'pending'
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found.' });
    }

    await request.update({ status: 'accepted' });
    const uid1 = Math.min(senderId, receiverId);
    const uid2 = Math.max(senderId, receiverId);
    const alreadyFriends = await Friend.findOne({
      where: {
        [Op.or]: [
          { userId1: uid1, userId2: uid2 },
          { userId1: uid2, userId2: uid1 }
        ]
      }
    });

    if (alreadyFriends) {
      return res.status(400).json({ error: 'You are already friends.' });
    }
    await Friend.create({
      userId1: uid1,
      userId2: uid2
    });

    return res.json({ message: 'Friend request accepted.' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};
exports.cancelRequest = async (req, res) => {
  try {
    const receiverId =req.user.id;
    const { senderId } = req.body;

    const request = await FriendRequest.findOne({
      where: {
        senderId,
        receiverId: receiverId,
        status: 'pending'
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found.' });
    }

    await request.update({ status: 'cancel' });

    res.json(
      { message: 'Friend request cancelled.' }
    );
  } catch (error) {
    res.json({ error: error.message });
  }
};


exports.unfriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;

    const friendship = await Friend.findOne({
      where: {
        [Op.or]: [
          { userId1: userId, userId2: friendId },
          { userId1: friendId, userId2: userId }
        ]
      }
    });

    if (!friendship) {
      return res.json({ error: 'Friendship not found.' });
    }

    await friendship.destroy();
    res.json({ message: 'Unfriended successfully.' });
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.getReceivedRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await FriendRequest.findAll({
      where: { receiverId: userId, status: 'pending' },
     include: [{ model: User, as: 'Sender', attributes: ["id", "username", "profileImageUrl"]  }]

    });

    res.json(requests);
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await FriendRequest.findAll({
      where: { senderId: userId, status: 'pending' },
      include: [{ model: User, as: 'Receiver', attributes: ['id', 'username'] }]
    });

    res.json(requests);
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const page=parseInt(req.query.page|| 1);
    const limit=parseInt(req.query.limit) || 10;
    const offset=(page-1)*limit;
    const userId = req.user.id;
    const friends = await Friend.findAll({
      where: {
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ]
      },
      offset,
      limit
    });
   
    

    const friendIds = friends.map(f => f.userId1 === userId ? f.userId2 : f.userId1);

    const friendName = await User.findAll({
      where: { id: friendIds },
      attributes: ['id', 'username','profileImageUrl']
    });

    res.json(friendName);
  } catch (error) {
    res.json({ error: error.message });
  }
};
exports.searchUsers = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const name = req.query.name;

    if (!name) {
      return res.status(400).json({ error: "Missing name query" });
    }

    // Find users matching the search, excluding yourself
    const users = await User.findAll({
      where: {
        username: { [Op.like]: `%${name}%` },
        id: { [Op.ne]: userId }
      },
      attributes: ["id", "username",'profileImageUrl'] // add profile if needed and exists
    });

    const userIds = users.map(u => u.id);

    if (userIds.length === 0) return res.json([]);

    // Find existing friendships between current user and search results
    const friends = await Friend.findAll({
      where: {
        [Op.or]: [
          { userId1: userId, userId2: { [Op.in]: userIds } },
          { userId2: userId, userId1: { [Op.in]: userIds } }
        ]
      }
    });

    // Find pending friend requests sent by current user to these users
    const sentRequests = await FriendRequest.findAll({
      where: {
        senderId: userId,
        receiverId: { [Op.in]: userIds },
        status: "pending"
      }
    });

    // Create sets to quickly check status
    const friendSet = new Set(
      friends.map(f => (f.userId1 === userId ? f.userId2 : f.userId1))
    );
    const sentRequestSet = new Set(sentRequests.map(r => r.receiverId));

    // Build response with status for each user
   const usersWithStatus = users.map(user => {
  let status = "none";
  if (friendSet.has(user.id)) status = "friends";
  else if (sentRequestSet.has(user.id)) status = "request_sent";

  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
    status
  };
});

    res.json(usersWithStatus);

  } catch (error) {
    console.error("BACKEND SEARCH ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
