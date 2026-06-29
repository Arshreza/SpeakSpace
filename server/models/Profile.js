import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, required: true },
  from: { type: Date, required: true },
  to: { type: Date },
  current: { type: Boolean, default: false },
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  from: { type: Date, required: true },
  to: { type: Date },
  current: { type: Boolean, default: false },
});

const weeklyProgressSchema = new mongoose.Schema({
  week: { type: String },
  xpEarned: { type: Number, default: 0 },
  interviewsCompleted: { type: Number, default: 0 },
});

const achievementSchema = new mongoose.Schema({
  name: { type: String },
  description: { type: String },
  earnedAt: { type: Date, default: Date.now },
});

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },
    github: {
      type: String,
      default: '',
    },
    portfolio: {
      type: String,
      default: '',
    },
    targetCompany: {
      type: String,
      default: '',
    },
    targetRole: {
      type: String,
      default: '',
    },
    preferredLanguage: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp', 'go', 'rust', 'typescript'],
      default: 'javascript',
    },
    education: [educationSchema],
    experience: [experienceSchema],
    skills: {
      type: [String],
      default: [],
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 50,
      default: 0,
    },
    resumeCount: {
      type: Number,
      default: 0,
    },
    interviewCount: {
      type: Number,
      default: 0,
    },
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    coins: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActivityDate: {
      type: Date,
      default: null,
    },
    badges: {
      type: [String],
      default: [],
    },
    achievements: [achievementSchema],
    dailyChallengesCompleted: {
      type: Number,
      default: 0,
    },
    weeklyProgress: [weeklyProgressSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

profileSchema.index({ user: 1 });
profileSchema.index({ xp: -1 });
profileSchema.index({ streak: -1 });

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
