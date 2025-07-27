const {Post ,Comment}=require('../models')

exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comment = await Comment.create({
      content,
      userId,
      postId
    });
    res.status(201).json({ message: 'Comment added', comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
