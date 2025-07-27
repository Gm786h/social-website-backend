require('dotenv').config();
const cors = require('cors');
const express = require('express');
const logger = require('morgan');
const app = express();
const db = require('./models');
const path = require('path');



const routes=require('./routes')
const cors = require('cors');

app.use(cors({
  origin: 'https://your-frontend-domain.vercel.app', // replace with your actual frontend URL
  credentials: true,
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', routes);

module.exports = app;
