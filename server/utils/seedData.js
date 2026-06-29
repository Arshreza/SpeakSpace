import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
dotenv.config()

import User from '../models/User.js'
import Profile from '../models/Profile.js'
import Company from '../models/Company.js'
import Achievement from '../models/Achievement.js'
import Subscription from '../models/Subscription.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/speckspace'

// Company size must match the enum: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
const companies = [
  {
    name: 'Google', slug: 'google',
    website: 'https://careers.google.com',
    description: 'Google LLC is an American multinational technology company focusing on search engine technology, online advertising, cloud computing, and quantum computing.',
    industry: 'Technology', size: 'enterprise', location: 'Mountain View, CA',
    difficultyRating: 5,
    interviewProcess: ['Online Application', 'Resume Screening', 'Recruiter Phone Screen', 'Technical Phone Screen (1-2)', 'Onsite Interviews (4-5)', 'Hiring Committee Review', 'Offer'],
    interviewRounds: [
      { name: 'Recruiter Screen', description: 'Initial 30-min call discussing background and experience', tips: 'Prepare your story, know why you want to join Google' },
      { name: 'Technical Phone Screen', description: 'LeetCode-style coding problems on Google Docs', tips: 'Practice on plain text editor, no autocomplete. Think aloud always.' },
      { name: 'Onsite - Coding (x2)', description: '45-min each, 1-2 medium/hard algorithms problems', tips: 'Write clean code, test edge cases, discuss trade-offs' },
      { name: 'Onsite - System Design', description: 'Design a large-scale distributed system', tips: 'Clarify requirements, start with high-level, then deep dive components' },
      { name: 'Onsite - Behavioral (Googleyness)', description: 'Culture fit and leadership questions', tips: 'Use STAR format, show collaboration and impact' }
    ],
    frequentlyAskedQuestions: [
      { question: 'Find the two numbers in an array that add up to a target', category: 'Arrays', difficulty: 'easy', answer: 'Use a hash map to store complements as you iterate through the array. O(n) time, O(n) space.' },
      { question: 'Design YouTube', category: 'System Design', difficulty: 'hard', answer: 'Cover: CDN for video delivery, transcoding pipeline, metadata storage with Bigtable/Spanner, recommendation engine, comment system.' },
      { question: 'Tell me about a time you disagreed with your manager', category: 'Behavioral', difficulty: 'medium', answer: 'Use STAR. Focus on respectful disagreement, data-driven approach, and constructive resolution.' },
      { question: 'LRU Cache implementation', category: 'Data Structures', difficulty: 'medium', answer: 'Use doubly linked list + hash map. O(1) get and put operations.' },
      { question: 'Serialize and deserialize a binary tree', category: 'Trees', difficulty: 'hard', answer: 'BFS or pre-order DFS with null markers for serialization. Reverse process for deserialization.' }
    ],
    preparationTips: ['Master DSA fundamentals (Arrays, Trees, Graphs, DP)', 'Practice 150+ LeetCode problems (medium/hard)', 'Study system design with Designing Data-Intensive Applications', 'Prepare 5+ STAR stories', 'Practice Google coding style in plain text editors'],
    tags: ['faang', 'tech', 'software-engineering', 'silicon-valley'],
    isVerified: true
  },
  {
    name: 'Amazon', slug: 'amazon',
    website: 'https://amazon.jobs',
    description: "Amazon.com Inc. is a multinational technology company focusing on e-commerce, cloud computing (AWS), digital streaming, and artificial intelligence.",
    industry: 'Technology / E-commerce', size: 'enterprise', location: 'Seattle, WA',
    difficultyRating: 4,
    interviewProcess: ['Online Application', 'OA (Online Assessment) - 2 coding + work simulation', 'Phone Screen', 'Onsite Loop (4-6 interviews)', 'Bar Raiser Interview', 'Offer'],
    interviewRounds: [
      { name: 'Online Assessment', description: '2 coding problems (90 min) + work simulation or work style assessment', tips: 'Practice medium LeetCode. The work style test checks Amazon LP alignment.' },
      { name: 'Phone Screen', description: '1 coding question + behavioral questions on LP', tips: 'Every interview starts with behavioral. Prepare LP stories first.' },
      { name: 'Onsite Loop', description: '4-6 rounds, each 1 hour: coding + behavioral tied to LPs', tips: 'Each interviewer owns 1-2 LPs. Prepare 15+ different STAR stories.' },
      { name: 'Bar Raiser', description: 'Senior person ensures hiring bar is maintained', tips: 'The Bar Raiser can veto. Show "Raise the Bar" mentality in your answers.' }
    ],
    frequentlyAskedQuestions: [
      { question: 'Tell me about a time you took ownership of a failing project', category: 'Leadership Principles', difficulty: 'medium', answer: 'Address: Ownership LP. Show you took initiative without being asked, fixed the root cause, communicated proactively.' },
      { question: 'Word Break Problem (DP)', category: 'Dynamic Programming', difficulty: 'medium', answer: 'dp[i] = true if s[0..i] can be segmented. dp[i] = any(dp[j] and s[j..i] in wordDict).' },
      { question: 'Design Amazon Prime delivery system', category: 'System Design', difficulty: 'hard', answer: 'Discuss: order management, inventory, routing optimization, real-time tracking, notification system, warehouse management.' },
      { question: 'Describe a time you delivered under tight deadline', category: 'Leadership Principles', difficulty: 'medium', answer: 'Address: Bias for Action LP + Deliver Results. Quantify the impact and the constraints you overcame.' }
    ],
    preparationTips: ['Master all 16 Amazon Leadership Principles', 'Prepare 2+ STAR stories per Leadership Principle', 'Practice medium LeetCode (especially graphs, DP, trees)', 'Study Amazon-scale system design (SQS, S3, DynamoDB patterns)'],
    tags: ['faang', 'tech', 'aws', 'e-commerce', 'leadership-principles'],
    isVerified: true
  },
  {
    name: 'Microsoft', slug: 'microsoft',
    website: 'https://careers.microsoft.com',
    description: 'Microsoft Corporation is a multinational technology corporation producing computer software, consumer electronics, and related services.',
    industry: 'Technology', size: 'enterprise', location: 'Redmond, WA',
    difficultyRating: 4,
    interviewProcess: ['Online Application', 'Recruiter Screen', 'Online Assessment', 'Phone Screen', 'Onsite (4 rounds)', 'As-Appropriate Interview (optional)', 'Offer'],
    interviewRounds: [
      { name: 'Phone Screen', description: '45-60 min, 1-2 coding problems', tips: 'Microsoft values clean, working code over clever tricks. Test your code.' },
      { name: 'Onsite Coding (x2)', description: 'Medium difficulty problems, emphasis on code quality', tips: 'Discuss approach before coding, ask clarifying questions, test with examples.' },
      { name: 'Onsite Design', description: 'OOP design or system design depending on role/level', tips: 'For SDE2+: distributed systems. For SDE1: OOP design patterns.' },
      { name: 'Behavioral / Culture', description: 'Growth mindset and collaboration questions', tips: 'Microsoft values Growth Mindset. Show learning from failures.' }
    ],
    frequentlyAskedQuestions: [
      { question: 'Clone a linked list with random pointers', category: 'Linked Lists', difficulty: 'medium', answer: 'Two-pass with hash map, or interleave approach without extra space.' },
      { question: 'Design Microsoft Teams', category: 'System Design', difficulty: 'hard', answer: 'Real-time messaging (WebSockets), video conferencing (WebRTC), presence system, notification service, file storage (SharePoint/OneDrive).' },
      { question: 'Tell me about a time you failed and what you learned', category: 'Behavioral', difficulty: 'medium', answer: 'Show genuine reflection, specific actions taken to improve, and growth mindset outcome.' }
    ],
    preparationTips: ['Study Growth Mindset culture', 'Practice OOP design patterns', 'LeetCode medium problems focus', 'Review cloud/Azure concepts for cloud roles'],
    tags: ['faang', 'tech', 'azure', 'windows', 'enterprise'],
    isVerified: true
  },
  {
    name: 'Meta', slug: 'meta',
    website: 'https://metacareers.com',
    description: 'Meta Platforms, Inc. is the parent company of Facebook, Instagram, WhatsApp, and other services, focusing on social media and the metaverse.',
    industry: 'Technology / Social Media', size: 'large', location: 'Menlo Park, CA',
    difficultyRating: 5,
    interviewProcess: ['Application', 'Recruiter Screen', 'Technical Screen (coding)', 'Onsite (5-6 rounds)', 'Team Matching', 'Offer'],
    interviewRounds: [
      { name: 'Technical Screen', description: '45 min, 1-2 coding problems on CoderPad', tips: 'Meta focuses on optimal solutions. Start with brute force, then optimize.' },
      { name: 'Onsite Coding (x2)', description: 'Harder problems, must get optimal solution', tips: 'Expected to reach optimal time/space complexity. Explain every step.' },
      { name: 'System Design', description: 'Design a Meta-scale system (News Feed, Instagram, WhatsApp)', tips: 'Show deep understanding of distributed systems, CAP theorem, eventual consistency.' },
      { name: 'Behavioral', description: 'Meta values, impact, and collaboration', tips: 'Meta focuses on impact and move fast. Quantify impact in every answer.' }
    ],
    frequentlyAskedQuestions: [
      { question: 'Design Facebook News Feed', category: 'System Design', difficulty: 'hard', answer: 'Fan-out on write vs read trade-offs, ranking algorithm, pagination, caching with Redis, CDN for media.' },
      { question: 'Merge K sorted lists', category: 'Heap', difficulty: 'hard', answer: 'Use min-heap of size k. Extract min, add next from same list. O(N log k) time.' },
      { question: 'Tell me about your most impactful project', category: 'Behavioral', difficulty: 'medium', answer: 'Lead with the metric/impact first. Then explain approach, challenges overcome.' }
    ],
    preparationTips: ['Practice hard LeetCode problems', 'Deep dive into Facebook system design papers', 'Understand Meta values: Move Fast, Be Bold, Focus on Impact', 'Practice explaining technical trade-offs clearly'],
    tags: ['faang', 'tech', 'social-media', 'metaverse', 'ai'],
    isVerified: true
  },
  {
    name: 'Netflix', slug: 'netflix',
    website: 'https://jobs.netflix.com',
    description: 'Netflix, Inc. is an OTT subscription-based streaming service offering a library of films and television series produced in-house or acquired.',
    industry: 'Entertainment / Technology', size: 'medium', location: 'Los Gatos, CA',
    difficultyRating: 5,
    interviewProcess: ['Application', 'Recruiter Screen', 'Hiring Manager Screen', 'Technical Screen', 'Virtual Onsite (4-6 rounds)', 'Reference Check', 'Offer'],
    interviewRounds: [
      { name: 'Hiring Manager Screen', description: 'Culture and experience alignment, 30-60 min', tips: 'Netflix culture is unique. Read the Netflix Culture Memo before this.' },
      { name: 'Technical Depth', description: 'Deep technical questions specific to your domain', tips: 'Netflix hires senior engineers. Expect depth: distributed systems, architecture decisions.' },
      { name: 'System Design', description: 'Large-scale streaming infrastructure design', tips: 'Study CDN, adaptive bitrate streaming, chaos engineering, microservices.' }
    ],
    frequentlyAskedQuestions: [
      { question: 'Design Netflix video streaming system', category: 'System Design', difficulty: 'hard', answer: 'Cover: encoding pipeline, CDN (Open Connect), adaptive bitrate (ABR), recommendation engine, A/B testing platform.' },
      { question: 'How would you handle a production outage with millions of users affected?', category: 'Behavioral', difficulty: 'hard', answer: 'Show incident response: immediate mitigation, root cause analysis, communication plan, postmortem culture.' }
    ],
    preparationTips: ['Read Netflix Tech Blog extensively', 'Understand microservices and chaos engineering', 'Study Netflix OSS (Hystrix, Eureka, Zuul)', 'Netflix values senior, autonomous engineers — show independence'],
    tags: ['faang', 'tech', 'streaming', 'microservices', 'chaos-engineering'],
    isVerified: true
  },
  {
    name: 'Adobe', slug: 'adobe',
    website: 'https://adobe.com/careers',
    description: 'Adobe Inc. is an American multinational software company known for creative software such as Photoshop, Illustrator, Acrobat, and the Creative Cloud platform.',
    industry: 'Software / Creative', size: 'large', location: 'San Jose, CA',
    difficultyRating: 3,
    interviewProcess: ['Application', 'HR Screen', 'Technical Screen', 'Onsite (3-4 rounds)', 'Offer'],
    interviewRounds: [
      { name: 'Technical Screen', description: 'DSA and CS fundamentals', tips: 'Adobe focuses on fundamentals — OOP, data structures, algorithms at medium difficulty.' },
      { name: 'Onsite Coding', description: 'Medium LeetCode + sometimes domain-specific problems', tips: 'For creative roles: discuss image processing algorithms. For platform: distributed systems.' }
    ],
    frequentlyAskedQuestions: [
      { question: 'Implement an LRU Cache', category: 'Data Structures', difficulty: 'medium', answer: 'Use doubly linked list + HashMap for O(1) get and put.' },
      { question: 'Design Adobe Creative Cloud sync', category: 'System Design', difficulty: 'hard', answer: 'Versioning system, conflict resolution, delta sync, offline-first architecture, storage optimization.' }
    ],
    preparationTips: ['Focus on OOP and design patterns', 'Study Adobe Creative Cloud use cases', 'Medium LeetCode problems', 'Understand SaaS product principles'],
    tags: ['tech', 'creative', 'saas', 'cloud', 'b2b'],
    isVerified: true
  },
  {
    name: 'Uber', slug: 'uber',
    website: 'https://uber.com/us/en/careers',
    description: 'Uber Technologies, Inc. is an American mobility as a service provider offering ride-hailing, food delivery (Uber Eats), freight transport, and package delivery.',
    industry: 'Technology / Transportation', size: 'large', location: 'San Francisco, CA',
    difficultyRating: 4,
    interviewProcess: ['Application', 'Recruiter Screen', 'Technical Phone Screen', 'Onsite (4-5 rounds)', 'Offer'],
    interviewRounds: [
      { name: 'Technical Phone Screen', description: 'Coding problem + system design intro', tips: 'Uber likes geospatial problems (nearest driver, surge pricing). Practice these.' },
      { name: 'Onsite System Design', description: 'Design Uber ride matching or surge pricing', tips: 'Discuss geospatial indexing (H3/geohashing), real-time systems, event-driven architecture.' }
    ],
    frequentlyAskedQuestions: [
      { question: 'Design Uber ride matching system', category: 'System Design', difficulty: 'hard', answer: 'Geospatial indexing with H3/geohash, driver state machine, matching algorithm, surge pricing with demand/supply ratio.' },
      { question: 'Find all nearest K points to origin', category: 'Heap', difficulty: 'medium', answer: 'Max heap of size k, or sort by distance, or quickselect.' }
    ],
    preparationTips: ['Study geospatial algorithms and indexing', 'Understand real-time systems and event streaming', 'Practice ride-sharing specific system designs'],
    tags: ['tech', 'marketplace', 'real-time', 'geospatial', 'mobility'],
    isVerified: true
  },
  {
    name: 'Apple', slug: 'apple',
    website: 'https://jobs.apple.com',
    description: 'Apple Inc. is an American multinational technology company that designs, develops, and sells consumer electronics, software, and online services.',
    industry: 'Technology / Consumer Electronics', size: 'enterprise', location: 'Cupertino, CA',
    difficultyRating: 4,
    interviewProcess: ['Application', 'Recruiter Screen', 'Phone/Video Screens (2-3)', 'Onsite (5-8 rounds)', 'Offer'],
    interviewRounds: [
      { name: 'Domain Expert Screens', description: 'Multiple rounds with domain specialists', tips: 'Apple hires deep specialists. Know your domain (iOS, macOS, ML, distributed systems) deeply.' },
      { name: 'Onsite Coding', description: 'Algorithms + domain-specific implementation', tips: 'Clean, readable Swift/C++ code expected. Test coverage matters.' }
    ],
    frequentlyAskedQuestions: [
      { question: 'Design Apple Pay', category: 'System Design', difficulty: 'hard', answer: 'NFC protocol, Secure Enclave, tokenization, payment network integration, privacy-first architecture.' },
      { question: 'Implement a thread-safe singleton', category: 'Concurrency', difficulty: 'medium', answer: 'Double-checked locking pattern or use dispatch_once in Swift/Objective-C.' }
    ],
    preparationTips: ['Deep domain expertise is critical at Apple', 'Study privacy and security patterns', 'Know Apple platform specifics (Swift, Xcode, HIG for iOS roles)', 'Prepare for very long interview loops (8+ rounds not unusual)'],
    tags: ['faang', 'tech', 'ios', 'hardware', 'privacy', 'consumer-electronics'],
    isVerified: true
  },
  {
    name: 'Flipkart', slug: 'flipkart',
    website: 'https://flipkartcareers.com',
    description: "Flipkart is India's leading e-commerce marketplace offering products across categories like electronics, fashion, and groceries, now a Walmart subsidiary.",
    industry: 'E-commerce / Technology', size: 'large', location: 'Bangalore, India',
    difficultyRating: 3,
    interviewProcess: ['Online Application', 'Coding Assessment', 'Technical Round 1', 'Technical Round 2', 'HM Round', 'HR Round', 'Offer'],
    interviewRounds: [
      { name: 'Coding Assessment', description: '3 problems in 90 min on HackerRank', tips: 'Easy to medium LeetCode. Focus on correctness and edge cases.' },
      { name: 'Technical Round 1', description: 'DSA + CS fundamentals', tips: 'Arrays, strings, trees, graphs. OOP design.' },
      { name: 'Technical Round 2', description: 'System design + advanced DSA', tips: 'Design e-commerce systems: catalog, cart, order, payment, inventory.' }
    ],
    frequentlyAskedQuestions: [
      { question: 'Design Flipkart Flash Sale system', category: 'System Design', difficulty: 'hard', answer: 'Rate limiting, inventory locking, queue-based order processing, cache-aside pattern, database sharding.' },
      { question: 'Find the median of two sorted arrays', category: 'Binary Search', difficulty: 'hard', answer: 'Binary search on smaller array. O(log(min(m,n))) time complexity.' }
    ],
    preparationTips: ['Focus on Indian e-commerce scale problems', 'Medium LeetCode is sufficient', 'Study database design and SQL', 'Understand microservices architecture'],
    tags: ['india', 'tech', 'e-commerce', 'startup', 'bangalore'],
    isVerified: true
  },
  {
    name: 'Swiggy', slug: 'swiggy',
    website: 'https://careers.swiggy.com',
    description: 'Swiggy is an Indian online food ordering and delivery platform headquartered in Bangalore, with operations in 500+ cities across India.',
    industry: 'Food Tech / Logistics', size: 'medium', location: 'Bangalore, India',
    difficultyRating: 3,
    interviewProcess: ['Application', 'Coding Test', 'Technical Interview 1', 'Technical Interview 2', 'Bar Raiser', 'HR', 'Offer'],
    interviewRounds: [
      { name: 'Coding Test', description: '2-3 problems on HackerEarth/HackerRank, 60-90 min', tips: 'Medium difficulty. Logical thinking and code clarity matter.' },
      { name: 'System Design', description: 'Design food delivery, real-time tracking, or restaurant discovery', tips: 'Focus on geolocation, real-time updates, and logistics optimization.' }
    ],
    frequentlyAskedQuestions: [
      { question: 'Design Swiggy real-time order tracking', category: 'System Design', difficulty: 'medium', answer: 'WebSocket for real-time updates, geolocation tracking, push notifications, ETA prediction model.' },
      { question: 'Minimum window substring', category: 'Sliding Window', difficulty: 'hard', answer: 'Sliding window with character frequency maps. Shrink left when window satisfies, expand right when not.' }
    ],
    preparationTips: ['Understand food delivery logistics', 'Medium LeetCode is the target', 'Study real-time systems and geolocation APIs', 'Review Node.js or Python backend patterns'],
    tags: ['india', 'food-tech', 'startup', 'logistics', 'gig-economy'],
    isVerified: true
  }
]

