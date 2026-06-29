import logger from '../utils/logger.js'
import { verifyAccessToken } from '../utils/jwt.js'
import User from '../models/User.js'

export const setupSocketHandlers = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
      if (token) {
        const decoded = verifyAccessToken(token)
        const user = await User.findById(decoded.id).select('name email avatar role')
        if (user) { socket.user = user }
      }
      next()
    } catch {
      next() // Allow unauthenticated connections (some public features)
    }
  })

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} user: ${socket.user?.name || 'anonymous'}`)

    // Join interview room
    socket.on('interview:join', ({ interviewId }) => {
      socket.join(`interview:${interviewId}`)
      socket.to(`interview:${interviewId}`).emit('interview:user-joined', { user: socket.user?.name })
      logger.info(`User joined interview room: ${interviewId}`)
    })

    // Leave interview room
    socket.on('interview:leave', ({ interviewId }) => {
      socket.leave(`interview:${interviewId}`)
    })

    // Broadcast question to room (for collaborative sessions)
    socket.on('interview:question', ({ interviewId, question }) => {
      socket.to(`interview:${interviewId}`).emit('interview:question', question)
    })

    // Answer submitted
    socket.on('interview:answer-submitted', ({ interviewId, questionId, score }) => {
      socket.to(`interview:${interviewId}`).emit('interview:answer-submitted', { questionId, score })
    })

    // Push AI feedback to client
    socket.on('interview:request-feedback', ({ interviewId }) => {
      socket.to(`interview:${interviewId}`).emit('interview:feedback-loading')
    })

    // AI Coach real-time chat — typing indicator only; response delivered via REST
    socket.on('coach:message', async ({ message, history }) => {
      try {
        socket.emit('coach:typing', true)
        // Intentional: response is returned by the /api/v1/ai/coach REST endpoint
        socket.emit('coach:typing', false)
      } catch (error) {
        socket.emit('coach:error', { message: 'Failed to get response' })
      }
    })

    // Voice interview events
    socket.on('voice:start', ({ interviewId }) => {
      socket.to(`interview:${interviewId}`).emit('voice:started')
    })

    socket.on('voice:stop', ({ interviewId }) => {
      socket.to(`interview:${interviewId}`).emit('voice:stopped')
    })

    // Timer sync
    socket.on('timer:sync', ({ interviewId, timeLeft }) => {
      socket.to(`interview:${interviewId}`).emit('timer:sync', { timeLeft })
    })

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`)
    })
  })
}
