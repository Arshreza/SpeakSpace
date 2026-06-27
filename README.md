# SpeakSpace

**AI-powered group discussion and interview practice platform** — sharpen your communication, get live feedback, and track your progress through structured sessions with peers.

---

## What it does

SpeakSpace lets users practice the skills that matter in group discussions, mock interviews, and panel debates. Three distinct roles shape the experience:

| Role | What they do |
|---|---|
| **Moderator** | Creates and manages sessions, sets topics, controls pacing |
| **Participant** | Joins sessions to practice speaking, get evaluated, and improve |
| **Evaluator** | Observes sessions, scores participants on a rubric, gives feedback |

Every user goes through a short onboarding that picks their role and tailors the dashboard, navigation, and available features accordingly.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.2 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS, Shadcn/ui, Radix UI |
| Auth | Firebase Authentication (email/password + Google OAuth) |
| Database | Firebase Firestore |
| Video | Jitsi Meet (embedded via external API) |
| Real-time chat | Firestore subcollections (live `onSnapshot`) |
| Animations | Framer Motion |
| Icons | Lucide React |

---

## Pages

### Public
| Route | Description |
|---|---|
| `/` | Redirect — sends authenticated users to dashboard, guests to landing |
| `/landing` | Marketing page with features, how it works, testimonials |
| `/auth/login` | Email/password + Google sign-in |
| `/auth/register` | Account creation with terms acceptance |
| `/auth/forgot-password` | Firebase password reset email |

### Authenticated (all roles)
| Route | Description |
|---|---|
| `/dashboard` | Role-specific dashboard with stats and quick actions |
| `/live-sessions` | Browse, create, join, and manage sessions |
| `/session?id=...` | Live session room — Jitsi video + real-time chat |
| `/leaderboard` | Top 20 users ranked by score, with podium for top 3 |
| `/profile` | Personal profile with role-specific tabs and edit dialog |
| `/practice` | Quick session browser and session creator |
| `/resources` | Guides, videos, templates — filterable, addable to Firestore |
| `/create-meeting` | Long-form group discussion creator |

### Participant only
| Route | Description |
|---|---|
| `/resume` | Upload resume → get AI feedback; view personalized tips |

---

## Role-based features

### Moderator (purple)
- Dashboard: sessions hosted, live count, total participants, manage buttons
- Live sessions: "Create Session" primary CTA, manage/edit/delete own sessions
- Profile: Stats tab with session metrics and moderation tips
- No Resume page

### Participant (blue/cyan)
- Dashboard: skill progress bars, open sessions list, sessions joined count
- Live sessions: join sessions, see recommended tab
- Profile: Progress tab (skill bars), History tab, Resume Tips tab
- Resume page: AI-powered upload and feedback
- Session room: feedback panel showing real-time scores

### Evaluator (amber)
- Dashboard: sessions evaluated count, rubric preview widget, browse sessions
- Live sessions: observe sessions (no join action), "To Evaluate" tab
- Session room: dedicated scoring panel (1–5 per criterion + notes)
- Profile: Progress and History tabs
- No Resume page

---

## Onboarding

First-time users see a full-screen 3-step setup before accessing the app:

1. **Role selection** — Moderator, Participant, or Evaluator with distinct visuals
2. **Role-specific questions** — session types (Moderator), prep goals (Participant), expertise areas (Evaluator)
3. **Style/focus** — run length (Moderator), focus areas (Participant), feedback style (Evaluator)
4. **Unique completion screen** per role — purple/blue/amber themed with relevant widgets

Onboarding can be skipped at any point. Completion is tracked in Firestore and `localStorage`.

---

## Firestore schema

```
users/{uid}
  name, email, avatar, role, preferredRole
  skills[], bio, score, sessions, badges[]
  improvement, onboardingCompleted, createdAt, updatedAt

sessions/{id}
  title, description, date, time
  maxParticipants, evaluators
  tags[], status (live | upcoming | ended)
  participants[], createdBy, createdAt

sessions/{id}/messages/{msgId}
  text, userId, userName, timestamp

meetings/{id}
  topic, description, maxParticipants, rules
  scheduledAt, createdBy, status, participants[]

resources/{id}
  title, description, type, tags[], createdAt

resumeAnalyses/{id}
  userId, score, feedback[], timestamp
```

---

## Getting started

### Prerequisites
- Node.js 18+
- A Firebase project with Auth and Firestore enabled

### Setup

```bash
git clone https://github.com/Arshreza/SpeakSpace.git
cd SpeakSpace
npm install --legacy-peer-deps
```

Create `.env.local` in the root with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm start
```

---

## Firebase setup

1. **Authentication** — enable Email/Password and Google providers
2. **Firestore** — create a database in production mode, then add these security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /sessions/{sessionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.createdBy;
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
    match /meetings/{meetingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.createdBy;
    }
    match /resources/{resourceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /resumeAnalyses/{analysisId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

3. **Firestore indexes** — the leaderboard query (`orderBy("score", "desc")`) and resume analyses query (`where userId + orderBy timestamp`) may require composite indexes. Firebase will show a link in the browser console to create them automatically on first run.

---

## Project structure

```
SpeakSpace/
├── app/
│   ├── auth/               # Login, register, forgot-password, template-selection
│   ├── dashboard/          # Role-specific dashboards
│   ├── live-sessions/      # Session browser + CRUD
│   ├── session/            # Live Jitsi room + chat
│   ├── leaderboard/        # Rankings
│   ├── profile/            # User profile + edit
│   ├── resume/             # Resume feedback (participants)
│   ├── practice/           # Practice session browser
│   ├── resources/          # Learning resources
│   ├── create-meeting/     # Group discussion creator
│   ├── landing/            # Public marketing page
│   ├── layout.tsx          # Root layout with ThemeProvider + Toaster
│   └── page.tsx            # Smart redirect
├── components/
│   ├── ui/                 # Shadcn/Radix primitives
│   ├── auth-provider.tsx   # Firebase auth context
│   ├── auth-wall.tsx       # Route protection
│   ├── main-nav.tsx        # Role-filtered navigation
│   ├── user-nav.tsx        # Avatar dropdown
│   ├── first-time-setup.tsx # Onboarding flow
│   ├── chat-room.tsx       # Realtime Firestore chat
│   ├── edit-profile-dialog.tsx
│   └── star-rating.tsx
├── lib/
│   ├── firebase.ts         # Firebase app init
│   └── utils.ts            # cn() helper
├── hooks/
│   └── use-toast.ts
├── styles/
│   └── globals.css
└── types/
    └── global.d.ts         # Jitsi window type
```

---

## Design system

All pages use a consistent dark premium theme:

- **Background**: `bg-slate-950`
- **Cards**: `bg-slate-900/60 border border-white/[0.07] rounded-2xl`
- **Inputs**: `bg-slate-800/50 border border-white/[0.08] text-white`
- **Dialogs**: `bg-slate-900 border border-white/[0.08]`
- **Role accents**: Moderator = purple, Participant = blue/cyan, Evaluator = amber/orange

---

## License

MIT
