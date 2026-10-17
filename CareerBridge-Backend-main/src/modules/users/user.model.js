const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  institute: { type: String, required: true },
  location: { type: String, default: '' },
  degree: { type: String, default: 'Bachelor of Technology' },
  branch: { type: String, default: '' },
  startYear: { type: Number },
  endYear: { type: Number },
  achievements: { type: String, default: '' },
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  location: { type: String, default: '' },
  title: { type: String, required: true },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'],
    default: 'Full-time',
  },
  startDate: { type: String },
  endDate: { type: String },
  isCurrent: { type: Boolean, default: false },
  responsibilities: { type: String, default: '' },
  achievements: { type: String, default: '' },
  skills: [{ type: String }],
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  techStack: [{ type: String }],
  repoUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  images: [{ type: String }],
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'alumni', 'admin'],
      default: 'student',
    },
    isVerified: { type: Boolean, default: false },
    isAlumniVerified: { type: Boolean, default: false },

    // Professional profile details
    profilePhoto: { type: String, default: '' },
    headline: { type: String, default: '' },
    bio: { type: String, default: '' },
    about: { type: String, default: '' },
    location: { type: String, default: '' },
    phone: { type: String, default: '' },
    isPhonePublic: { type: Boolean, default: false },
    isEmailPublic: { type: Boolean, default: false },
    skills: [{ type: String }],
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' },

    // Student Specific
    college: { type: String, default: 'CSIT' },
    branch: { type: String, default: 'CSE' },
    academicYear: {
      type: String,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', ''],
      default: '3rd Year',
    },
    semester: { type: Number },
    resumeUrl: { type: String, default: '' },

    // Alumni Specific
    company: { type: String, default: '' },
    companyLocation: { type: String, default: '' },
    jobRole: { type: String, default: '' },
    passingYear: { type: Number },
    graduationYear: { type: Number },
    experienceYears: { type: Number, default: 0 },
    isAvailableForMentorship: { type: Boolean, default: true },

    // Structured resume & portfolio sections
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema],
    certifications: [
      {
        name: String,
        issuer: String,
        year: Number,
        link: String,
      },
    ],

    // Saved jobs & bookmarks
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

    // Network relationships
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    connectionRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Received
    sentConnectionRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Sent

    // Online presence tracking
    lastSeen: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ company: 1 });
userSchema.index({ college: 1 });
userSchema.index({ branch: 1 });
userSchema.index({ skills: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
