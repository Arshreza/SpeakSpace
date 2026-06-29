import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import mongoSanitize from 'express-mongo-sanitize'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'
dotenv.config()

import connectDB from './config/db.js'
import logger from './utils/logger.js'
import { generalLimiter, authLimiter } from './middlewares/rateLimiter.js'
import { errorHandler, notFound } from './middlewares/errorHandler.js'
import { setupSocketHandlers } from './sockets/interview.socket.js'

// Routes
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import resumeRoutes from './routes/resume.routes.js'
import interviewRoutes from './routes/interview.routes.js'
import codingRoutes from './routes/coding.routes.js'
import companyRoutes from './routes/company.routes.js'
import leaderboardRoutes from './routes/leaderboard.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import aiRoutes from './routes/ai.routes.js'
import adminRoutes from './routes/admin.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const httpServer = createServer(app)

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
})
setupSocketHandlers(io)

// Make io accessible in routes
app.set('io', io)

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}))

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate limiting (skip in development to avoid hitting limits during testing)
if (process.env.NODE_ENV !== 'development') {
  app.use('/api/v1/auth', authLimiter)
  app.use('/api/v1', generalLimiter)
}

// Stripe webhook needs raw body — mount before json parser
app.use('/api/v1/payment/stripe/webhook', express.raw({ type: 'application/json' }))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use(compression())

// Sanitize
app.use(mongoSanitize())

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }))
}

// API Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/resume', resumeRoutes)
app.use('/api/v1/interview', interviewRoutes)
app.use('/api/v1/coding', codingRoutes)
app.use('/api/v1/company', companyRoutes)
app.use('/api/v1/leaderboard', leaderboardRoutes)
app.use('/api/v1/payment', paymentRoutes)
app.use('/api/v1/ai', aiRoutes)
app.use('/api/v1/admin', adminRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: process.env.NODE_ENV })
})

// 404 handler
app.use(notFound)

// Global error handler
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()
    httpServer.listen(PORT, () => {
      logger.info(`SpeckSpace server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  httpServer.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
})

export default app
