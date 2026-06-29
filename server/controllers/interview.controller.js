import Interview from '../models/Interview.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import InterviewAnswer from '../models/InterviewAnswer.js';
import InterviewFeedback from '../models/InterviewFeedback.js';
import Profile from '../models/Profile.js';
import Notification from '../models/Notification.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateInterviewFeedback,
} from '../services/ai.service.js';
import { awardXP, checkAndAwardAchievements } from '../services/achievement.service.js';
import { sendInterviewCompletedEmail } from '../services/email.service.js';
import { updateLeaderboardEntry } from './leaderboard.controller.js';
import logger from '../utils/logger.js';

// @desc    Create a new interview session
// @route   POST /api/v1/interviews/create
// @access  Private
const createInterview = asyncHandler(async (req, res, next) => {
  const { title, type, role, difficulty, experience, duration, questionCount, isVoiceEnabled } = req.body;

  // Generate questions via AI
  let questionsData;
  try {
    questionsData = await generateInterviewQuestions(role, type, difficulty, experience, questionCount || 8);
  } catch (error) {
    logger.error(`Interview question generation failed: ${error.message}`);
    return next(new AppError('Failed to generate interview questions. Please try again.', 500));
  }

  // Create interview document
  const interview = await Interview.create({
    user: req.user._id,
    title,
    type,
    role,
    difficulty,
    experience,
    duration: duration || 30,
    isVoiceEnabled: isVoiceEnabled || false,
    status: 'pending',
  });

  // Create question documents
  const questionDocs = await InterviewQuestion.insertMany(
    questionsData.map((q) => ({
      ...q,
      interview: interview._id,
    }))
  );

  // Link questions to interview
  interview.questions = questionDocs.map((q) => q._id);
  await interview.save();

  const populatedInterview = await Interview.findById(interview._id).populate('questions');

  res.status(201).json({
    success: true,
    message: 'Interview created successfully.',
    interview: populatedInterview,
  });
});

// @desc    Get all interviews for current user
// @route   GET /api/v1/interviews
// @access  Private
const getInterviews = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const { status, type } = req.query;

  const filter = { user: req.user._id };
  if (status) filter.status = status;
  if (type) filter.type = type;

  const [interviews, total] = await Promise.all([
    Interview.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-transcript'),
    Interview.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    interviews,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Get single interview details
// @route   GET /api/v1/interviews/:id
// @access  Private
const getInterview = asyncHandler(async (req, res, next) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id })
    .populate('questions')
    .populate('answers')
    .populate('feedback');

  if (!interview) {
    return next(new AppError('Interview not found.', 404));
  }

  res.status(200).json({ success: true, interview });
});

// @desc    Start an interview session
// @route   POST /api/v1/interviews/:id/start
// @access  Private
const startInterview = asyncHandler(async (req, res, next) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) {
    return next(new AppError('Interview not found.', 404));
  }

  if (interview.status === 'completed') {
    return next(new AppError('This interview has already been completed.', 400));
  }

  if (interview.status === 'active') {
    return res.status(200).json({ success: true, message: 'Interview already active.', interview });
  }

  interview.status = 'active';
  interview.startedAt = new Date();
  await interview.save();

  res.status(200).json({ success: true, message: 'Interview started.', interview });
});

// @desc    Submit an answer to a question
// @route   POST /api/v1/interviews/:id/answer/:questionId
// @access  Private
const submitAnswer = asyncHandler(async (req, res, next) => {
  const { answerText, codeAnswer, language, timeTaken, audioUrl, transcribedText } = req.body;
  const { id: interviewId, questionId } = req.params;

  const [interview, question] = await Promise.all([
    Interview.findOne({ _id: interviewId, user: req.user._id }),
    InterviewQuestion.findOne({ _id: questionId, interview: interviewId }),
  ]);

  if (!interview) return next(new AppError('Interview not found.', 404));
  if (!question) return next(new AppError('Question not found.', 404));
  if (interview.status !== 'active') {
    return next(new AppError('Interview is not active. Start the interview first.', 400));
  }

  // Check if already answered
  const existingAnswer = await InterviewAnswer.findOne({
    interview: interviewId,
    question: questionId,
    user: req.user._id,
  });

  const answerContent = answerText || transcribedText || '';
  const wordCount = answerContent.split(/\s+/).filter(Boolean).length;

  // AI evaluation of the answer
  let aiScore = null;
  let aiFeedback = '';
  try {
    const evaluation = await evaluateAnswer(question, answerContent, interview.type);
    aiScore = evaluation.score;
    aiFeedback = evaluation.feedback;
  } catch (err) {
    logger.warn(`Answer evaluation failed: ${err.message}`);
  }

  let answer;
  if (existingAnswer) {
    existingAnswer.answerText = answerText || '';
    existingAnswer.codeAnswer = codeAnswer || '';
    existingAnswer.language = language || '';
    existingAnswer.audioUrl = audioUrl || '';
    existingAnswer.transcribedText = transcribedText || '';
    existingAnswer.timeTaken = timeTaken || 0;
    existingAnswer.wordCount = wordCount;
    existingAnswer.score = aiScore;
    existingAnswer.aiFeedback = aiFeedback;
    answer = await existingAnswer.save();
  } else {
    answer = await InterviewAnswer.create({
      interview: interviewId,
      question: questionId,
      user: req.user._id,
      answerText: answerText || '',
      codeAnswer: codeAnswer || '',
      language: language || '',
      audioUrl: audioUrl || '',
      transcribedText: transcribedText || '',
      timeTaken: timeTaken || 0,
      wordCount,
      score: aiScore,
      aiFeedback,
    });

    // Add to interview answers array if not already there
    await Interview.findByIdAndUpdate(interviewId, {
      $addToSet: { answers: answer._id },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Answer submitted.',
    answer,
  });
});

// @desc    Complete an interview and trigger feedback generation
// @route   POST /api/v1/interviews/:id/complete
// @access  Private
const completeInterview = asyncHandler(async (req, res, next) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id })
    .populate('questions')
    .populate('answers');

  if (!interview) {
    return next(new AppError('Interview not found.', 404));
  }

  if (interview.status === 'completed') {
    return res.status(200).json({ success: true, message: 'Interview already completed.', interview });
  }

  interview.status = 'completed';
  interview.completedAt = new Date();
  await interview.save();

  // Generate comprehensive feedback asynchronously
  generateFeedbackBackground(interview._id, req.user).catch((err) =>
    logger.error(`Feedback generation failed: ${err.message}`)
  );

  res.status(200).json({
    success: true,
    message: 'Interview completed. Generating your feedback report...',
    interview,
  });
});

