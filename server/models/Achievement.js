import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Achievement name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Achievement description is required'],
    },
    icon: {
      type: String,
      default: '🏆',
    },
    category: {
      type: String,
      enum: ['interview', 'resume', 'coding', 'streak', 'social', 'learning'],
      required: [true, 'Achievement category is required'],
    },
    condition: {
      type: {
        type: String,
        enum: [
          'interview_count',
          'resume_count',
          'streak_days',
          'coding_count',
          'score_threshold',
          'xp_threshold',
          'login_count',
        ],
        required: true,
      },
      threshold: {
        type: Number,
        required: true,
      },
    },
    xpReward: {
      type: Number,
      default: 100,
    },
    coinReward: {
      type: Number,
      default: 50,
    },
    badgeName: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

achievementSchema.index({ category: 1 });
achievementSchema.index({ isActive: 1 });

const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;
