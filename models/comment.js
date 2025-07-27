

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    content: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.User, { foreignKey: 'userId' });

    Comment.belongsTo(models.Post, { foreignKey: 'postId' });
  };

  return Comment;
};
