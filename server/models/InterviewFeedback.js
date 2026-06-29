import mongoose from 'mongoose';

const interviewFeedbackSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    technicalScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    communicationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    grammarScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    vocabularyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    clarityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    detailedFeedback: {
      type: String,
      default: '',
    },
    radarData: {
      technical: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      grammar: { type: Number, default: 0 },
      vocabulary: { type: Number, default: 0 },
      clarity: { type: Number, default: 0 },
    },
    fillerWordCount: {
      type: Number,
      default: 0,
    },
    avgSpeakingSpeed: {
      type: Number,
      default: 0,
    },
    pauseAnalysis: {
      avgPauseDuration: { type: Number, default: 0 },
      totalPauses: { type: Number, default: 0 },
      longPauses: { type: Number, default: 0 },
    },
    emotionAnalysis: {
      confident: { type: Number, default: 0 },
      nervous: { type: Number, default: 0 },
      enthusiastic: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

interviewFeedbackSchema.index({ interview: 1 });
interviewFeedbackSchema.index({ user: 1 });

const InterviewFeedback = mongoose.model('InterviewFeedback', interviewFeedbackSchema);
export default InterviewFeedback;
