const validateCreateJob = (req) => {
  const { title, company, location, type, description } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return { isValid: false, error: 'Job title is required' };
  }

  if (!company || typeof company !== 'string' || !company.trim()) {
    return { isValid: false, error: 'Company name is required' };
  }

  if (!location || typeof location !== 'string' || !location.trim()) {
    return { isValid: false, error: 'Location is required' };
  }

  if (!type || !['Job', 'Internship', 'Referral'].includes(type)) {
    return {
      isValid: false,
      error: "Type must be one of 'Job', 'Internship', or 'Referral'",
    };
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    return { isValid: false, error: 'Job description is required' };
  }

  return { isValid: true };
};

const validateApplyJob = (req) => {
  const studentId = req.body.studentId || (req.user && req.user.id);

  if (!studentId) {
    return { isValid: false, error: 'Student ID is required to apply' };
  }

  return { isValid: true };
};

module.exports = {
  validateCreateJob,
  validateApplyJob,
};
