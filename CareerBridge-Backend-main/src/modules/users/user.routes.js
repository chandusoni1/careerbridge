const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const authenticate = require('../../middleware/authenticate');
const { validateUpdateProfile } = require('./user.validation');
const validateRequest = require('../../middleware/validateRequest');

const authorize = require('../../middleware/authorize');

router.get('/', userController.getAllUsers);
router.get('/dashboard/summary', authenticate, userController.getDashboardSummary);
router.get('/profile/me', authenticate, userController.getMyProfile);
router.put(
  '/profile/me',
  authenticate,
  validateRequest(validateUpdateProfile),
  userController.updateProfile
);
router.post(
  '/profile/me/resubmit-id',
  authenticate,
  userController.resubmitCollegeId
);

// Admin Verification Operations
router.get('/stats/admin', userController.getAdminStats);
router.get(
  '/admin/verifications',
  authenticate,
  authorize('admin'),
  userController.getAdminVerifications
);
router.get(
  '/admin/verifications/:userId/id-card',
  authenticate,
  authorize('admin'),
  userController.getAdminUserCollegeId
);
router.patch(
  '/admin/verifications/:userId',
  authenticate,
  authorize('admin'),
  userController.decideVerification
);

router.get('/:id', userController.getUserById);
router.put(
  '/:id',
  authenticate,
  validateRequest(validateUpdateProfile),
  userController.updateProfile
);

module.exports = router;
