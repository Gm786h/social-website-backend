const { Post, User, Comment, Like } = require('../models');
const { getPagination } = require('../utils/pagination');

const postIncludes = [
  { model: User, attributes: ['id', 'username', 'profileImageUrl'] },
  { model: Comment, include: [{ model: User, attributes: ['id', 'username'] }] },
  { model: Like, include: [{ model: User, attributes: ['id', 'username'] }] },
];

exports.createPost = async (req, res, next) => {
  try {
    const content = (req.body.content || '').trim();
    if (!content) return res.status(400).json({ error: 'Post content is required' });

    const image = req.file ? req.file.path : null;
    const post = await Post.create({ content, userId: req.user.id, image });
    return res.status(201).json(post);
  } catch (err) {
    return next(err);
  }
};

exports.getAllPosts = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query, 3);

    const totalPosts = await Post.count();
    const posts = await Post.findAll({
      include: postIncludes,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      perPage: limit,
      Posts: posts,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.postId }, include: postIncludes });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.json(post);
  } catch (err) {
    return next(err);
  }
};
