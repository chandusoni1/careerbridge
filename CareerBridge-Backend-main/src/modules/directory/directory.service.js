const User = require('../users/user.model');
const { Notification } = require('../notifications/notification.model');
const ApiError = require('../../utils/ApiError');

const getAlumniDirectory = async (filters = {}) => {
  const query = { role: 'alumni' };

  if (filters.company) {
    query.company = new RegExp(filters.company, 'i');
  }
  if (filters.jobRole) {
    query.jobRole = new RegExp(filters.jobRole, 'i');
  }
  if (filters.graduationYear) {
    query.graduationYear = Number(filters.graduationYear);
  }
  if (filters.mentorshipOnly === 'true' || filters.mentorshipOnly === true) {
    query.isAvailableForMentorship = true;
  }
  if (filters.skill) {
    query.skills = { $in: [new RegExp(filters.skill, 'i')] };
  }

  return User.find(query, { password: 0 }).sort({ createdAt: -1 });
};

const getStudentDirectory = async (filters = {}) => {
  const query = { role: 'student' };

  if (filters.branch) {
    query.branch = filters.branch;
  }
  if (filters.college) {
    query.college = new RegExp(filters.college, 'i');
  }
  if (filters.semester) {
    query.semester = Number(filters.semester);
  }
  if (filters.skill) {
    query.skills = { $in: [new RegExp(filters.skill, 'i')] };
  }

  return User.find(query, { password: 0 }).sort({ createdAt: -1 });
};

const sendConnectionRequest = async (senderId, receiverId) => {
  if (!senderId || !receiverId) {
    throw ApiError.badRequest('Both senderId and receiverId are required');
  }

  if (senderId.toString() === receiverId.toString()) {
    throw ApiError.badRequest('Cannot send connection request to yourself');
  }

  const [sender, receiver] = await Promise.all([
    User.findById(senderId),
    User.findById(receiverId),
  ]);

  if (!receiver) {
    throw ApiError.notFound('Target user not found');
  }

  // Check if already connected
  if (receiver.connections.some((id) => id.toString() === senderId.toString())) {
    return { message: 'Already connected with this user.' };
  }

  // Update recipient's received requests
  await User.findByIdAndUpdate(receiverId, {
    $addToSet: { connectionRequests: senderId },
  });

  // Update sender's sent requests
  await User.findByIdAndUpdate(senderId, {
    $addToSet: { sentConnectionRequests: receiverId },
  });

  await Notification.create({
    recipient: receiverId,
    sender: senderId,
    type: 'connection',
    message: `${sender?.name || 'A user'} sent you a connection request.`,
  }).catch(() => {});

  return { message: 'Connection request sent successfully.' };
};

const acceptConnectionRequest = async (userId, targetUserId) => {
  await Promise.all([
    User.findByIdAndUpdate(userId, {
      $pull: { connectionRequests: targetUserId },
      $addToSet: { connections: targetUserId },
    }),
    User.findByIdAndUpdate(targetUserId, {
      $pull: { sentConnectionRequests: userId },
      $addToSet: { connections: userId },
    }),
  ]);

  const acceptingUser = await User.findById(userId).select('name');

  await Notification.create({
    recipient: targetUserId,
    sender: userId,
    type: 'connection',
    message: `${acceptingUser?.name || 'A user'} accepted your connection request.`,
  }).catch(() => {});

  return { message: 'Connection request accepted.' };
};

const rejectConnectionRequest = async (userId, targetUserId) => {
  await Promise.all([
    User.findByIdAndUpdate(userId, {
      $pull: { connectionRequests: targetUserId },
    }),
    User.findByIdAndUpdate(targetUserId, {
      $pull: { sentConnectionRequests: userId },
    }),
  ]);

  return { message: 'Connection request rejected.' };
};

const cancelConnectionRequest = async (senderId, targetUserId) => {
  await Promise.all([
    User.findByIdAndUpdate(senderId, {
      $pull: { sentConnectionRequests: targetUserId },
    }),
    User.findByIdAndUpdate(targetUserId, {
      $pull: { connectionRequests: senderId },
    }),
  ]);

  return { message: 'Connection request cancelled.' };
};

const removeConnection = async (userId, targetUserId) => {
  await Promise.all([
    User.findByIdAndUpdate(userId, {
      $pull: { connections: targetUserId },
    }),
    User.findByIdAndUpdate(targetUserId, {
      $pull: { connections: userId },
    }),
  ]);

  return { message: 'Connection removed successfully.' };
};

const getConnectionSummary = async (userId) => {
  const user = await User.findById(userId, { password: 0 })
    .populate('connections', 'name role headline company jobRole branch college profilePhoto')
    .populate('connectionRequests', 'name role headline company jobRole branch college profilePhoto')
    .populate('sentConnectionRequests', 'name role headline company jobRole branch college profilePhoto');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Find suggested connections (users not in connections, connectionRequests, or sentConnectionRequests, and not self)
  const excludeIds = [
    userId,
    ...(user.connections || []).map((u) => u._id),
    ...(user.connectionRequests || []).map((u) => u._id),
    ...(user.sentConnectionRequests || []).map((u) => u._id),
  ];

  const suggestions = await User.find(
    { _id: { $nin: excludeIds } },
    { password: 0 }
  )
    .limit(10)
    .sort({ createdAt: -1 });

  return {
    connections: user.connections || [],
    receivedRequests: user.connectionRequests || [],
    sentRequests: user.sentConnectionRequests || [],
    suggestions,
  };
};

const getConnectionStatus = async (userId, targetUserId) => {
  if (!userId || !targetUserId) return { status: 'none' };
  if (userId.toString() === targetUserId.toString()) return { status: 'self' };

  const user = await User.findById(userId).select(
    'connections connectionRequests sentConnectionRequests'
  );
  if (!user) return { status: 'none' };

  const targetStr = targetUserId.toString();
  if (user.connections?.some((id) => id.toString() === targetStr)) {
    return { status: 'connected' };
  }
  if (user.sentConnectionRequests?.some((id) => id.toString() === targetStr)) {
    return { status: 'pending' };
  }
  if (user.connectionRequests?.some((id) => id.toString() === targetStr)) {
    return { status: 'received' };
  }
  return { status: 'none' };
};

module.exports = {
  getAlumniDirectory,
  getStudentDirectory,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelConnectionRequest,
  removeConnection,
  getConnectionSummary,
  getConnectionStatus,
};
