import mongoose from 'mongoose';

const codingSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewQuestion',
      required: true,
    },
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp', 'go', 'rust', 'typescript'],
      required: [true, 'Programming language is required'],
    },
    code: {
      type: String,
      required: [true, 'Code submission is required'],
    },
    output: {
      type: String,
      default: '',
    },
    error: {
      type: String,
      default: '',
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    executionTime: {
      type: Number,
      default: 0,
      comment: 'In milliseconds',
    },
    memoryUsed: {
      type: Number,
      default: 0,
      comment: 'In KB',
    },
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'wrong-answer',
        'time-limit',
        'memory-limit',
        'runtime-error',
        'compilation-error',
      ],
      default: 'pending',
    },
    aiReview: {
      type: String,
      default: '',
    },
    timeComplexity: {
      type: String,
      default: '',
    },
    spaceComplexity: {
      type: String,
      default: '',
    },
    optimizationSuggestions: {
      type: [String],
      default: [],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

codingSubmissionSchema.index({ user: 1, interview: 1 });
codingSubmissionSchema.index({ status: 1 });
codingSubmissionSchema.index({ submittedAt: -1 });

const CodingSubmission = mongoose.model('CodingSubmission', codingSubmissionSchema);
export default CodingSubmission;
