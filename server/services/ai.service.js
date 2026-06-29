import OpenAI from 'openai';
import logger from '../utils/logger.js';

// Groq is OpenAI-compatible — same SDK, different base URL
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || 'sk-placeholder',
  baseURL: 'https://api.groq.com/openai/v1',
});

const CHAT_MODEL = 'llama-3.3-70b-versatile';
const FAST_MODEL = 'llama-3.1-8b-instant';
const WHISPER_MODEL = 'whisper-large-v3';

/**
 * Generate interview questions for a given role, type, difficulty, and experience level
 */
const generateInterviewQuestions = async (role, type, difficulty, experience, count = 8) => {
  const typeDescriptions = {
    hr: 'HR and general behavioral questions about work style, goals, and culture fit',
    behavioral: 'STAR-method behavioral questions about past experiences and situations',
    technical: 'Technical knowledge questions specific to the role and tech stack',
    coding: 'Algorithm and data structure coding problems',
    'system-design': 'System design and architecture questions for scalable systems',
    custom: 'Mixed interview questions covering various aspects',
  };

  const prompt = `You are a senior technical interviewer at a top tech company. Generate exactly ${count} interview questions for a ${experience}-level ${role} position.

Interview Type: ${typeDescriptions[type] || type}
Difficulty: ${difficulty}
Target Role: ${role}

Return ONLY a valid JSON object with a "questions" array. Each question object must have exactly these fields:
- questionText: string (the full question)
- questionType: "text" | "code" | "system-design"
- difficulty: "easy" | "medium" | "hard"
- topic: string (the primary topic, e.g., "Arrays", "Leadership", "REST APIs")
- tags: string[] (2-4 relevant tags)
- hints: string[] (1-2 subtle hints without giving away the answer)
- expectedAnswer: string (key points or rubric for a good answer, 2-4 sentences)
${type === 'coding' ? '- codeLanguage: "python" | "javascript" | "java" | "cpp"' : ''}

Guidelines:
- For ${difficulty} difficulty, calibrate complexity accordingly
- For coding questions, provide clear problem statements with examples
- For behavioral questions, make them specific and situational
- For technical questions, test deep conceptual understanding
- Mix different sub-topics within the ${role} domain
- Questions should be realistic and commonly asked at top companies`;

  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  try {
    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    const questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
    return questions.slice(0, count).map((q, idx) => ({
      questionText: q.questionText || q.question || `Question ${idx + 1}`,
      questionType: q.questionType || 'text',
      codeLanguage: q.codeLanguage || '',
      difficulty: q.difficulty || difficulty,
      topic: q.topic || 'General',
      tags: q.tags || [],
      hints: q.hints || [],
      expectedAnswer: q.expectedAnswer || '',
      orderIndex: idx,
    }));
  } catch (e) {
    logger.error(`Failed to parse AI questions: ${e.message}`);
    throw new Error('Failed to generate interview questions. Please try again.');
  }
};

/**
 * Evaluate a single answer with AI scoring and feedback
 */
