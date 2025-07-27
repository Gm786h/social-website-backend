'use strict';
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {  // ← THIS WAS MISSING!
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'posts',
    timestamps: true,
    underscored: false
  });

  Post.associate = (models) => {
    Post.belongsTo(models.User, { foreignKey: 'userId' });
    Post.hasMany(models.Comment, { foreignKey: 'postId' });
    Post.hasMany(models.Like, { foreignKey: 'postId' });
  };
  
  return Post;
};
