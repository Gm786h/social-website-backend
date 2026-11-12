const { User, Post, Comment, Like } = require('../models');
const { getPagination, toPositiveInt } = require('../utils/pagination');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'profileImageUrl'],
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    return next(err);
  }
};

// Returns a user's profile with their paginated posts.
// Defaults to the logged-in user; pass ?userId=<id> to view someone else.
exports.getOneProfile = async (req, res, next) => {
  try {
    const userId = toPositiveInt(req.query.userId, req.user.id);
    const { page, limit, offset } = getPagination(req.query, 10);

    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'profileImageUrl'],
      include: [
        {
          model: Post,
          separate: true,
          limit,
          offset,
          order: [['createdAt', 'ASC']],
          include: [
            { model: Comment, include: [{ model: User, attributes: ['id', 'username'] }] },
            { model: Like, include: [{ model: User, attributes: ['id', 'username'] }] },
          ],
        },
      ],
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const totalPosts = await Post.count({ where: { userId } });
    const plainUser = user.toJSON();
    plainUser.page = page;
    plainUser.totalpages = Math.ceil(totalPosts / limit);
    plainUser.totalPosts = totalPosts;
    return res.json(plainUser);
  } catch (err) {
    return next(err);
  }
};
