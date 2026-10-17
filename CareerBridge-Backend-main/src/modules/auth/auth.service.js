const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');

const signupUser = async (userData) => {
  const {
    name,
    email,
    password,
    role = 'student',
    college = 'CSIT',
    branch = 'CSE',
    academicYear = '3rd Year',
    passingYear,
    graduationYear,
    company = '',
    companyLocation = '',
    jobRole = '',
  } = userData;

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw ApiError.badRequest('Yeh email pehle se registered hai bhai!');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role,
    college,
    branch,
    academicYear,
    passingYear: passingYear ? Number(passingYear) : graduationYear ? Number(graduationYear) : undefined,
    graduationYear: graduationYear ? Number(graduationYear) : passingYear ? Number(passingYear) : undefined,
    company,
    companyLocation,
    jobRole,
    headline:
      role === 'alumni' && company
        ? `${jobRole || 'Professional'} at ${company}`
        : `${role === 'alumni' ? 'Alumni' : 'Student'} at ${college} (${branch})`,
  });

  // Pre-seed education record if available
  if (college) {
    newUser.education.push({
      institute: college,
      branch: branch || 'Engineering',
      startYear: passingYear ? Number(passingYear) - 4 : new Date().getFullYear() - 2,
      endYear: passingYear ? Number(passingYear) : new Date().getFullYear() + 2,
    });
  }

  // Pre-seed experience record for alumni if company provided
  if (role === 'alumni' && company) {
    newUser.experience.push({
      company,
      location: companyLocation || '',
      title: jobRole || 'Engineer',
      isCurrent: true,
      startDate: `${new Date().getFullYear() - 1}`,
    });
  }

  await newUser.save();

  const userSafe = newUser.toObject();
  delete userSafe.password;

  return {
    message: 'Mubarak ho! Naya user successfully save ho gaya! 🎉',
    user: userSafe,
  };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw ApiError.badRequest(
      'this email is not registered , plese signup first.'
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw ApiError.badRequest('entered password is wrong');
  }

  const expiresIn =
    typeof env.JWT_EXPIRES_IN === 'string' && env.JWT_EXPIRES_IN.trim()
      ? env.JWT_EXPIRES_IN.trim().replace(/,$/, '')
      : '1d';

  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    env.JWT_SECRET ,
    { expiresIn: expiresIn }
  );

  const userSafe = user.toObject();
  delete userSafe.password;

  return {
    message: 'Login successful! 🎉',
    token,
    user: userSafe,
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

module.exports = {
  signupUser,
  loginUser,
  getUserById,
};
