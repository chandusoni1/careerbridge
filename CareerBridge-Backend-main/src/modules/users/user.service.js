const User = require('./user.model');
const Job = require('../jobs/job.model');
const ApiError = require('../../utils/ApiError');

const getAllUsers = async (query = {}) => {
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.company) filter.company = new RegExp(query.company, 'i');
  if (query.college) filter.college = query.college;
  if (query.branch) filter.branch = query.branch;
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { headline: searchRegex },
      { company: searchRegex },
      { skills: { $in: [searchRegex] } },
    ];
  }

  return User.find(filter, { password: 0 })
    .populate('connections', 'name email role company jobRole profilePhoto')
    .sort({ createdAt: -1 });
};

const getUserById = async (id, viewerId = null) => {
  const user = await User.findById(id, { password: 0 })
    .populate('connections', 'name email role company jobRole headline profilePhoto')
    .populate('connectionRequests', 'name email role company jobRole profilePhoto')
    .populate('sentConnectionRequests', 'name email role company jobRole profilePhoto');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const userObj = user.toObject();

  // Privacy filters when viewed by another user
  if (viewerId && viewerId.toString() !== id.toString()) {
    if (!userObj.isPhonePublic) delete userObj.phone;
    if (!userObj.isEmailPublic) delete userObj.email;
  }

  return userObj;
};

const updateUserProfile = async (id, updateData) => {
  // Prevent direct mutation of sensitive credential fields
  delete updateData.password;
  delete updateData.role;
  delete updateData._id;

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    throw ApiError.notFound('User not found');
  }

  return updatedUser;
};

const calculateProfileCompletion = (user) => {
  let score = 0;
  const checks = [
    Boolean(user.name),
    Boolean(user.profilePhoto),
    Boolean(user.headline),
    Boolean(user.bio || user.about),
    Boolean(user.location),
    Boolean(user.skills && user.skills.length > 0),
    Boolean(user.education && user.education.length > 0),
    Boolean(user.experience && user.experience.length > 0),
    Boolean(user.projects && user.projects.length > 0),
    Boolean(user.linkedin || user.github),
  ];

  const passed = checks.filter(Boolean).length;
  score = Math.round((passed / checks.length) * 100);
  return Math.min(100, Math.max(10, score));
};

const getUserDashboardSummary = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const [appliedCount, postedCount, pendingRequestsCount] = await Promise.all([
    Job.countDocuments({ 'applicants.student': userId }),
    Job.countDocuments({ postedBy: userId }),
    User.countDocuments({ _id: userId, connectionRequests: { $exists: true, $not: { $size: 0 } } }),
  ]);

  const completion = calculateProfileCompletion(user);

  return {
    userId,
    role: user.role,
    name: user.name,
    headline: user.headline,
    profilePhoto: user.profilePhoto,
    connectionsCount: user.connections ? user.connections.length : 0,
    receivedRequestsCount: user.connectionRequests ? user.connectionRequests.length : 0,
    sentRequestsCount: user.sentConnectionRequests ? user.sentConnectionRequests.length : 0,
    applicationsCount: appliedCount,
    jobsPostedCount: postedCount,
    profileCompletion: completion,
    isMentorshipAvailable: Boolean(user.isAvailableForMentorship),
  };
};

const getAdminStats = async () => {
  const students = await User.countDocuments({ role: 'student' });
  const alumni = await User.countDocuments({ role: 'alumni' });
  const jobs = await Job.countDocuments();

  return {
    students,
    alumni,
    jobs,
  };
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserProfile,
  getUserDashboardSummary,
  calculateProfileCompletion,
  getAdminStats,
};
