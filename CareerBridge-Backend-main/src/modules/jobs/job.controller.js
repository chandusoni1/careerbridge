const jobService = require('./job.service');
const asyncHandler = require('../../utils/asyncHandler');

const createJob = asyncHandler(async (req, res) => {
  const jobData = {
    ...req.body,
    postedBy: req.user ? req.user.id : req.body.postedBy,
  };
  const newJob = await jobService.createJob(jobData);
  res.status(201).json(newJob);
});

const getAllJobs = asyncHandler(async (req, res) => {
  const jobs = await jobService.getAllJobs(req.query);
  res.status(200).json(jobs);
});

const getJobById = asyncHandler(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);
  res.status(200).json(job);
});

const applyJob = asyncHandler(async (req, res) => {
  const studentId = req.user ? req.user.id : req.body.studentId;
  const result = await jobService.applyToJob(req.params.id, studentId);
  res.status(200).json(result);
});

const toggleSaveJob = asyncHandler(async (req, res) => {
  const result = await jobService.toggleSaveJob(req.params.id, req.user.id);
  res.status(200).json(result);
});

const getSavedJobs = asyncHandler(async (req, res) => {
  const savedJobs = await jobService.getSavedJobs(req.user.id);
  res.status(200).json(savedJobs);
});

const updateJob = asyncHandler(async (req, res) => {
  const updatedJob = await jobService.updateJob(
    req.params.id,
    req.body,
    req.user.id,
    req.user.role
  );
  res.status(200).json(updatedJob);
});

const deleteJob = asyncHandler(async (req, res) => {
  const result = await jobService.deleteJob(
    req.params.id,
    req.user.id,
    req.user.role
  );
  res.status(200).json(result);
});

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  applyJob,
  toggleSaveJob,
  getSavedJobs,
  updateJob,
  deleteJob,
};
