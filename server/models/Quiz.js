import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, default: '' },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Quiz category is required'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    questions: [quizQuestionSchema],
    timeLimit: {
      type: Number,
      default: 30,
      comment: 'Time limit in minutes',
    },
    passingScore: {
      type: Number,
      default: 70,
      comment: 'Percentage required to pass',
    },
    xpReward: {
      type: Number,
      default: 50,
    },
  },
  {
    timestamps: true,
  }
);

quizSchema.index({ category: 1, difficulty: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
