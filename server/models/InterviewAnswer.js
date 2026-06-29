import mongoose from 'mongoose';

const executionResultSchema = new mongoose.Schema({
  output: { type: String, default: '' },
  error: { type: String, default: '' },
  executionTime: { type: Number, default: 0 },
  memoryUsed: { type: Number, default: 0 },
});

const interviewAnswerSchema = new mongoose.Schema(
  {
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answerText: {
      type: String,
      default: '',
    },
    codeAnswer: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: '',
    },
    executionResult: executionResultSchema,
    audioUrl: {
      type: String,
      default: '',
    },
    transcribedText: {
      type: String,
      default: '',
    },
    timeTaken: {
      type: Number,
      default: 0,
      comment: 'Time in seconds',
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    fillerWords: {
      type: [String],
      default: [],
    },
    speakingSpeed: {
      type: Number,
      default: 0,
      comment: 'Words per minute',
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    aiFeedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

interviewAnswerSchema.index({ interview: 1, question: 1 });
interviewAnswerSchema.index({ user: 1 });

const InterviewAnswer = mongoose.model('InterviewAnswer', interviewAnswerSchema);
export default InterviewAnswer;
