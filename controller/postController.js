const { Post, User, Comment, Like } = require('../models');

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const image = req.file ? req.file.path : null;

    const post = await Post.create({ content, userId: req.user.id ,image});
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const page=parseInt(req.query.page)|| 1;
    const limit=parseInt(req.query.limit)||3;
    const offset=(page-1)*limit;

   const totalPosts = await Post.count();
 const totalPages = Math.ceil(totalPosts / limit);
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['username', 'profileImageUrl']
        },
        {
          model: Comment,
          include: [{ model: User, attributes: ['username'] }]
        },
        {
          model: Like,
          include: [{ model: User, attributes: ['username'] }]
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ 
     currentPage: page,
      totalPages,
      totalPosts,
      perPage: limit,Posts: posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({
  where: { id: req.params.postId },
  include: [
    {
      model: User,
      attributes: ['username','profileImageUrl'] 
    },
    {
      model: Comment,
      include: [{
        model: User,
        attributes: ['username'] 
      }]
    },
    {
      model: Like,
      include: [{
        model: User,
        attributes: ['username'] 
      }]
    }
  ]
});
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

