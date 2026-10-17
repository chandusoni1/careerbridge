const Job = require('./job.model');
const User = require('../users/user.model');
const { Notification } = require('../notifications/notification.model');
const ApiError = require('../../utils/ApiError');

const createJob = async (jobData) => {
  const newJob = await Job.create(jobData);
  return Job.findById(newJob._id).populate(
    'postedBy',
    'name company jobRole email profilePhoto'
  );
};

const getAllJobs = async (filter = {}) => {
  const query = {};
  if (filter.type) query.type = filter.type;
  if (filter.workplaceType) query.workplaceType = filter.workplaceType;
  if (filter.employmentType) query.employmentType = filter.employmentType;
  if (filter.status) query.status = filter.status;
  if (filter.location) query.location = new RegExp(filter.location, 'i');
  if (filter.company) query.company = new RegExp(filter.company, 'i');

  if (filter.search) {
    const searchRegex = new RegExp(filter.search, 'i');
    query.$or = [
      { title: searchRegex },
      { company: searchRegex },
      { description: searchRegex },
      { skillsRequired: { $in: [searchRegex] } },
    ];
  }

  return Job.find(query)
    .populate('postedBy', 'name company jobRole email profilePhoto headline')
    .sort({ createdAt: -1 });
};

const getJobById = async (id) => {
  const job = await Job.findById(id)
    .populate('postedBy', 'name company jobRole email profilePhoto headline')
    .populate('applicants.student', 'name email role branch semester profilePhoto');

  if (!job) {
    throw ApiError.notFound('Job post not found');
  }
  return job;
};

const applyToJob = async (jobId, studentId) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job post not found');
  }

  if (job.status && job.status.toLowerCase() === 'closed') {
    throw ApiError.badRequest('This job posting is closed');
  }

  // Prevent duplicate application
  const alreadyApplied = (job.applicants || []).some(
    (app) => app.student && app.student.toString() === studentId.toString()
  );

  if (alreadyApplied) {
    return { message: 'You have already applied for this job!' };
  }

  await Job.findByIdAndUpdate(
    jobId,
    {
      $push: {
        applicants: {
          student: studentId,
          status: 'Applied',
          appliedAt: new Date(),
        },
      },
    },
    { runValidators: false }
  );

  // Create real-time notification for the alumni/poster if available
  if (job.postedBy) {
    const student = await User.findById(studentId).select('name');
    await Notification.create({
      recipient: job.postedBy,
      sender: studentId,
      type: 'job',
      message: `${student?.name || 'A student'} applied/requested referral for your post: "${job.title}"`,
    }).catch(() => {});
  }

  return { message: 'Applied successfully!' };
};

const toggleSaveJob = async (jobId, userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isSaved = (user.savedJobs || []).some(
    (id) => id.toString() === jobId.toString()
  );

  if (isSaved) {
    await User.findByIdAndUpdate(userId, {
      $pull: { savedJobs: jobId },
    });
  } else {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { savedJobs: jobId },
    });
  }

  return { isSaved: !isSaved };
};

const getSavedJobs = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'savedJobs',
    populate: {
      path: 'postedBy',
      select: 'name company jobRole email profilePhoto headline',
    },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user.savedJobs || [];
};

const updateJob = async (jobId, updateData, userId, userRole) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job post not found');
  }

  if (
    job.postedBy &&
    job.postedBy.toString() !== userId.toString() &&
    userRole !== 'admin'
  ) {
    throw ApiError.forbidden('You are not authorized to update this job');
  }

  const updatedJob = await Job.findByIdAndUpdate(
    jobId,
    { $set: updateData },
    { new: true, runValidators: false }
  ).populate('postedBy', 'name company jobRole email profilePhoto');

  return updatedJob;
};

const deleteJob = async (jobId, userId, userRole) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job post not found');
  }

  if (
    job.postedBy &&
    job.postedBy.toString() !== userId.toString() &&
    userRole !== 'admin'
  ) {
    throw ApiError.forbidden('You are not authorized to delete this job');
  }

  await Job.findByIdAndDelete(jobId);
  return { message: 'Job deleted successfully' };
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  applyToJob,
  toggleSaveJob,
  getSavedJobs,
  updateJob,
  deleteJob,
};
