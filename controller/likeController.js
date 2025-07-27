// controllers/likeController.js
const { Like, Post } = require('../models');

exports.likePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = await Like.findOne({
      where: { postId, userId }
    });

    if (existingLike) {
      await existingLike.destroy();
    } else {
      await Like.create({ postId, userId });
    }

    // ✅ Always return updated like count
    const likeCount = await Like.count({ where: { postId } });
    const liked = !existingLike;

    return res.status(200).json({ liked, likeCount });

  } catch (error) {
    console.error('Like toggle error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
exports.checkIfLiked = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const existing = await Like.findOne({ where: { postId, userId } });
    res.json({ liked: !!existing });
  } catch (err) {
    console.error("Like check failed", err);
    res.status(500).json({ error: "Failed to check like status" });
  }
};

