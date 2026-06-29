import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'past_due'],
      default: 'active',
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    razorpaySubscriptionId: {
      type: String,
      default: null,
    },
    razorpayCustomerId: {
      type: String,
      default: null,
    },
    currentPeriodStart: {
      type: Date,
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    features: {
      maxInterviews: {
        type: Number,
        default: 3,
      },
      maxResumes: {
        type: Number,
        default: 1,
      },
      voiceInterview: {
        type: Boolean,
        default: false,
      },
      codingInterview: {
        type: Boolean,
        default: false,
      },
      aiCoach: {
        type: Boolean,
        default: false,
      },
      downloadReports: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ plan: 1, status: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ razorpaySubscriptionId: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
