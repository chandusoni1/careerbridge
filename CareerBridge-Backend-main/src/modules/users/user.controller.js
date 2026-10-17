const userService = require('./user.service');
const asyncHandler = require('../../utils/asyncHandler');

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers(req.query);
  res.status(200).json(users);
});

const getMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.id, req.user.id);
  res.status(200).json(user);
});

const getUserById = asyncHandler(async (req, res) => {
  const viewerId = req.user ? req.user.id : null;
  const user = await userService.getUserById(req.params.id, viewerId);
  res.status(200).json(user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updatedUser = await userService.updateUserProfile(userId, req.body);
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser,
  });
});

const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await userService.getUserDashboardSummary(req.user.id);
  res.status(200).json(summary);
});

const getAdminStats = asyncHandler(async (req, res) => {
  const stats = await userService.getAdminStats();
  res.status(200).json(stats);
});

module.exports = {
  getAllUsers,
  getMyProfile,
  getUserById,
  updateProfile,
  getDashboardSummary,
  getAdminStats,
};
