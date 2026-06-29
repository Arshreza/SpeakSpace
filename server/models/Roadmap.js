import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  resources: { type: [String], default: [] },
  completed: { type: Boolean, default: false },
});

const weekPlanSchema = new mongoose.Schema({
  week: { type: String, required: true },
  tasks: [taskSchema],
});

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    targetCompany: {
      type: String,
      default: '',
    },
    targetRole: {
      type: String,
      default: '',
    },
    currentSkills: {
      type: [String],
      default: [],
    },
    plan30Days: [weekPlanSchema],
    plan60Days: [weekPlanSchema],
    plan90Days: [weekPlanSchema],
    generatedBy: {
      type: String,
      default: 'ai',
    },
  },
  {
    timestamps: true,
  }
);

roadmapSchema.index({ user: 1 });

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
export default Roadmap;
