'use strict';
module.exports = (sequelize, DataTypes) => {
  const Friend = sequelize.define('Friend', {
    userId1: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId2: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, { 
    tableName: 'friends', // Add explicit lowercase table name
    timestamps: true 
  });
  
  Friend.associate = (models) => {
    Friend.belongsTo(models.User, { as: 'User1', foreignKey: 'userId1' });
    Friend.belongsTo(models.User, { as: 'User2', foreignKey: 'userId2' });
  };
  
  return Friend;
};
