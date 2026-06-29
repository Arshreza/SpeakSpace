# SpeckSpace — AI-Powered Interview Preparation Platform

A full-stack, production-ready platform built with the MERN stack that helps developers and students ace their technical interviews using AI-powered mock interviews, resume analysis, coding practice, and personalized career coaching.

---

## Features

- **AI Mock Interviews** — HR, Behavioral, Technical, Coding, System Design with GPT-4
- **Voice Interviews** — Speech-to-text (Whisper) + text-to-speech (OpenAI TTS) real-time flow
- **Resume Analyzer** — ATS scoring, grammar analysis, keyword extraction, AI suggestions
- **AI Resume Builder** — Generate professional resumes from your profile
- **Coding Interview** — Monaco editor, multi-language, AI code review + complexity analysis
- **AI Career Coach** — Chat-based coaching for resume, salary, interview strategy
- **Company Database** — Top 50 companies with interview processes, FAQs, community experiences
- **Leaderboard** — Weekly/Monthly/All-time rankings with XP and achievements
- **Learning Center** — Courses, roadmaps, quizzes, flashcards
- **Dashboard Analytics** — Weekly progress, skill radar chart, achievement tracking
- **Subscription** — Stripe + Razorpay integration (Free / Premium / Enterprise)
- **Admin Panel** — Full user, company, interview, payment management

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | Core framework |
| TypeScript | Type safety |
| TailwindCSS | Styling |
| ShadCN UI | Component library |
| React Router v6 | Routing |
| TanStack Query | Server state management |
| Zustand | Client state management |
| Framer Motion | Animations |
| React Hook Form + Zod | Forms + validation |
| Monaco Editor | Code editor |
| Recharts | Charts and analytics |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | Server framework |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Redis (ioredis) | Caching + sessions |
| Socket.io | Real-time features |
| Multer + Cloudinary | File uploads |
| OpenAI GPT-4 | AI features |
| Whisper API | Speech-to-text |
| OpenAI TTS | Text-to-speech |
| Nodemailer | Email service |
| Passport.js | OAuth (Google + GitHub) |
| Stripe + Razorpay | Payments |

---

## Project Structure

```
SpeckSpace/
├── client/                    # React frontend
│   └── src/
│       ├── components/
│       │   ├── ui/            # ShadCN components
│       │   └── shared/        # Shared components
│       ├── pages/
│       │   ├── auth/          # Auth pages
│       │   └── admin/         # Admin panel
│       ├── layouts/           # Page layouts
│       ├── hooks/             # Custom hooks
│       ├── contexts/          # React contexts
│       ├── services/          # API services
│       ├── store/             # Zustand stores
│       ├── utils/             # Utilities
│       └── types/             # TypeScript types
├── server/                    # Node.js backend
│   ├── controllers/           # Request handlers
│   ├── routes/                # Route definitions
│   ├── middlewares/           # Express middlewares
│   ├── models/                # Mongoose models
│   ├── services/              # Business logic
│   ├── utils/                 # Helpers
│   ├── config/                # DB, Redis, Cloudinary
│   ├── validators/            # Joi validators
│   ├── sockets/               # Socket.io handlers
│   └── jobs/                  # Background jobs
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB 7+
- Redis 7+
- OpenAI API key
- Cloudinary account
- Stripe account (for payments)

### 1. Clone the repository

```bash
git clone https://github.com/Arshreza/SpeckSpace.git
cd SpeckSpace
```

### 2. Set up the server

```bash
cd server
npm install
cp .env.example .env
# Fill in all environment variables in .env
```

### 3. Set up the client

```bash
cd client
npm install
```

### 4. Environment Variables

Create `server/.env` from the `.env.example` template:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/speckspace

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Redis
REDIS_URL=redis://localhost:6379

# Client URL
CLIENT_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=SpeckSpace <noreply@speckspace.io>

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# ElevenLabs (optional, fallback to OpenAI TTS)
ELEVENLABS_API_KEY=your-elevenlabs-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_your-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

### 5. Seed the database

```bash
cd server
node utils/seedData.js
```

This seeds:
- 10 major tech companies (Google, Amazon, Microsoft, Meta, Netflix, etc.)
- 5 achievement types
- Admin user (admin@speckspace.io / Admin@123)

### 6. Run the application

**Development (two terminals):**

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Run with Docker

```bash
# From root directory
docker-compose up --build
```

---

## API Documentation

All API endpoints are prefixed with `/api/v1`.

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login |
| GET | /auth/logout | Logout |
| POST | /auth/refresh-token | Refresh access token |
| POST | /auth/forgot-password | Send reset email |
| PUT | /auth/reset-password/:token | Reset password |
| GET | /auth/verify-email/:token | Verify email |
| GET | /auth/me | Get current user |
| GET | /auth/google | Google OAuth |
| GET | /auth/github | GitHub OAuth |

### Resume
| Method | Endpoint | Description |
|---|---|---|
| POST | /resume/upload | Upload PDF resume |
| POST | /resume/:id/analyze | Trigger AI analysis |
| GET | /resume | List resumes |
| GET | /resume/:id | Get resume + analysis |
| DELETE | /resume/:id | Delete resume |
| POST | /resume/generate | Generate resume from profile |

### Interview
| Method | Endpoint | Description |
|---|---|---|
| POST | /interview/create | Create interview session |
| GET | /interview | List user interviews |
| GET | /interview/:id | Get interview details |
| POST | /interview/:id/start | Start interview |
| POST | /interview/:id/answer/:qId | Submit answer |
| POST | /interview/:id/complete | Complete interview |
| GET | /interview/:id/report | Get full report |

### Companies
| Method | Endpoint | Description |
|---|---|---|
| GET | /company | List all companies |
| GET | /company/:slug | Get company details |
| POST | /company/:slug/experience | Add interview experience |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | /ai/coach | Chat with AI coach |
| POST | /ai/roadmap | Generate roadmap |
| GET | /ai/roadmap | Get saved roadmap |
| POST | /ai/tts | Text to speech |
| POST | /ai/stt | Speech to text |

---

## Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy dist/ to Vercel
```

### Backend → Render
- Connect GitHub repo
- Root directory: `server`
- Build: `npm install`
- Start: `node server.js`
- Add all environment variables in Render dashboard

### Database → MongoDB Atlas
- Create cluster at mongodb.com
- Add connection string to MONGODB_URI

### Cache → Redis Cloud
- Create database at redis.com
- Add connection URL to REDIS_URL

### Media → Cloudinary
- Create account at cloudinary.com
- Add cloud name, API key, and API secret

---

## Roles

| Role | Capabilities |
|---|---|
| **Student** | All interview, resume, coding, AI coach features |
| **Recruiter** | View candidate reports (future feature) |
| **Admin** | Full admin panel — users, companies, interviews, payments |

---

## License

MIT © 2026 SpeckSpace