/**
 * Background: Generate comprehensive AI feedback for completed interview
 */
const generateFeedbackBackground = async (interviewId, user) => {
  try {
    const interview = await Interview.findById(interviewId)
      .populate('questions')
      .populate('answers');

    if (!interview) return;

    const feedbackData = await generateInterviewFeedback(
      interview.questions,
      interview.answers,
      interview.type
    );

    // Create feedback document
    const feedback = await InterviewFeedback.create({
      interview: interviewId,
      user: interview.user,
      ...feedbackData,
    });

    // Update interview with scores
    await Interview.findByIdAndUpdate(interviewId, {
      feedback: feedback._id,
      overallScore: feedbackData.overallScore,
      technicalScore: feedbackData.technicalScore,
      communicationScore: feedbackData.communicationScore,
      confidenceScore: feedbackData.confidenceScore,
      grammarScore: feedbackData.grammarScore,
    });

    // Award XP
    const xpAmount = Math.round((feedbackData.overallScore / 100) * 200) + 50;
    await awardXP(interview.user, xpAmount, `Completed ${interview.type} interview`);

    // Update profile interview count and weekly progress
    await Profile.findOneAndUpdate(
      { user: interview.user },
      { $inc: { interviewCount: 1 } }
    );

    // Check achievements
    await checkAndAwardAchievements(interview.user);

    // Update leaderboard
    await updateLeaderboardEntry(interview.user, feedbackData.overallScore);

    // Send completion email
    try {
      await sendInterviewCompletedEmail(user.email, user.name, feedbackData.overallScore);
    } catch (emailErr) {
      logger.warn(`Interview completion email failed: ${emailErr.message}`);
    }

    // Push notification
    await Notification.create({
      user: interview.user,
      title: '📊 Interview Feedback Ready!',
      message: `Your ${interview.type} interview feedback is ready. Overall score: ${feedbackData.overallScore}%`,
      type: 'interview',
      link: `/interviews/${interviewId}/report`,
    });
  } catch (error) {
    logger.error(`generateFeedbackBackground error: ${error.message}`);
  }
};

// @desc    Get interview full report
// @route   GET /api/v1/interviews/:id/report
// @access  Private
const getInterviewReport = asyncHandler(async (req, res, next) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id })
    .populate('questions')
    .populate('answers')
    .populate('feedback');

  if (!interview) {
    return next(new AppError('Interview not found.', 404));
  }

  if (interview.status !== 'completed') {
    return next(new AppError('Interview is not yet completed.', 400));
  }

  res.status(200).json({ success: true, report: interview });
});

// @desc    Delete an interview
// @route   DELETE /api/v1/interviews/:id
// @access  Private
const deleteInterview = asyncHandler(async (req, res, next) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) {
    return next(new AppError('Interview not found.', 404));
  }

  // Delete related documents
  await Promise.all([
    InterviewQuestion.deleteMany({ interview: interview._id }),
    InterviewAnswer.deleteMany({ interview: interview._id }),
    InterviewFeedback.deleteOne({ interview: interview._id }),
    interview.deleteOne(),
  ]);

  res.status(200).json({ success: true, message: 'Interview deleted successfully.' });
});

export {
  createInterview,
  getInterviews,
  getInterview,
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewReport,
  deleteInterview,
};
