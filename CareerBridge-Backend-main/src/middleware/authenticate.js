const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token missing or invalid'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;

    // Asynchronously update lastSeen presence without blocking request flow
    const uid = decoded.id || decoded._id || decoded.userId;
    if (uid) {
      const User = require('../modules/users/user.model');
      User.findByIdAndUpdate(uid, { lastSeen: new Date() }).catch(() => {});
    }

    next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};

module.exports = authenticate;