// Achievement condition.type must match the enum: 'interview_count' | 'resume_count' | 'streak_days' | 'coding_count' | 'score_threshold' | 'xp_threshold' | 'login_count'
const achievements = [
  {
    name: 'First Steps',
    description: 'Complete your first mock interview',
    icon: '🎯',
    category: 'interview',
    condition: { type: 'interview_count', threshold: 1 },
    xpReward: 100,
    coinReward: 50,
    badgeName: 'Beginner',
    isActive: true
  },
  {
    name: 'Interview Pro',
    description: 'Complete 10 mock interviews',
    icon: '⭐',
    category: 'interview',
    condition: { type: 'interview_count', threshold: 10 },
    xpReward: 500,
    coinReward: 200,
    badgeName: 'Pro',
    isActive: true
  },
  {
    name: 'Resume Expert',
    description: 'Upload and analyze 3 resumes',
    icon: '📄',
    category: 'resume',
    condition: { type: 'resume_count', threshold: 3 },
    xpReward: 200,
    coinReward: 100,
    badgeName: 'Resume Guru',
    isActive: true
  },
  {
    name: 'Streak Warrior',
    description: 'Maintain a 7-day practice streak',
    icon: '🔥',
    category: 'streak',
    condition: { type: 'streak_days', threshold: 7 },
    xpReward: 350,
    coinReward: 150,
    badgeName: 'Streak Master',
    isActive: true
  },
  {
    name: 'Code Ninja',
    description: 'Solve 20 coding problems',
    icon: '💻',
    category: 'coding',
    condition: { type: 'coding_count', threshold: 20 },
    xpReward: 600,
    coinReward: 300,
    badgeName: 'Code Ninja',
    isActive: true
  },
  {
    name: 'Top Performer',
    description: 'Score above 90% in any interview',
    icon: '🏆',
    category: 'interview',
    condition: { type: 'score_threshold', threshold: 90 },
    xpReward: 400,
    coinReward: 200,
    badgeName: 'Elite',
    isActive: true
  }
]

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Seed Companies
    await Company.deleteMany({})
    await Company.insertMany(companies)
    console.log(`Seeded ${companies.length} companies`)

    // Seed Achievements
    await Achievement.deleteMany({})
    await Achievement.insertMany(achievements)
    console.log(`Seeded ${achievements.length} achievements`)

    // Create admin user
    await User.deleteOne({ email: 'admin@speckspace.io' })
    const existingAdmin = null
    if (!existingAdmin) {
      const admin = await User.create({
        name: 'Admin SpeckSpace',
        email: 'admin@speckspace.io',
        password: 'Admin@123',
        role: 'admin',
        isEmailVerified: true,
        provider: 'local'
      })

      await Profile.create({ user: admin._id, bio: 'SpeckSpace Platform Administrator', skills: ['Management', 'Analytics'] })
      await Subscription.create({
        user: admin._id,
        plan: 'enterprise',
        status: 'active',
        features: {
          maxInterviews: -1,
          maxResumes: -1,
          voiceInterview: true,
          codingInterview: true,
          aiCoach: true,
          downloadReports: true
        }
      })

      console.log('Created admin user: admin@speckspace.io / Admin@123')
    } else {
      console.log('Admin user already exists')
    }

    // Create demo student user
    await User.deleteOne({ email: 'demo@speckspace.io' })
    const existingDemo = null
    if (!existingDemo) {
      const demo = await User.create({
        name: 'Demo Student',
        email: 'demo@speckspace.io',
        password: 'Demo@123',
        role: 'student',
        isEmailVerified: true,
        provider: 'local'
      })

      await Profile.create({
        user: demo._id,
        bio: 'Aspiring software engineer practicing for FAANG interviews',
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Data Structures', 'Algorithms'],
        targetCompany: 'Google',
        targetRole: 'Software Engineer',
        xp: 1250,
        level: 3,
        coins: 450,
        streak: 5
      })

      await Subscription.create({
        user: demo._id,
        plan: 'premium',
        status: 'active',
        features: {
          maxInterviews: 100,
          maxResumes: 10,
          voiceInterview: true,
          codingInterview: true,
          aiCoach: true,
          downloadReports: true
        }
      })

      console.log('Created demo user: demo@speckspace.io / Demo@123')
    } else {
      console.log('Demo user already exists')
    }

    console.log('\nDatabase seeded successfully!')
    console.log('\nTest accounts:')
    console.log('  Admin: admin@speckspace.io / Admin@123')
    console.log('  Demo:  demo@speckspace.io / Demo@123')
  } catch (error) {
    console.error('Seed error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

seedDatabase()
