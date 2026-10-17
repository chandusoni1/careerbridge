const VALID_BRANCHES = [
  'CSE',
  'AI & DS',
  'EEE',
  'Mechanical Engineering',
  'Mechatronics',
  'Civil Engineering',
  'IT',
  'ECE',
];

const VALID_COLLEGES = ['CSIT', 'CSIP'];

const validateSignup = (req) => {
  const {
    name,
    email,
    password,
    role = 'student',
    college,
    branch,
    academicYear,
    passingYear,
    company,
    companyLocation,
  } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { isValid: false, error: 'Name is required (minimum 2 characters)' };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { isValid: false, error: 'A valid email address is required' };
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return {
      isValid: false,
      error: 'Password is required and must be at least 6 characters long',
    };
  }

  if (role && !['student', 'alumni', 'admin'].includes(role)) {
    return { isValid: false, error: 'Role must be student, alumni, or admin' };
  }

  // Student Validation
  if (role === 'student') {
    if (college && !VALID_COLLEGES.includes(college)) {
      return { isValid: false, error: 'Invalid college selected' };
    }
    if (branch && !VALID_BRANCHES.includes(branch)) {
      return { isValid: false, error: 'Invalid branch selected' };
    }
  }

  // Alumni Validation
  if (role === 'alumni') {
    if (passingYear && (isNaN(Number(passingYear)) || Number(passingYear) < 1980 || Number(passingYear) > 2030)) {
      return { isValid: false, error: 'Please enter a valid year of passing' };
    }
  }

  return { isValid: true };
};

const validateLogin = (req) => {
  const { email, password } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { isValid: false, error: 'Valid email is required' };
  }

  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }

  return { isValid: true };
};

module.exports = {
  validateSignup,
  validateLogin,
  VALID_BRANCHES,
  VALID_COLLEGES,
};
