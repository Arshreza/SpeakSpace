import Company from '../models/Company.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { generateSlug } from '../utils/helpers.js';

// @desc    Get all companies with search/filter
// @route   GET /api/v1/companies
// @access  Public
const getCompanies = asyncHandler(async (req, res, next) => {
  const { search, industry, difficulty, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  if (industry) filter.industry = { $regex: industry, $options: 'i' };
  if (difficulty) filter.difficultyRating = parseInt(difficulty, 10);

  const [companies, total] = await Promise.all([
    Company.find(filter)
      .select('-frequentlyAskedQuestions -interviewExperiences')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    Company.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: companies.length,
    total,
    companies,
  });
});

// @desc    Get single company by slug
// @route   GET /api/v1/companies/:slug
// @access  Public
const getCompany = asyncHandler(async (req, res, next) => {
  const company = await Company.findOne({ slug: req.params.slug })
    .populate('interviewExperiences.user', 'name avatar');

  if (!company) {
    return next(new AppError('Company not found.', 404));
  }

  res.status(200).json({ success: true, company });
});

// @desc    Add interview experience for a company
// @route   POST /api/v1/companies/:slug/experience
// @access  Private
const addInterviewExperience = asyncHandler(async (req, res, next) => {
  const { title, content, result, date } = req.body;

  const company = await Company.findOne({ slug: req.params.slug });
  if (!company) {
    return next(new AppError('Company not found.', 404));
  }

  company.interviewExperiences.push({
    user: req.user._id,
    title,
    content,
    result: result || 'pending',
    date: date || new Date(),
    upvotes: 0,
  });

  await company.save();

  res.status(201).json({
    success: true,
    message: 'Interview experience added successfully.',
    company,
  });
});

// @desc    Upvote an interview experience
// @route   POST /api/v1/companies/:slug/experience/:expId/upvote
// @access  Private
const upvoteExperience = asyncHandler(async (req, res, next) => {
  const company = await Company.findOne({ slug: req.params.slug });
  if (!company) {
    return next(new AppError('Company not found.', 404));
  }

  const experience = company.interviewExperiences.id(req.params.expId);
  if (!experience) {
    return next(new AppError('Experience not found.', 404));
  }

  const userId = req.user._id.toString();
  const alreadyUpvoted = experience.upvotedBy?.some((id) => id.toString() === userId);

  if (alreadyUpvoted) {
    experience.upvotes = Math.max(0, experience.upvotes - 1);
    experience.upvotedBy = experience.upvotedBy.filter((id) => id.toString() !== userId);
  } else {
    experience.upvotes += 1;
    if (!experience.upvotedBy) experience.upvotedBy = [];
    experience.upvotedBy.push(req.user._id);
  }

  await company.save();

  res.status(200).json({
    success: true,
    message: alreadyUpvoted ? 'Upvote removed.' : 'Experience upvoted.',
    upvotes: experience.upvotes,
    upvoted: !alreadyUpvoted,
  });
});

// @desc    Create a company (admin)
// @route   POST /api/v1/companies
// @access  Admin
const createCompany = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const existing = await Company.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existing) {
    return next(new AppError('A company with this name already exists.', 400));
  }

  const company = await Company.create({
    ...req.body,
    slug: generateSlug(name),
  });

  res.status(201).json({ success: true, company });
});

// @desc    Update a company (admin)
// @route   PUT /api/v1/companies/:id
// @access  Admin
const updateCompany = asyncHandler(async (req, res, next) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!company) {
    return next(new AppError('Company not found.', 404));
  }

  res.status(200).json({ success: true, company });
});

