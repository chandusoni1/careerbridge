const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const directoryService = require('./directory.service');
const asyncHandler = require('../../utils/asyncHandler');

// Helper to extract user ID from req.user, body, or Bearer token header
const extractUserId = (req, bodyKey = 'userId') => {
  if (req.user && req.user.id) return req.user.id;
  if (req.body && req.body[bodyKey]) return req.body[bodyKey];

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], env.JWT_SECRET);
      if (decoded && decoded.id) return decoded.id;
    } catch {
      // Fallback
    }
  }
  return null;
};

const getAlumni = asyncHandler(async (req, res) => {
  const alumni = await directoryService.getAlumniDirectory(req.query);
  res.status(200).json(alumni);
});

const getStudents = asyncHandler(async (req, res) => {
  const students = await directoryService.getStudentDirectory(req.query);
  res.status(200).json(students);
});

const sendConnectRequest = asyncHandler(async (req, res) => {
  const senderId = extractUserId(req, 'senderId');
  const receiverId = req.body.receiverId || req.body.targetUserId;
  const result = await directoryService.sendConnectionRequest(
    senderId,
    receiverId
  );
  res.status(200).json(result);
});

const acceptConnectRequest = asyncHandler(async (req, res) => {
  const userId = extractUserId(req, 'userId');
  const targetUserId = req.body.targetUserId || req.body.senderId;
  const result = await directoryService.acceptConnectionRequest(
    userId,
    targetUserId
  );
  res.status(200).json(result);
});

const rejectConnectRequest = asyncHandler(async (req, res) => {
  const userId = extractUserId(req, 'userId');
  const targetUserId = req.body.targetUserId || req.body.senderId;
  const result = await directoryService.rejectConnectionRequest(
    userId,
    targetUserId
  );
  res.status(200).json(result);
});

const cancelConnectRequest = asyncHandler(async (req, res) => {
  const senderId = extractUserId(req, 'senderId');
  const targetUserId = req.body.targetUserId || req.body.receiverId;
  const result = await directoryService.cancelConnectionRequest(
    senderId,
    targetUserId
  );
  res.status(200).json(result);
});

const removeConnection = asyncHandler(async (req, res) => {
  const userId = extractUserId(req, 'userId');
  const targetUserId = req.body.targetUserId;
  const result = await directoryService.removeConnection(userId, targetUserId);
  res.status(200).json(result);
});

const getConnectionSummary = asyncHandler(async (req, res) => {
  const userId = extractUserId(req);
  const summary = await directoryService.getConnectionSummary(userId);
  res.status(200).json(summary);
});

module.exports = {
  getAlumni,
  getStudents,
  sendConnectRequest,
  acceptConnectRequest,
  rejectConnectRequest,
  cancelConnectRequest,
  removeConnection,
  getConnectionSummary,
};
