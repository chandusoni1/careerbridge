const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signupUser(req.body);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.status(200).json(result);
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  res.status(200).json({ success: true, user });
});

module.exports = {
  signup,
  login,
  getMe,
};
