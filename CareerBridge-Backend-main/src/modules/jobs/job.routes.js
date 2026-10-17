const express = require('express');
const router = express.Router();
const jobController = require('./job.controller');
const authenticate = require('../../middleware/authenticate');
const { validateCreateJob, validateApplyJob } = require('./job.validation');
const validateRequest = require('../../middleware/validateRequest');

router.get('/', jobController.getAllJobs);
router.get('/saved', authenticate, jobController.getSavedJobs);
router.get('/:id', jobController.getJobById);

router.post(
  '/',
  authenticate,
  validateRequest(validateCreateJob),
  jobController.createJob
);
router.post(
  '/:id/apply',
  authenticate,
  validateRequest(validateApplyJob),
  jobController.applyJob
);
router.post('/:id/save', authenticate, jobController.toggleSaveJob);
router.put('/:id', authenticate, jobController.updateJob);
router.delete('/:id', authenticate, jobController.deleteJob);

module.exports = router;
