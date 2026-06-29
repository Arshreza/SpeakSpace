import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Interview title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['hr', 'behavioral', 'technical', 'coding', 'system-design', 'custom'],
      required: [true, 'Interview type is required'],
    },
    role: {
      type: String,
      required: [true, 'Target role is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    experience: {
      type: String,
      enum: ['fresher', 'junior', 'mid', 'senior'],
      default: 'junior',
    },
    duration: {
      type: Number,
      default: 30,
      comment: 'Duration in minutes',
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InterviewQuestion',
      },
    ],
    answers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InterviewAnswer',
      },
    ],
    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewFeedback',
      default: null,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    technicalScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    communicationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    confidenceScore: {
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
    isVoiceEnabled: {
      type: Boolean,
      default: false,
    },
    transcript: {
      type: String,
      default: '',
    },
    recordingUrl: {
      type: String,
      default: '',
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

interviewSchema.virtual('durationActual').get(function () {
  if (this.startedAt && this.completedAt) {
    return Math.floor((this.completedAt - this.startedAt) / 60000);
  }
  return null;
});

interviewSchema.index({ user: 1, status: 1 });
interviewSchema.index({ user: 1, createdAt: -1 });
interviewSchema.index({ type: 1, difficulty: 1 });

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
