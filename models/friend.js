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
  }, { timestamps: true });

  return Friend;
};
