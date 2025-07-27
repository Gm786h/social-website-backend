'use strict';
module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
   tableName: 'likes',
    timestamps: true,
    updatedAt: false, // Only track createdAt for likes
    indexes: [
      {
        unique: true,
        fields: ['userId', 'postId'] // Prevent duplicate likes
      }
    ]
  });

  Like.associate = (models) => {
    Like.belongsTo(models.User, { foreignKey: 'userId' });
    Like.belongsTo(models.Post, { foreignKey: 'postId' });
  };

  return Like;
};
