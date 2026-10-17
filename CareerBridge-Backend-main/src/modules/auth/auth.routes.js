const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const userController = require('../users/user.controller');
const { validateSignup, validateLogin } = require('./auth.validation');
const validateRequest = require('../../middleware/validateRequest');
const authenticate = require('../../middleware/authenticate');

router.post('/signup', validateRequest(validateSignup), authController.signup);
router.post('/login', validateRequest(validateLogin), authController.login);
router.get('/me', authenticate, authController.getMe);

// Maintained for backward compatibility with frontend: apiClient.get('/auth/users')
router.get('/users', userController.getAllUsers);

module.exports = router;
