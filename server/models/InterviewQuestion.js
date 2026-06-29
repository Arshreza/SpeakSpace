import mongoose from 'mongoose';

const interviewQuestionSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
    },
    questionType: {
      type: String,
      enum: ['text', 'code', 'system-design'],
      default: 'text',
    },
    codeLanguage: {
      type: String,
      default: '',
    },
    expectedAnswer: {
      type: String,
      default: '',
    },
    hints: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    orderIndex: {
      type: Number,
      required: true,
    },
    topic: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

interviewQuestionSchema.index({ interview: 1, orderIndex: 1 });

const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);
export default InterviewQuestion;