const evaluateAnswer = async (question, answer, type) => {
  if (!answer || answer.trim().length < 5) {
    return {
      score: 0,
      feedback: 'No answer provided.',
      strengths: [],
      improvements: ['Provide a detailed answer to this question.'],
    };
  }

  const prompt = `You are an expert interviewer evaluating a candidate's answer.

Question: "${question.questionText}"
Expected Answer Rubric: "${question.expectedAnswer}"
Candidate's Answer: "${answer}"
Interview Type: ${type}
Question Difficulty: ${question.difficulty}

Evaluate the answer and return ONLY valid JSON with exactly these fields:
{
  "score": <number 0-10>,
  "feedback": "<2-3 sentence specific feedback on this answer>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}

Scoring rubric:
- 9-10: Exceptional, comprehensive, with examples and depth
- 7-8: Good, covers key points with some depth
- 5-6: Adequate, covers basics but lacks depth
- 3-4: Partial, misses key concepts
- 0-2: Poor, incomplete or incorrect

Be specific, constructive, and encouraging.`;

  const response = await groq.chat.completions.create({
    model: FAST_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (e) {
    return { score: 5, feedback: 'Unable to evaluate answer.', strengths: [], improvements: [] };
  }
};

/**
 * Generate comprehensive interview feedback from all Q&A pairs
 */
const generateInterviewFeedback = async (questions, answers, type) => {
  const qa = questions.map((q, i) => ({
    question: q.questionText,
    answer: answers[i]?.answerText || answers[i]?.transcribedText || 'No answer provided',
    score: answers[i]?.score || 0,
  }));

  const avgScore = qa.reduce((sum, q) => sum + (q.score || 0), 0) / (qa.length || 1);

  const prompt = `You are a senior career coach and interview expert. Analyze this complete ${type} interview performance and provide detailed, actionable feedback.

Interview Q&A Summary:
${qa.map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}\nScore: ${q.score}/10`).join('\n\n')}

Average Score: ${avgScore.toFixed(1)}/10

Return ONLY valid JSON with exactly these fields:
{
  "overallScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "confidenceScore": <number 0-100>,
  "grammarScore": <number 0-100>,
  "vocabularyScore": <number 0-100>,
  "clarityScore": <number 0-100>,
  "strengths": ["<3-5 specific strengths observed>"],
  "weaknesses": ["<2-4 areas needing improvement>"],
  "improvements": ["<3-5 actionable steps to improve>"],
  "detailedFeedback": "<3-4 paragraph comprehensive assessment covering performance, communication style, technical depth, and next steps>",
  "radarData": {
    "technical": <0-100>,
    "communication": <0-100>,
    "confidence": <0-100>,
    "grammar": <0-100>,
    "vocabulary": <0-100>,
    "clarity": <0-100>
  },
  "fillerWordCount": <estimated number>,
  "avgSpeakingSpeed": <estimated wpm>,
  "emotionAnalysis": {
    "confident": <0-100>,
    "nervous": <0-100>,
    "enthusiastic": <0-100>
  }
}

Be thorough, specific, and actionable. Reference specific answers in your feedback.`;

  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (e) {
    logger.error(`Failed to parse AI feedback: ${e.message}`);
    return {
      overallScore: Math.round(avgScore * 10),
      technicalScore: 50,
      communicationScore: 50,
      confidenceScore: 50,
      grammarScore: 70,
      vocabularyScore: 60,
      clarityScore: 60,
      strengths: ['Completed the interview'],
      weaknesses: ['Needs more practice'],
      improvements: ['Practice more mock interviews'],
      detailedFeedback: 'Interview analysis complete. Keep practicing to improve your scores.',
      radarData: { technical: 50, communication: 50, confidence: 50, grammar: 70, vocabulary: 60, clarity: 60 },
      fillerWordCount: 0,
      avgSpeakingSpeed: 130,
      emotionAnalysis: { confident: 50, nervous: 30, enthusiastic: 40 },
    };
  }
};

/**
 * Analyze a resume and return comprehensive scoring and suggestions
 */
const analyzeResume = async (text, targetRole = '') => {
  const prompt = `You are a professional resume reviewer and ATS expert with 15+ years of experience in hiring at Fortune 500 companies.

Analyze the following resume text${targetRole ? ` for a ${targetRole} position` : ''}:

---RESUME START---
${text.slice(0, 8000)}
---RESUME END---

Return ONLY valid JSON with exactly these fields:
{
  "atsScore": <number 0-100, ATS compatibility score>,
  "grammarScore": <number 0-100, grammar and language quality>,
  "keywordScore": <number 0-100, relevant keyword density>,
  "overallScore": <number 0-100, weighted overall score>,
  "keywords": ["<top keywords found in resume>"],
  "missingSkills": ["<important skills missing for the role>"],
  "extractedSkills": ["<all technical and soft skills found>"],
  "suggestions": ["<5-8 high-impact improvements to make>"],
  "improvements": ["<3-5 formatting/structure improvements>"],
  "summary": "<2-3 sentence professional assessment of this resume's strengths and positioning>",
  "grammarIssues": [
    {"issue": "<specific issue found>", "suggestion": "<how to fix it>"}
  ],
  "projectSuggestions": ["<2-3 project ideas that would strengthen this resume for the target role>"]
}

ATS Score rubric:
- 85-100: Excellent ATS compatibility, clear formatting, strong keywords
- 70-84: Good, minor issues with formatting or keywords
- 50-69: Average, several issues that might cause ATS rejection
- Below 50: Poor, significant formatting or keyword issues

Be specific and actionable. Reference actual content from the resume.`;

  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (e) {
    logger.error(`Failed to parse resume analysis: ${e.message}`);
    throw new Error('Failed to analyze resume. Please try again.');
  }
};

/**
 * AI career coach — contextual chat with conversation history
 */
const chatWithCoach = async (message, history = [], userProfile = {}) => {
  const systemPrompt = `You are SpeckSpace AI Career Coach — an expert career advisor specializing in software engineering, tech interviews, and career growth. You have deep knowledge of:
- Technical interview preparation (DSA, system design, behavioral)
- Resume building and optimization
- Career transitions and growth strategies
- Negotiation and job search tactics
- Industry trends and in-demand skills

User Profile Context:
- Target Role: ${userProfile.targetRole || 'Software Engineer'}
- Target Company: ${userProfile.targetCompany || 'Top Tech Company'}
- Skills: ${(userProfile.skills || []).join(', ') || 'Not specified'}
- Experience Level: ${userProfile.yearsOfExperience || 0} years

Guidelines:
- Be concise, specific, and actionable
- Use real examples and concrete advice
- Encourage the user while being honest about areas for improvement
- Reference their profile context when relevant
- Keep responses under 300 words unless depth is needed
- Format with bullet points or numbered lists when listing items`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ];

  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 600,
  });

  return response.choices[0].message.content;
};

/**
 * Generate a 30/60/90 day learning roadmap
 */
const generateRoadmap = async (skills, company, role) => {
  const prompt = `You are a technical career mentor. Create a detailed 30/60/90 day preparation roadmap for a candidate targeting the role of ${role} at ${company}.

Current Skills: ${skills.join(', ')}
Target Role: ${role}
Target Company: ${company}

Return ONLY valid JSON with exactly this structure:
{
  "plan30Days": [
    {
      "week": "Week 1",
      "tasks": [
        {
          "title": "<task title>",
          "description": "<what to do and why>",
          "resources": ["<free resource URL or name>", "<book or course name>"]
        }
      ]
    }
  ],
  "plan60Days": [<same structure, weeks 5-8>],
  "plan90Days": [<same structure, weeks 9-12>]
}

Each phase should have exactly 4 weeks with 3-4 tasks per week.

30 Days Focus: Foundations, gap analysis, core concepts
60 Days Focus: Intermediate topics, practice problems, mock interviews
90 Days Focus: Advanced topics, company-specific prep, system design, offer negotiation

Make tasks specific and actionable. Include real resources (LeetCode, Grokking, books, YouTube channels).`;

  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (e) {
    logger.error(`Failed to parse roadmap: ${e.message}`);
    throw new Error('Failed to generate roadmap. Please try again.');
  }
};

/**
 * Transcribe audio using Groq Whisper API
 */
const speechToText = async (audioBuffer, filename = 'audio.webm') => {
  const { toFile } = await import('openai');
  const file = await toFile(audioBuffer, filename, { type: 'audio/webm' });

  const transcription = await groq.audio.transcriptions.create({
    file,
    model: WHISPER_MODEL,
    language: 'en',
    response_format: 'text',
  });

  return typeof transcription === 'string' ? transcription : transcription.text || '';
};

/**
 * TTS — Groq does not support text-to-speech.
 * Returns null; callers should handle gracefully.
 */
const textToSpeech = async (_text, _voice = 'nova') => {
  logger.warn('TTS requested but Groq does not support text-to-speech. Skipping.');
  return null;
};

/**
 * Generate a professional resume from profile data
 */
const generateResumeContent = async (profileData) => {
  const prompt = `You are a professional resume writer. Create a polished, ATS-optimized resume in JSON format.

Profile Data:
${JSON.stringify(profileData, null, 2)}

Return ONLY valid JSON with exactly this structure:
{
  "contactSection": {
    "name": "<full name>",
    "email": "<email>",
    "phone": "<phone>",
    "location": "<location>",
    "linkedin": "<linkedin>",
    "github": "<github>",
    "portfolio": "<portfolio>"
  },
  "summarySection": "<3-4 sentence professional summary tailored for ${profileData.targetRole || 'target role'}>",
  "skillsSection": {
    "technical": ["<skill1>", "<skill2>"],
    "soft": ["<soft skill1>", "<soft skill2>"]
  },
  "experienceSection": [
    {
      "company": "<company>",
      "title": "<job title>",
      "duration": "<start - end>",
      "bullets": ["<achievement 1 with metrics>", "<achievement 2>", "<achievement 3>"]
    }
  ],
  "educationSection": [
    {
      "institution": "<school>",
      "degree": "<degree>",
      "field": "<field>",
      "year": "<graduation year>",
      "gpa": "<if available>"
    }
  ],
  "projectsSection": [
    {
      "name": "<project name>",
      "description": "<2-3 sentence description with technologies used>",
      "link": "<github or live link if available>"
    }
  ]
}`;

  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (e) {
    throw new Error('Failed to generate resume content. Please try again.');
  }
};

export {
  generateInterviewQuestions,
  evaluateAnswer,
  generateInterviewFeedback,
  analyzeResume,
  chatWithCoach,
  generateRoadmap,
  textToSpeech,
  speechToText,
  generateResumeContent,
};
