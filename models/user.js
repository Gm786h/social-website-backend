'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profileImageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profileImagePublicId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    // Add this options object to specify the correct table name
    tableName: 'users', // This tells Sequelize to use the 'users' table (lowercase)
    timestamps: true,   // Assumes you have createdAt/updatedAt columns
    underscored: false  // Keeps camelCase column names
  });

  User.associate = (models) => {
    User.hasMany(models.FriendRequest, {
      as: 'SentRequests',
      foreignKey: 'senderId'
    });
    User.hasMany(models.FriendRequest, {
      as: 'ReceivedRequests',
      foreignKey: 'receiverId'  
    });
    User.hasMany(models.Post, { foreignKey: 'userId' });
    User.hasMany(models.Comment, { foreignKey: 'userId' });
    User.hasMany(models.Like, { foreignKey: 'userId' });
  
    User.hasMany(models.Message, {
      as: 'SentMessages',
      foreignKey: 'senderId'
    });
    User.hasMany(models.Message, {
      as: 'ReceivedMessages',
      foreignKey: 'receiverId'
    });
  };
  
  return User;
};
