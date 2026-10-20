const validateUpdateProfile = (req) => {
  const allowedFields = [
    'name',
    'headline',
    'bio',
    'about',
    'location',
    'phone',
    'isPhonePublic',
    'isEmailPublic',
    'skills',
    'linkedin',
    'github',
    'website',
    'college',
    'branch',
    'academicYear',
    'semester',
    'resumeUrl',
    'company',
    'companyLocation',
    'jobRole',
    'passingYear',
    'graduationYear',
    'experienceYears',
    'isAvailableForMentorship',
    'profilePhoto',
    'avatar',
    'coverPhoto',
    'education',
    'experience',
    'projects',
    'certifications',
    'savedJobs',
  ];

  const bodyKeys = Object.keys(req.body);
  if (bodyKeys.length === 0) {
    return { isValid: false, error: 'At least one field is required to update' };
  }

  const hasInvalidKey = bodyKeys.some((k) => !allowedFields.includes(k));
  if (hasInvalidKey) {
    return { isValid: false, error: 'Request body contains unsupported fields' };
  }

  return { isValid: true };
};

module.exports = {
  validateUpdateProfile,
};
