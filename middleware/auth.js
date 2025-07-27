const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.JWT_SECRET;
console.log('secret key ' ,SECRET)

module.exports = async function (req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  // Extract token from 'Bearer <token>'
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token malformed' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
