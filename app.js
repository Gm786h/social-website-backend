require('dotenv').config();
const cors = require('cors');
const express = require('express');
const logger = require('morgan');
const app = express();
const db = require('./models');
const path = require('path');



const routes=require('./routes');
const allowedOrigins = ['http://localhost:3000', 'https://social-website-ty79.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', routes);

module.exports = app;
