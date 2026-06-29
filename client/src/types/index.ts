// Enums
export type UserRole = 'user' | 'admin' | 'recruiter';
export type SubscriptionPlan = 'free' | 'premium' | 'enterprise';
export type InterviewType = 'hr' | 'behavioral' | 'technical' | 'coding' | 'system_design' | 'custom';
export type InterviewDifficulty = 'easy' | 'medium' | 'hard';
export type InterviewExperience = 'fresher' | 'junior' | 'mid' | 'senior';
export type InterviewStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type QuestionType = 'mcq' | 'coding' | 'open_ended' | 'system_design';
export type ResumeStatus = 'uploaded' | 'analyzing' | 'analyzed' | 'failed';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// User & Auth
export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  subscription: SubscriptionPlan;
  subscriptionExpiry?: string;
  createdAt: string;
  updatedAt: string;
  profile?: Profile;
  stats?: UserStats;
}

export interface Profile {
  _id: string;
  user: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  targetCompany?: string;
  targetRole?: string;
  preferredLanguage?: string;
  skills: string[];
  education: Education[];
  experience: WorkExperience[];
  resumeScore?: number;
  interviewsCompleted?: number;
  avgScore?: number;
  streak?: number;
  xp?: number;
  level?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  _id?: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  current: boolean;
  gpa?: number;
}

export interface WorkExperience {
  _id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface UserStats {
  totalInterviews: number;
  completedInterviews: number;
  avgScore: number;
  bestScore: number;
  streak: number;
  xp: number;
  level: number;
  rank?: number;
  resumeScore?: number;
  technicalScore?: number;
  communicationScore?: number;
  confidenceScore?: number;
  grammarScore?: number;
  vocabularyScore?: number;
}

// Auth
export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken?: string;
  user: User;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: UserRole;
  agreeToTerms: boolean;
}

