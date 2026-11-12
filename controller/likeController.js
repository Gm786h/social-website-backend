const { Like, Post } = require('../models');

exports.likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const existingLike = await Like.findOne({ where: { postId, userId } });
    if (existingLike) await existingLike.destroy();
    else await Like.create({ postId, userId });

    const likeCount = await Like.count({ where: { postId } });
    return res.json({ liked: !existingLike, likeCount });
  } catch (err) {
    return next(err);
  }
};

exports.checkIfLiked = async (req, res, next) => {
  try {
    const existing = await Like.findOne({ where: { postId: req.params.postId, userId: req.user.id } });
    return res.json({ liked: !!existing });
  } catch (err) {
    return next(err);
  }
};
