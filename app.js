require('dotenv').config();
const cors = require('cors');
const express = require('express');
const logger = require('morgan');
const app = express();
const db = require('./models');
const path = require('path');



const routes=require('./routes');
const allowedOrigins = ['https://social-website-ty79-91857poev.vercel.app'];
app.use(cors({
  origin: function(origin, callback){
    // Allow requests with no origin like mobile apps or curl
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', routes);

module.exports = app;
