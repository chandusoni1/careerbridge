const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: {
      type: String,
      default: 'Job',
    },
    workplaceType: {
      type: String,
      default: 'On-site',
    },
    employmentType: {
      type: String,
      default: 'Full-time',
    },
    salary: { type: String, default: '' },
    deadline: { type: String, default: '' },
    applicationUrl: { type: String, default: '' },
    status: {
      type: String,
      default: 'Active',
    },
    description: { type: String, required: true },
    skillsRequired: [{ type: String }],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    applicants: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: {
          type: String,
          default: 'Applied',
        },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

jobSchema.index({ company: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ workplaceType: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ createdAt: -1 });

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

module.exports = Job;
