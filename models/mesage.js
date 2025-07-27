module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    updatedAt: false,
    tableName: 'messages' // Changed from 'Messages' to 'messages' (lowercase)
  });
  
  Message.associate = (models) => {
    Message.belongsTo(models.User, { as: 'Sender', foreignKey: 'senderId' });
    Message.belongsTo(models.User, { as: 'Receiver', foreignKey: 'receiverId' });
  };
  
  return Message;
};