// @desc    Seed major tech companies (admin)
// @route   POST /api/v1/companies/seed
// @access  Admin
const seedCompanies = asyncHandler(async (req, res, next) => {
  const companies = [
    {
      name: 'Google',
      slug: 'google',
      website: 'https://careers.google.com',
      description: 'Google LLC is an American multinational technology company specializing in Internet-related services and products, including search, cloud computing, software, and hardware.',
      industry: 'Technology',
      size: 'enterprise',
      location: 'Mountain View, CA, USA',
      difficultyRating: 5,
      tags: ['FAANG', 'AI', 'Cloud', 'Search', 'Advertising'],
      interviewProcess: [
        'Online Application / Referral',
        'Recruiter Phone Screen (30 min)',
        'Technical Phone Screen - 1-2 rounds (45 min each)',
        'Onsite / Virtual Onsite - 4-5 rounds',
        'Hiring Committee Review',
        'Team Matching',
        'Offer',
      ],
      interviewRounds: [
        { name: 'Recruiter Screen', description: 'Initial HR screen about background and motivation.', tips: 'Research Googleyness. Be clear about your interest in Google specifically.' },
        { name: 'Technical Phone Screen', description: 'Data structures and algorithms on a shared Google Doc or similar.', tips: 'Practice LeetCode medium to hard. Think out loud. Always analyze time/space complexity.' },
        { name: 'Coding Round 1 & 2', description: 'Algorithm and data structure problems. Expect 1-2 questions per round.', tips: 'Clarify requirements before coding. Test your code with examples. Optimize iteratively.' },
        { name: 'System Design', description: 'Design scalable systems like YouTube, Gmail, or Maps.', tips: 'Use the STAR framework. Cover load balancing, caching, database sharding, and CDN.' },
        { name: 'Behavioral / Googliness', description: 'Leadership, teamwork, and cultural fit.', tips: 'Use STAR method. Prepare stories about disagreements, leadership, and learning from failure.' },
      ],
      frequentlyAskedQuestions: [
        { question: 'Two Sum', category: 'Arrays', difficulty: 'easy', answer: 'Use a HashMap to store complements. O(n) time, O(n) space.' },
        { question: 'LRU Cache', category: 'Design', difficulty: 'medium', answer: 'Use a combination of HashMap and Doubly Linked List.' },
        { question: 'Design Google Search', category: 'System Design', difficulty: 'hard', answer: 'Cover web crawling, indexing, ranking (PageRank), query processing, and caching.' },
        { question: 'Word Break', category: 'Dynamic Programming', difficulty: 'medium', answer: 'Use DP array of size n+1 where dp[i] = true if s[0..i-1] can be segmented.' },
        { question: 'Tell me about a time you had a conflict with a teammate', category: 'Behavioral', difficulty: 'medium', answer: 'Use STAR method. Focus on resolution and what you learned.' },
      ],
      preparationTips: [
        'Solve at least 150 LeetCode problems, focusing on medium difficulty',
        'Master Big-O analysis and be able to discuss it naturally',
        'Practice system design with "Designing Data-Intensive Applications" book',
        'Prepare 5-7 STAR behavioral stories covering leadership, conflict, failure, and learning',
        'Review Google\'s 8 qualities they look for (General Cognitive Ability, Leadership, Googliness, Role-Related Knowledge)',
      ],
    },
    {
      name: 'Amazon',
      slug: 'amazon',
      website: 'https://www.amazon.jobs',
      description: 'Amazon.com is an American multinational technology company focusing on e-commerce, cloud computing (AWS), digital streaming, and artificial intelligence.',
      industry: 'Technology / E-commerce',
      size: 'enterprise',
      location: 'Seattle, WA, USA',
      difficultyRating: 4,
      tags: ['FAANG', 'AWS', 'E-commerce', 'Leadership Principles'],
      interviewProcess: [
        'Online Application',
        'Online Assessment (coding test + work style survey)',
        'Phone Screen with hiring manager',
        'Virtual Onsite - 4-5 loops',
        'Bar Raiser Round',
        'Offer',
      ],
      interviewRounds: [
        { name: 'Online Assessment', description: 'Timed coding test (2 problems in 90 min) + work simulation.', tips: 'Practice timed LeetCode sessions. Focus on correctness first, then optimize.' },
        { name: 'Hiring Manager Screen', description: 'Behavioral questions based on Leadership Principles + 1 coding problem.', tips: 'Know all 16 Leadership Principles. Prepare STAR stories for each.' },
        { name: 'Coding Loops', description: '1-2 coding problems per round, often with LP questions.', tips: 'Every round has a behavioral component. Always anchor answers to Leadership Principles.' },
        { name: 'Bar Raiser', description: 'Independent assessor ensuring the hire raises the bar for the team.', tips: 'This person is looking for excellence. Bring your A-game on both technical and behavioral.' },
        { name: 'System Design', description: 'Design Amazon-scale systems like the shopping cart, recommendation engine, or delivery system.', tips: 'Think in terms of AWS services. Cover scalability, availability, and cost-efficiency.' },
      ],
      frequentlyAskedQuestions: [
        { question: 'Tell me about a time you failed', category: 'Behavioral', difficulty: 'medium', answer: 'Use STAR. Show ownership, learning, and how you improved. Avoid shifting blame.' },
        { question: 'Design Amazon\'s shopping cart', category: 'System Design', difficulty: 'hard', answer: 'Cover user sessions, inventory management, pricing service, and order processing.' },
        { question: 'Number of Islands', category: 'Graphs', difficulty: 'medium', answer: 'Use DFS/BFS to explore connected components. O(m*n) time and space.' },
        { question: 'Tell me about a time you disagreed with your manager', category: 'Behavioral', difficulty: 'medium', answer: 'Show you can disagree constructively, back your position with data, and commit to the decision.' },
      ],
      preparationTips: [
        'Memorize and internalize all 16 Amazon Leadership Principles',
        'Prepare 2-3 STAR stories per Leadership Principle',
        'Practice writing clean, working code quickly under time pressure',
        'Study AWS services for system design questions',
        'Amazon values frugality — discuss cost-efficiency in design discussions',
      ],
    },
    {
      name: 'Microsoft',
      slug: 'microsoft',
      website: 'https://careers.microsoft.com',
      description: 'Microsoft Corporation is an American multinational technology corporation producing computer software, consumer electronics, personal computers, and related services.',
      industry: 'Technology',
      size: 'enterprise',
      location: 'Redmond, WA, USA',
      difficultyRating: 4,
      tags: ['FAANG', 'Cloud', 'Azure', 'Enterprise', 'Gaming'],
      interviewProcess: [
        'Online Application / Referral',
        'Recruiter Screen',
        'Technical Phone Screen',
        'Onsite / Virtual Loop (4-5 rounds)',
        'As Appropriate (AA) review',
        'Offer',
      ],
      interviewRounds: [
        { name: 'Recruiter Screen', description: 'Background, motivation, and team matching conversation.', tips: 'Research the specific team you applied for. Mention specific Microsoft products you use.' },
        { name: 'Technical Screen', description: 'Coding problem + discussion of past projects.', tips: 'Practice LeetCode easy-medium. Be ready to discuss your resume in depth.' },
        { name: 'Coding Rounds', description: '1-2 problems per round, emphasis on correctness and problem-solving approach.', tips: 'Think out loud. Ask clarifying questions. Microsoft values collaboration.' },
        { name: 'Design Round', description: 'Software design or system design depending on level.', tips: 'For SDE2+, expect distributed system design. For SDE1, may be OOP design.' },
        { name: 'Behavioral / Culture', description: 'Questions around growth mindset, collaboration, and impact.', tips: 'Microsoft values Growth Mindset (Satya Nadella\'s philosophy). Show curiosity and learning.' },
      ],
      frequentlyAskedQuestions: [
        { question: 'Reverse a Linked List', category: 'Linked Lists', difficulty: 'easy', answer: 'Iterative: use prev/curr/next pointers. Recursive: reverse rest then fix head pointer.' },
        { question: 'Design a URL Shortener (like Bitly)', category: 'System Design', difficulty: 'medium', answer: 'Hash function, key-value store, redirection service, analytics. Cover availability and caching.' },
        { question: 'Describe your greatest professional achievement', category: 'Behavioral', difficulty: 'medium', answer: 'Use STAR. Quantify impact. Show initiative and ownership.' },
        { question: 'Valid Parentheses', category: 'Stack', difficulty: 'easy', answer: 'Use a stack. Push open brackets, pop and verify on closing brackets.' },
      ],
      preparationTips: [
        'Study Growth Mindset — Microsoft\'s core culture shift under Satya Nadella',
        'Practice LeetCode easy to medium problems',
        'Prepare to discuss your past projects in detail with metrics',
        'Review OOP design patterns for non-senior positions',
        'Know Azure services for cloud-related system design',
      ],
    },
    {
      name: 'Meta',
      slug: 'meta',
      website: 'https://www.metacareers.com',
      description: 'Meta Platforms, Inc. (formerly Facebook) develops social networking technologies and services including Facebook, Instagram, WhatsApp, and Oculus VR.',
      industry: 'Technology / Social Media',
      size: 'enterprise',
      location: 'Menlo Park, CA, USA',
      difficultyRating: 5,
      tags: ['FAANG', 'Social Media', 'VR', 'AI', 'Open Source'],
      interviewProcess: [
        'Online Application / Referral',
        'Recruiter Phone Screen',
        'Technical Screen (45 min)',
        'Onsite / Virtual Loop (4-5 rounds)',
        'Offer',
      ],
      interviewRounds: [
        { name: 'Coding Round 1 & 2', description: '2 LeetCode-style problems in 45 minutes each.', tips: 'Meta expects you to solve 2 problems per session. Speed matters. Practice timed sessions.' },
        { name: 'System Design', description: 'Design social media features at massive scale.', tips: 'Focus on news feed, notifications, real-time messaging, and content delivery.' },
        { name: 'Behavioral', description: 'Questions about impact, conflict, leadership, and Meta\'s values.', tips: 'Meta values moving fast. Show bias for action and ownership in your stories.' },
        { name: 'Architecture', description: 'For senior roles, deep system architecture discussion.', tips: 'Discuss sharding strategies, consistency models, and fault tolerance.' },
      ],
      frequentlyAskedQuestions: [
        { question: 'Design Facebook\'s News Feed', category: 'System Design', difficulty: 'hard', answer: 'Fanout on write vs. read, ranking algorithm, caching with Redis, real-time updates with WebSockets.' },
        { question: 'Trapping Rain Water', category: 'Arrays', difficulty: 'hard', answer: 'Two-pointer approach: track left-max and right-max. O(n) time, O(1) space.' },
        { question: 'Clone Graph', category: 'Graphs', difficulty: 'medium', answer: 'DFS/BFS with a HashMap mapping old nodes to new cloned nodes.' },
        { question: 'Tell me about a time you took initiative', category: 'Behavioral', difficulty: 'medium', answer: 'Show ownership and bias for action. Quantify the impact of your initiative.' },
      ],
      preparationTips: [
        'Expect 2 coding problems per interview session — practice speed',
        'Meta values extreme ownership and moving fast — show this in behavioral answers',
        'Study distributed systems at scale (10B+ users)',
        'Master graph algorithms — Meta loves graph problems',
        'Know the difference between SQL and NoSQL and when to use each',
      ],
    },
    {
      name: 'Netflix',
      slug: 'netflix',
      website: 'https://jobs.netflix.com',
      description: 'Netflix, Inc. is an American subscription streaming service and production company known for its culture of freedom and responsibility.',
      industry: 'Technology / Entertainment',
      size: 'large',
      location: 'Los Gatos, CA, USA',
      difficultyRating: 5,
      tags: ['FAANG', 'Streaming', 'Microservices', 'Culture', 'Senior'],
      interviewProcess: [
        'Recruiter Screen',
        'Hiring Manager Call',
        'Technical Rounds (3-4)',
        'Reference Checks',
        'Offer',
      ],
      interviewRounds: [
        { name: 'Hiring Manager Screen', description: 'Deep discussion of experience, culture fit, and expectations.', tips: 'Read the Netflix Culture Memo (no-rules rules). Understand their high-performance culture.' },
        { name: 'Technical Deep Dive', description: 'Discussion of past systems and architecture decisions.', tips: 'Be ready to defend your design choices. Netflix expects senior engineers to make independent decisions.' },
        { name: 'System Design', description: 'Design Netflix-scale streaming, recommendation, or content delivery systems.', tips: 'Cover CDN, adaptive bitrate streaming, recommendation ML pipeline, and A/B testing.' },
        { name: 'Behavioral / Culture Fit', description: 'Deep questions around ownership, impact, and judgment.', tips: 'Netflix cares deeply about self-awareness and judgment. Be honest about past mistakes and learnings.' },
      ],
      frequentlyAskedQuestions: [
        { question: 'Design Netflix\'s video streaming system', category: 'System Design', difficulty: 'hard', answer: 'CDN with edge servers, adaptive bitrate encoding, content distribution, user session management.' },
        { question: 'Tell me about your most impactful project', category: 'Behavioral', difficulty: 'hard', answer: 'Be specific with metrics. Netflix expects significant individual impact.' },
        { question: 'Design a recommendation system', category: 'System Design', difficulty: 'hard', answer: 'Collaborative filtering, content-based filtering, hybrid approach, A/B testing framework.' },
      ],
      preparationTips: [
        'Read the Netflix Culture Memo (the original and the "No Rules Rules" book)',
        'Netflix primarily hires senior engineers — be ready to discuss complex systems',
        'Emphasize impact with quantitative metrics in all your stories',
        'Study microservices architecture and resilience patterns (Chaos Engineering)',
        'Netflix pays top of market — know your worth and negotiate confidently',
      ],
    },
    {
      name: 'Adobe',
      slug: 'adobe',
      website: 'https://www.adobe.com/careers',
      description: 'Adobe Inc. is an American multinational computer software company known for its multimedia and creativity software products, cloud services, and document management tools.',
      industry: 'Technology / Software',
      size: 'enterprise',
      location: 'San Jose, CA, USA',
      difficultyRating: 3,
      tags: ['Creative', 'Cloud', 'SaaS', 'AI', 'Design'],
      interviewProcess: [
        'Online Application',
        'HR Screen',
        'Technical Screen (coding + DSA)',
        'Onsite / Virtual Rounds (3-4)',
        'Offer',
      ],
      interviewRounds: [
        { name: 'HR Screen', description: 'Background, availability, and basic motivation.', tips: 'Know Adobe\'s product suite. Mention specific products you use or find interesting.' },
        { name: 'Technical Screen', description: 'DSA problems (medium difficulty) + discussion of background.', tips: 'Focus on arrays, strings, trees, and graphs. Adobe likes medium LeetCode problems.' },
        { name: 'Coding Rounds', description: 'Coding problems with discussion of approach and testing.', tips: 'Write clean, well-commented code. Test your solutions with edge cases.' },
        { name: 'Design Round', description: 'Low-level design or system design based on role.', tips: 'For frontend, expect component design. For backend, expect API and service design.' },
      ],
      frequentlyAskedQuestions: [
        { question: 'Binary Search Tree validation', category: 'Trees', difficulty: 'medium', answer: 'Pass min/max bounds through recursion to validate BST property.' },
        { question: 'Merge K sorted lists', category: 'Heap', difficulty: 'hard', answer: 'Use a min-heap to always extract the smallest element. O(N log k) time.' },
        { question: 'Why Adobe?', category: 'Behavioral', difficulty: 'easy', answer: 'Reference specific products, the creative industry impact, and their digital experience cloud.' },
      ],
      preparationTips: [
        'Adobe values clean, production-quality code',
        'Study OOP design patterns — Adobe products are built on complex architectures',
        'Research Adobe\'s AI/ML initiatives (Adobe Sensei)',
        'Practice explaining technical concepts clearly — communication is valued',
        'Know Adobe Experience Cloud products if applying to that division',
      ],
    },
    {
      name: 'Uber',
      slug: 'uber',
      website: 'https://www.uber.com/careers',
      description: 'Uber Technologies, Inc. is an American technology company with a global transportation platform offering ride-hailing, food delivery (Uber Eats), freight, and more.',
      industry: 'Technology / Transportation',
      size: 'enterprise',
      location: 'San Francisco, CA, USA',
      difficultyRating: 4,
      tags: ['Ride-sharing', 'Real-time', 'Maps', 'Microservices', 'Distributed Systems'],
      interviewProcess: [
        'Recruiter Screen',
        'Take-home Assessment or Technical Screen',
        'Technical Rounds (3-4)',
        'Offer',
      ],
      interviewRounds: [
        { name: 'Technical Screen', description: 'DSA + system design introduction.', tips: 'Uber loves problems involving maps, routing, and real-time data.' },
        { name: 'Coding Rounds', description: 'Algorithm problems often with real-world Uber context.', tips: 'Be ready for geo-spatial problems, time-series data, and graph traversal.' },
        { name: 'System Design', description: 'Design Uber-like systems: dispatch, surge pricing, ETA estimation.', tips: 'Study real-time systems, geospatial indexing (H3, Geohash), and event streaming (Kafka).' },
        { name: 'Behavioral', description: 'Past impact, failure handling, and teamwork.', tips: 'Uber values "moving fast and being bold." Show examples of taking calculated risks.' },
      ],
      frequentlyAskedQuestions: [
        { question: 'Design Uber\'s dispatch system', category: 'System Design', difficulty: 'hard', answer: 'Geospatial indexing, real-time driver matching, websockets for location updates, surge pricing.' },
        { question: 'Find the nearest driver', category: 'Algorithms', difficulty: 'medium', answer: 'Geohash or QuadTree for spatial indexing, then range queries.' },
        { question: 'Design rate limiting', category: 'System Design', difficulty: 'medium', answer: 'Token bucket or sliding window algorithm. Redis for distributed rate limiting.' },
      ],
      preparationTips: [
        'Study geospatial data structures and algorithms',
        'Learn about real-time systems and event streaming (Apache Kafka)',
        'Understand Uber\'s tech stack: Go, Python, Node.js, React Native',
        'Practice designing systems for high availability and low latency',
        'Read the Uber Engineering Blog for insights into their technical decisions',
      ],
    },
    {
      name: 'Apple',
      slug: 'apple',
      website: 'https://www.apple.com/careers',
      description: 'Apple Inc. is an American multinational technology company known for iPhone, Mac computers, iPad, Apple Watch, and a vast ecosystem of hardware and software products.',
      industry: 'Technology / Hardware',
      size: 'enterprise',
      location: 'Cupertino, CA, USA',
      difficultyRating: 4,
      tags: ['FAANG', 'Hardware', 'iOS', 'macOS', 'Privacy', 'Design'],
      interviewProcess: [
        'Online Application / Referral',
        'Recruiter Phone Screen',
        'Technical Phone Screen',
        'Onsite / Virtual Loops (5-6 rounds)',
        'Offer',
      ],
      interviewRounds: [
        { name: 'Recruiter Screen', description: 'Background, motivation, and fit with Apple\'s culture.', tips: 'Emphasize attention to detail and passion for Apple products. Research the specific team.' },
        { name: 'Technical Screen', description: 'DSA or relevant domain-specific questions.', tips: 'For iOS roles, expect Swift/ObjC questions. For backend, expect systems and DSA.' },
        { name: 'Coding Rounds', description: 'Algorithm problems + deep dive into past projects.', tips: 'Apple values extreme quality. Write clean, tested, production-ready code.' },
        { name: 'Design Round', description: 'System design or architecture discussion.', tips: 'Apple cares deeply about privacy by design. Incorporate privacy considerations.' },
        { name: 'Manager / Director Round', description: 'Strategic discussion about role, team, and impact.', tips: 'Show long-term thinking and how you can contribute to Apple\'s vision.' },
      ],
      frequentlyAskedQuestions: [
        { question: 'Implement a thread-safe singleton', category: 'OOP', difficulty: 'medium', answer: 'Use double-checked locking with volatile, or use enum singleton in Java.' },
        { question: 'Design an offline-first iOS app', category: 'Mobile Design', difficulty: 'hard', answer: 'Core Data for local storage, sync queue, conflict resolution, background sync.' },
        { question: 'Find the kth largest element', category: 'Heap', difficulty: 'medium', answer: 'Use a min-heap of size k. O(n log k) time.' },
      ],
      preparationTips: [
        'Use and deeply understand Apple products before interviewing',
        'Apple values design and quality above all — show this in your work',
        'Privacy is a core Apple value — incorporate it into your system designs',
        'Interview process is long (3-6 months) — be patient',
        'For iOS roles, master Swift, UIKit/SwiftUI, and Core Data',
      ],
    },
    {
      name: 'Oracle',
      slug: 'oracle',
      website: 'https://www.oracle.com/corporate/careers',
      description: 'Oracle Corporation is an American multinational computer technology company offering database software and technology, cloud engineered systems, and enterprise software products.',
      industry: 'Technology / Enterprise Software',
      size: 'enterprise',
      location: 'Austin, TX, USA',
      difficultyRating: 3,
      tags: ['Database', 'Cloud', 'Enterprise', 'Java', 'SQL'],
      interviewProcess: [
        'Online Application',
        'HR Screen',
        'Technical Screen (2-3 rounds)',
        'Offer',
      ],
      interviewRounds: [
        { name: 'HR Screen', description: 'Background verification and motivation.', tips: 'Oracle values experience with enterprise systems. Highlight any database or cloud experience.' },
        { name: 'Technical Round 1', description: 'DSA and Java/SQL fundamentals.', tips: 'Oracle heavily uses Java. Know Java Collections, concurrency, and JVM internals.' },
        { name: 'Technical Round 2', description: 'System design and database design.', tips: 'Know SQL optimization, indexing, and normalization deeply. Oracle is a database company.' },
        { name: 'Managerial Round', description: 'Project discussion and culture fit.', tips: 'Oracle cares about stability and long-term commitment.' },
      ],
      frequentlyAskedQuestions: [
        { question: 'Explain database normalization', category: 'Database', difficulty: 'medium', answer: '1NF, 2NF, 3NF explained with examples. Trade-offs between normalization and performance.' },
        { question: 'Implement a HashMap from scratch', category: 'Data Structures', difficulty: 'medium', answer: 'Array of linked lists, hash function, load factor, rehashing strategy.' },
        { question: 'SQL: Find the second highest salary', category: 'SQL', difficulty: 'easy', answer: 'SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)' },
      ],
      preparationTips: [
        'Deep Java knowledge is critical for Oracle backend roles',
        'Know SQL and relational databases thoroughly',
        'Study Oracle Cloud Infrastructure (OCI) services',
        'Oracle values stability — prepare examples of long-term project contributions',
        'Understand ACID properties and distributed transaction management',
      ],
    },
    {
      name: 'Flipkart',
      slug: 'flipkart',
      website: 'https://www.flipkartcareers.com',
      description: 'Flipkart is an Indian e-commerce company headquartered in Bangalore, India, and a subsidiary of Walmart. It is one of India\'s largest e-commerce platforms.',
      industry: 'Technology / E-commerce',
      size: 'enterprise',
      location: 'Bangalore, India',
      difficultyRating: 4,
      tags: ['E-commerce', 'India', 'Walmart', 'Microservices', 'Java'],
      interviewProcess: [
        'Online Coding Test',
        'Technical Round 1 (DSA)',
        'Technical Round 2 (DSA + LLD)',
        'Technical Round 3 (HLD / System Design)',
        'HR / Managerial Round',
        'Offer',
      ],
      interviewRounds: [
        { name: 'Online Test', description: '3-4 DSA problems in 90-120 minutes.', tips: 'Solve at least 200 LeetCode problems before attempting. Flipkart expects fast, optimal solutions.' },
        { name: 'Technical Round 1', description: 'DSA problems with runtime discussion.', tips: 'Master arrays, trees, graphs, and dynamic programming. Explain complexity clearly.' },
        { name: 'Low Level Design', description: 'Design a system like parking lot, elevator, or chess game using OOP.', tips: 'Use SOLID principles. Practice designing 5-6 LLD problems.' },
        { name: 'High Level Design', description: 'Design e-commerce features at Flipkart scale.', tips: 'Focus on search, cart, order management, and product catalog design.' },
        { name: 'HR Round', description: 'Career goals, compensation, and culture fit.', tips: 'Be clear about your expectations and long-term goals.' },
      ],
      frequentlyAskedQuestions: [
        { question: 'Design a product search system', category: 'System Design', difficulty: 'hard', answer: 'Elasticsearch for full-text search, filters using faceted search, caching popular queries, spell correction.' },
        { question: 'Serialize and deserialize a binary tree', category: 'Trees', difficulty: 'medium', answer: 'BFS with level-order traversal, use null markers for missing nodes.' },
        { question: 'Design a flash sale system', category: 'System Design', difficulty: 'hard', answer: 'Inventory reservation, distributed locking with Redis, queue for orders, graceful degradation.' },
        { question: 'Design an LRU Cache', category: 'Design', difficulty: 'medium', answer: 'HashMap + Doubly Linked List. O(1) get and put operations.' },
      ],
      preparationTips: [
        'Low Level Design (LLD) is heavily tested — practice 10+ LLD problems',
        'High Level Design covering Flipkart-specific problems like flash sales and search',
        'Java is the primary language at Flipkart backend',
        'Study Flipkart\'s technology blog for architectural insights',
        'DSA is non-negotiable — solve problems daily for 3+ months',
      ],
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const companyData of companies) {
    const exists = await Company.findOne({ slug: companyData.slug });
    if (!exists) {
      await Company.create({ ...companyData, isVerified: true });
      created++;
    } else {
      skipped++;
    }
  }

  res.status(200).json({
    success: true,
    message: `Seed completed. ${created} companies created, ${skipped} already existed.`,
    created,
    skipped,
  });
});

export {
  getCompanies,
  getCompany,
  addInterviewExperience,
  upvoteExperience,
  createCompany,
  updateCompany,
  seedCompanies,
};
