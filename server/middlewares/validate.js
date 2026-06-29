import Joi from 'joi';
import { AppError } from './errorHandler.js';

/**
 * Middleware factory that validates req.body against a Joi schema.
 * Returns 400 with validation messages on failure.
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'params' ? req.params : source === 'query' ? req.query : req.body;

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    });

    if (error) {
      const messages = error.details.map((d) => d.message.replace(/"/g, "'"));
      return next(new AppError(messages.join('. '), 400));
    }

    // Replace the source with the validated/sanitized value
    if (source === 'params') req.params = value;
    else if (source === 'query') req.query = value;
    else req.body = value;

    next();
  };
};

// =====================
// Joi validation schemas
// =====================
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required().trim().messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required',
    }),
    email: Joi.string().email().lowercase().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'Password is required',
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().lowercase().required(),
  }),

  resetPassword: Joi.object({
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
    }),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
  }),

  updateProfile: Joi.object({
    bio: Joi.string().max(500).allow('').optional(),
    phone: Joi.string().max(20).allow('').optional(),
    location: Joi.string().max(100).allow('').optional(),
    website: Joi.string().uri().allow('').optional(),
    linkedin: Joi.string().allow('').optional(),
    github: Joi.string().allow('').optional(),
    portfolio: Joi.string().uri().allow('').optional(),
    targetCompany: Joi.string().max(100).allow('').optional(),
    targetRole: Joi.string().max(100).allow('').optional(),
    preferredLanguage: Joi.string()
      .valid('javascript', 'python', 'java', 'cpp', 'go', 'rust', 'typescript')
      .optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    yearsOfExperience: Joi.number().min(0).max(50).optional(),
    education: Joi.array()
      .items(
        Joi.object({
          institution: Joi.string().required(),
          degree: Joi.string().required(),
          field: Joi.string().required(),
          from: Joi.date().required(),
          to: Joi.date().optional(),
          current: Joi.boolean().optional(),
        })
      )
      .optional(),
    experience: Joi.array()
      .items(
        Joi.object({
          company: Joi.string().required(),
          title: Joi.string().required(),
          description: Joi.string().allow('').optional(),
          from: Joi.date().required(),
          to: Joi.date().optional(),
          current: Joi.boolean().optional(),
        })
      )
      .optional(),
  }),

  createInterview: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    type: Joi.string()
      .valid('hr', 'behavioral', 'technical', 'coding', 'system-design', 'custom')
      .required(),
    role: Joi.string().min(2).max(100).required(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
    experience: Joi.string().valid('fresher', 'junior', 'mid', 'senior').default('junior'),
    duration: Joi.number().min(10).max(120).default(30),
    questionCount: Joi.number().min(3).max(20).default(8),
    isVoiceEnabled: Joi.boolean().default(false),
  }),

  submitAnswer: Joi.object({
    answerText: Joi.string().allow('').optional(),
    codeAnswer: Joi.string().allow('').optional(),
    language: Joi.string().allow('').optional(),
    timeTaken: Joi.number().min(0).default(0),
    audioUrl: Joi.string().allow('').optional(),
    transcribedText: Joi.string().allow('').optional(),
  }),

  submitCode: Joi.object({
    interviewId: Joi.string().required(),
    questionId: Joi.string().required(),
    language: Joi.string()
      .valid('javascript', 'python', 'java', 'cpp', 'go', 'rust', 'typescript')
      .required(),
    code: Joi.string().required(),
  }),

  runCode: Joi.object({
    language: Joi.string()
      .valid('javascript', 'python', 'java', 'cpp', 'go', 'rust', 'typescript')
      .required(),
    code: Joi.string().required(),
    input: Joi.string().allow('').optional(),
  }),

  chatWithCoach: Joi.object({
    message: Joi.string().min(1).max(2000).required(),
    history: Joi.array()
      .items(
        Joi.object({
          role: Joi.string().valid('user', 'assistant').required(),
          content: Joi.string().required(),
        })
      )
      .default([]),
  }),

  generateRoadmap: Joi.object({
    currentSkills: Joi.array().items(Joi.string()).min(1).required(),
    targetCompany: Joi.string().required(),
    targetRole: Joi.string().required(),
  }),

  addInterviewExperience: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    content: Joi.string().min(50).required(),
    result: Joi.string().valid('selected', 'rejected', 'pending', 'withdrew').default('pending'),
    date: Joi.date().optional(),
  }),

  createCompany: Joi.object({
    name: Joi.string().required(),
    website: Joi.string().uri().allow('').optional(),
    description: Joi.string().allow('').optional(),
    industry: Joi.string().allow('').optional(),
    size: Joi.string().valid('startup', 'small', 'medium', 'large', 'enterprise').optional(),
    location: Joi.string().allow('').optional(),
    tags: Joi.array().items(Joi.string()).optional(),
  }),

  textToSpeech: Joi.object({
    text: Joi.string().min(1).max(4000).required(),
    voice: Joi.string()
      .valid('alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer')
      .default('nova'),
  }),
};

export { validate, schemas };
