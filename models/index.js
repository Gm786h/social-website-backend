'use strict';

const { sequelize, Sequelize } = require('../config/db');

const User = require('./User')(sequelize, Sequelize.DataTypes);
const Post = require('./Post')(sequelize, Sequelize.DataTypes);
const Comment = require('./Comment')(sequelize, Sequelize.DataTypes);
const Like = require('./Like')(sequelize, Sequelize.DataTypes);
const Friend = require('./Friend')(sequelize, Sequelize.DataTypes);
const FriendRequest=require('./friendRequest')(sequelize, Sequelize.DataTypes);
const Message=require('./mesage')(sequelize, Sequelize.DataTypes);


const db = {
  User,
  Post,
  Comment,
  Like,
  Friend,
  FriendRequest,
  Message,
  sequelize,
  Sequelize
};

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});


module.exports = db;
