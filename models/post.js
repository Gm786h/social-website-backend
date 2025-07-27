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
    }
  }, {
    // Add this options object to specify the correct table name
    tableName: 'posts', // This tells Sequelize to use the 'posts' table (lowercase)
    timestamps: true,   // Assumes you have createdAt/updatedAt columns
    underscored: false  // Keeps camelCase column names
  });

  Post.associate = (models) => {
    Post.belongsTo(models.User, { foreignKey: 'userId' });
    Post.hasMany(models.Comment, { foreignKey: 'postId' });
    Post.hasMany(models.Like, { foreignKey: 'postId' });
  };
  
  return Post;
};
