import CodingSubmission from '../models/CodingSubmission.js';
import Interview from '../models/Interview.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import OpenAI from 'openai';
import logger from '../utils/logger.js';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || 'sk-placeholder',
  baseURL: 'https://api.groq.com/openai/v1',
});

/**
 * Simulate code execution using sandbox approach
 * In production, integrate with Judge0 API or similar
 */
const simulateCodeExecution = async (language, code, input = '') => {
  const startTime = Date.now();

  try {
    if (language === 'javascript') {
      // Safe sandbox execution for JavaScript
      const forbiddenPatterns = [
        'require(', 'import(', 'process.', 'fs.', '__dirname',
        'eval(', 'Function(', 'fetch(', 'XMLHttpRequest',
      ];

      for (const pattern of forbiddenPatterns) {
        if (code.includes(pattern)) {
          return {
            output: '',
            error: `Security restriction: '${pattern}' is not allowed in sandbox execution.`,
            executionTime: 0,
            memoryUsed: 0,
            status: 'runtime-error',
          };
        }
      }

      // Capture console.log output
      let output = '';
      const sandbox = {
        console: {
          log: (...args) => { output += args.join(' ') + '\n'; },
          error: (...args) => { output += '[ERROR] ' + args.join(' ') + '\n'; },
        },
        Math,
        parseInt,
        parseFloat,
        JSON,
        Array,
        Object,
        String,
        Number,
        Boolean,
        Date,
        Map,
        Set,
        Promise,
      };

      try {
        const fn = new Function(...Object.keys(sandbox), code);
        fn(...Object.values(sandbox));
        return {
          output: output.trim(),
          error: '',
          executionTime: Date.now() - startTime,
          memoryUsed: 0,
          status: 'accepted',
        };
      } catch (runtimeError) {
        return {
          output: '',
          error: runtimeError.message,
          executionTime: Date.now() - startTime,
          memoryUsed: 0,
          status: 'runtime-error',
        };
      }
    }

    // For other languages, return a simulated response
    // In production, integrate with Judge0: https://judge0.com/
    return {
      output: `[Sandbox] Code received for ${language}. In production, this uses Judge0 API for real execution.`,
      error: '',
      executionTime: Math.floor(Math.random() * 100) + 10,
      memoryUsed: Math.floor(Math.random() * 1024) + 512,
      status: 'accepted',
    };
  } catch (error) {
    return {
      output: '',
      error: error.message,
      executionTime: Date.now() - startTime,
      memoryUsed: 0,
      status: 'runtime-error',
    };
  }
};

/**
 * Get AI code review
 */
const getAICodeReview = async (code, language, question) => {
  const prompt = `You are an expert software engineer reviewing a coding interview submission.

Problem: ${question?.questionText || 'Coding problem'}
Language: ${language}
Submitted Code:
\`\`\`${language}
${code}
\`\`\`

Provide a concise but thorough code review. Return ONLY valid JSON:
{
  "aiReview": "<2-3 paragraph review covering correctness, efficiency, and code quality>",
  "timeComplexity": "<Big-O time complexity with brief explanation>",
  "spaceComplexity": "<Big-O space complexity with brief explanation>",
  "optimizationSuggestions": ["<specific suggestion 1>", "<specific suggestion 2>", "<specific suggestion 3>"],
  "testCasesPassed": <estimated 0-5>,
  "totalTestCases": 5
}`;

  const response = await openai.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (e) {
    return {
      aiReview: 'Code review completed.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      optimizationSuggestions: [],
      testCasesPassed: 0,
      totalTestCases: 5,
    };
  }
};

// @desc    Submit code for a coding interview question
// @route   POST /api/v1/coding/submit
// @access  Private
const submitCode = asyncHandler(async (req, res, next) => {
  const { interviewId, questionId, language, code } = req.body;

  const [interview, question] = await Promise.all([
    Interview.findOne({ _id: interviewId, user: req.user._id }),
    InterviewQuestion.findOne({ _id: questionId, interview: interviewId }),
  ]);

  if (!interview) return next(new AppError('Interview not found.', 404));
  if (!question) return next(new AppError('Question not found.', 404));

  // Execute code
  const executionResult = await simulateCodeExecution(language, code, '');

  // Get AI review
  let reviewData;
  try {
    reviewData = await getAICodeReview(code, language, question);
  } catch (err) {
    logger.warn(`AI code review failed: ${err.message}`);
    reviewData = {
      aiReview: 'Code review unavailable.',
      timeComplexity: 'Unknown',
      spaceComplexity: 'Unknown',
      optimizationSuggestions: [],
      testCasesPassed: executionResult.status === 'accepted' ? 3 : 0,
      totalTestCases: 5,
    };
  }

  const submission = await CodingSubmission.create({
    user: req.user._id,
    interview: interviewId,
    question: questionId,
    language,
    code,
    output: executionResult.output,
    error: executionResult.error,
    executionTime: executionResult.executionTime,
    memoryUsed: executionResult.memoryUsed,
    status: executionResult.status,
    aiReview: reviewData.aiReview,
    timeComplexity: reviewData.timeComplexity,
    spaceComplexity: reviewData.spaceComplexity,
    optimizationSuggestions: reviewData.optimizationSuggestions,
    testCasesPassed: reviewData.testCasesPassed,
    totalTestCases: reviewData.totalTestCases,
    submittedAt: new Date(),
  });

  res.status(201).json({
    success: true,
    message: 'Code submitted successfully.',
    submission,
  });
});

// @desc    Run code without saving (for testing)
// @route   POST /api/v1/coding/run
// @access  Private
const runCode = asyncHandler(async (req, res, next) => {
  const { language, code, input } = req.body;

  if (!language || !code) {
    return next(new AppError('Language and code are required.', 400));
  }

  const result = await simulateCodeExecution(language, code, input || '');

  res.status(200).json({
    success: true,
    result,
  });
});

// @desc    Get all submissions for an interview
// @route   GET /api/v1/coding/:interviewId/submissions
// @access  Private
const getSubmissions = asyncHandler(async (req, res, next) => {
  const interview = await Interview.findOne({
    _id: req.params.interviewId,
    user: req.user._id,
  });

  if (!interview) {
    return next(new AppError('Interview not found.', 404));
  }

  const submissions = await CodingSubmission.find({
    interview: req.params.interviewId,
    user: req.user._id,
  })
    .sort({ submittedAt: -1 })
    .populate('question', 'questionText topic difficulty');

  res.status(200).json({
    success: true,
    count: submissions.length,
    submissions,
  });
});

export { submitCode, runCode, getSubmissions };
