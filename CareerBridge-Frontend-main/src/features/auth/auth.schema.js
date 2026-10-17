export const validateLogin = (values) => {
  const errors = {};
  if (!values.email?.trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

export const validateSignup = (values) => {
  const errors = {};
  if (!values.name?.trim()) {
    errors.name = 'Full name is required';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!values.email?.trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (values.confirmPassword !== undefined && values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!values.role) {
    errors.role = 'Role selection is required';
  }

  if (values.role === 'student') {
    if (!values.college) errors.college = 'College selection is required';
    if (!values.branch) errors.branch = 'Branch selection is required';
    if (!values.academicYear) errors.academicYear = 'Current academic year is required';
  }

  if (values.role === 'alumni') {
    if (!values.company?.trim()) errors.company = 'Company name is required';
    if (!values.companyLocation?.trim()) errors.companyLocation = 'Company location is required';
    if (!values.passingYear) errors.passingYear = 'Year of passing is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