// Resume
export interface Resume {
  _id: string;
  user: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: ResumeStatus;
  isDefault: boolean;
  analysis?: ResumeAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeAnalysis {
  overallScore: number;
  atsScore: number;
  grammarScore: number;
  keywordScore: number;
  formattingScore: number;
  skills: {
    found: string[];
    missing: string[];
    recommended: string[];
  };
  suggestions: ResumeSuggestion[];
  improvements: string[];
  keywords: {
    present: string[];
    missing: string[];
  };
  sections: {
    hasObjective: boolean;
    hasExperience: boolean;
    hasEducation: boolean;
    hasSkills: boolean;
    hasProjects: boolean;
    hasCertifications: boolean;
  };
}

export interface ResumeSuggestion {
  _id?: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  impact: string;
}

// Interview
export interface Interview {
  _id: string;
  user: string;
  type: InterviewType;
  role: string;
  difficulty: InterviewDifficulty;
  experience: InterviewExperience;
  duration: number;
  status: InterviewStatus;
  voiceEnabled: boolean;
  language: string;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  feedback?: InterviewFeedback;
  startedAt?: string;
  completedAt?: string;
  totalScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  _id: string;
  questionNumber: number;
  type: QuestionType;
  question: string;
  hints?: string[];
  expectedAnswer?: string;
  timeLimit?: number;
  codeTemplate?: string;
  testCases?: TestCase[];
  difficulty: InterviewDifficulty;
  tags: string[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface InterviewAnswer {
  _id?: string;
  question: string;
  answer: string;
  audioUrl?: string;
  timeTaken: number;
  submittedAt: string;
  feedback?: AnswerFeedback;
}

export interface AnswerFeedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  detailedFeedback: string;
}

export interface InterviewFeedback {
  _id?: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  grammarScore: number;
  vocabularyScore: number;
  clarityScore: number;
  strengths: string[];
  weaknesses: string[];
  improvementPlan: string[];
  summary: string;
  recommendations: string[];
  nextSteps: string[];
}

// Coding
export interface CodingSubmission {
  _id: string;
  user: string;
  problem: CodingProblem;
  language: string;
  code: string;
  status: 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'time_limit' | 'error';
  testResults: TestResult[];
  runtime?: number;
  memory?: number;
  aiReview?: CodeReview;
  createdAt: string;
}

export interface CodingProblem {
  _id: string;
  title: string;
  difficulty: InterviewDifficulty;
  category: string;
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  hints: string[];
  starterCode: Record<string, string>;
  testCases: TestCase[];
  tags: string[];
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestResult {
  testCase: number;
  passed: boolean;
  input: string;
  expected: string;
  actual?: string;
  runtime?: number;
  error?: string;
}

export interface CodeReview {
  score: number;
  timeComplexity: string;
  spaceComplexity: string;
  strengths: string[];
  suggestions: string[];
  optimizations: string[];
}

// Roadmap
export interface Roadmap {
  _id: string;
  user: string;
  targetCompany: string;
  targetRole: string;
  currentSkills: string[];
  generatedAt: string;
  plan: {
    thirtyDays: RoadmapWeek[];
    sixtyDays: RoadmapWeek[];
    ninetyDays: RoadmapWeek[];
  };
}

export interface RoadmapWeek {
  week: number;
  theme: string;
  tasks: RoadmapTask[];
}

export interface RoadmapTask {
  _id?: string;
  title: string;
  description: string;
  type: 'learn' | 'practice' | 'project' | 'read';
  completed: boolean;
  resources?: string[];
  estimatedHours: number;
}

// Achievement
export interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  condition: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  isUnlocked: boolean;
}

// Subscription
export interface Subscription {
  _id: string;
  user: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: string;
  amount: number;
  currency: string;
}

// Notification
export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// Payment
export interface Payment {
  _id: string;
  user: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: 'stripe' | 'razorpay';
  plan: SubscriptionPlan;
  transactionId?: string;
  createdAt: string;
}

// Company
export interface Company {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  industry: string;
  description?: string;
  size?: string;
  headquarters?: string;
  foundedYear?: number;
  difficulty: number;
  interviewRounds: number;
  interviewProcess: InterviewStep[];
  commonQuestions: CompanyQuestion[];
  experiences: InterviewExperience_[];
  tags: string[];
  createdAt: string;
}

export interface InterviewStep {
  step: number;
  title: string;
  description: string;
  duration?: string;
  type: string;
}

export interface CompanyQuestion {
  _id?: string;
  question: string;
  category: string;
  difficulty: InterviewDifficulty;
  frequency: number;
}

export interface InterviewExperience_ {
  _id?: string;
  user: { name: string; avatar?: string };
  role: string;
  result: 'selected' | 'rejected' | 'pending';
  experience: string;
  tips: string[];
  date: string;
  upvotes: number;
  hasUpvoted?: boolean;
}

// Course
export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructor: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  enrolledCount: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  isPremium: boolean;
  createdAt: string;
}

// Leaderboard
export interface LeaderboardEntry {
  rank: number;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  totalInterviews: number;
  avgScore: number;
  streak: number;
  xp: number;
  badges: number;
  isCurrentUser?: boolean;
}

// Dashboard
export interface DashboardStats {
  totalInterviews: number;
  avgScore: number;
  resumeScore: number;
  leaderboardRank: number;
  streak: number;
  xp: number;
  level: number;
  weeklyProgress: WeeklyProgress[];
  recentInterviews: Interview[];
  achievements: Achievement[];
  skillScores: SkillScores;
}

export interface WeeklyProgress {
  date: string;
  interviews: number;
  avgScore: number;
}

export interface SkillScores {
  technical: number;
  communication: number;
  confidence: number;
  grammar: number;
  vocabulary: number;
  clarity: number;
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

// Chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Filter params
export interface InterviewFilters {
  type?: InterviewType;
  status?: InterviewStatus;
  difficulty?: InterviewDifficulty;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
