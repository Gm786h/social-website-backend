const { User,Post,Comment,Like } = require('../models');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email']
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getOneProfile = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.limit) || 10;

    const totalPosts = await Post.count({
      where: { userId: req.user.id }
    });

     const pageCount = Math.ceil(totalPosts / perPage);
     const limit =perPage;
     const offset=(page-1)*perPage;
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username'],
      include: [
        {
          model: Post,
          separate: true,
          limit,
          offset,
          order: [
            ['createdAt', 'ASC']
          ],
          include: [
            {
              model: Comment,
              include: [
                { model: User, 
                  attributes: ['username'] 

                }]
            },
            {
              model: Like,
              include: [
                { model: User, attributes: ['username'] 

                }]
            }
          ]
        }
      ]
    });

   const plainUser = user.toJSON();
plainUser.page = page;
plainUser.totalpages = pageCount;
// const postPerPage = Math.min(page * limit, totalPosts);
  res.json(plainUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
