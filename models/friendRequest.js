'use strict';
module.exports = (sequelize, DataTypes) => {
  const FriendRequest = sequelize.define('friendRequest', {
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'cancel'),
      defaultValue: 'pending'
    }
  }, { timestamps: true });

  FriendRequest.associate = (models) => {
    FriendRequest.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'Sender'
    });

    FriendRequest.belongsTo(models.User, {
      foreignKey: 'receiverId',
      as: 'Receiver'
    });
  };

  return FriendRequest;
};
