'use strict';

const { sequelize, Sequelize } = require('../config/db');

const User = require('./user')(sequelize, Sequelize.DataTypes);
const Post = require('./post')(sequelize, Sequelize.DataTypes);
const Comment = require('./comment')(sequelize, Sequelize.DataTypes);
const Like = require('./like')(sequelize, Sequelize.DataTypes);
const Friend = require('./friend')(sequelize, Sequelize.DataTypes);
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
