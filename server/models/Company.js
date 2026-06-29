import mongoose from 'mongoose';

const interviewRoundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  tips: { type: String, default: '' },
});

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  category: { type: String, default: 'general' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  answer: { type: String, default: '' },
});

const experienceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  result: {
    type: String,
    enum: ['selected', 'rejected', 'pending', 'withdrew'],
    default: 'pending',
  },
  date: { type: Date, default: Date.now },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    logo: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
      default: 'large',
    },
    location: {
      type: String,
      default: '',
    },
    interviewProcess: {
      type: [String],
      default: [],
    },
    interviewRounds: [interviewRoundSchema],
    frequentlyAskedQuestions: [faqSchema],
    difficultyRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    preparationTips: {
      type: [String],
      default: [],
    },
    interviewExperiences: [experienceSchema],
    tags: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

companySchema.virtual('experienceCount').get(function () {
  return this.interviewExperiences ? this.interviewExperiences.length : 0;
});

companySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  next();
});

companySchema.index({ slug: 1 });
companySchema.index({ name: 'text', description: 'text', tags: 'text' });
companySchema.index({ industry: 1 });
companySchema.index({ difficultyRating: 1 });

const Company = mongoose.model('Company', companySchema);
export default Company;
