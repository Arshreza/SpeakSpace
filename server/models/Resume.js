import mongoose from 'mongoose';

const grammarIssueSchema = new mongoose.Schema({
  issue: { type: String },
  suggestion: { type: String },
});

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    cloudinaryId: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    extractedText: {
      type: String,
    },
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    grammarScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    keywordScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    keywords: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    extractedSkills: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: '',
    },
    grammarIssues: [grammarIssueSchema],
    projectSuggestions: {
      type: [String],
      default: [],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    analysisStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    analysisError: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.index({ user: 1 });
resumeSchema.index({ user: 1, isDefault: 1 });
resumeSchema.index({ analysisStatus: 1 });
resumeSchema.index({ createdAt: -1 });

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
