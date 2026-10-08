const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'alumni', 'admin'], default: 'student' },
  isVerified: { type: Boolean, default: false },
  isAlumniVerified: { type: Boolean, default: false },
  profilePhoto: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  
  // Student Specific
  college: { type: String },
  branch: { type: String },
  semester: { type: Number },
  resumeUrl: { type: String, default: '' },
  projects: [{ title: String, description: String, link: String }],
  certifications: [{ name: String, issuer: String }],

  // Alumni Specific
  company: { type: String },
  jobRole: { type: String },
  experienceYears: { type: Number },
  graduationYear: { type: Number },
  isAvailableForMentorship: { type: Boolean, default: true },

  // Network
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  connectionRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
