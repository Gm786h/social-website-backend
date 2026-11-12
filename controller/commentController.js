const { Post, Comment } = require('../models');

exports.addComment = async (req, res, next) => {
  try {
    const content = (req.body.content || '').trim();
    const { postId } = req.params;

    if (!content) return res.status(400).json({ message: 'Comment content is required' });

    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({ content, userId: req.user.id, postId });
    return res.status(201).json({ message: 'Comment added', comment });
  } catch (err) {
    return next(err);
  }
};
