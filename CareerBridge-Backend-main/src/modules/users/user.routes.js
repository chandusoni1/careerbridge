const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const authenticate = require('../../middleware/authenticate');
const { validateUpdateProfile } = require('./user.validation');
const validateRequest = require('../../middleware/validateRequest');

router.get('/', userController.getAllUsers);
router.get('/dashboard/summary', authenticate, userController.getDashboardSummary);
router.get('/profile/me', authenticate, userController.getMyProfile);
router.put(
  '/profile/me',
  authenticate,
  validateRequest(validateUpdateProfile),
  userController.updateProfile
);
router.get('/stats/admin', userController.getAdminStats);
router.get('/:id', userController.getUserById);
router.put(
  '/:id',
  authenticate,
  validateRequest(validateUpdateProfile),
  userController.updateProfile
);

module.exports = router;
