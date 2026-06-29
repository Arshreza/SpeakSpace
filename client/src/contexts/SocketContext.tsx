import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  joinRoom: (room: string) => void
  leaveRoom: (room: string) => void
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinRoom: () => {},
  leaveRoom: () => {},
})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { isAuthenticated, token } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && token) {
      socketRef.current = io('http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      socketRef.current.on('connect', () => {
        setIsConnected(true)
        console.log('Socket connected:', socketRef.current?.id)
      })

      socketRef.current.on('disconnect', () => {
        setIsConnected(false)
        console.log('Socket disconnected')
      })

      socketRef.current.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message)
        setIsConnected(false)
      })

      return () => {
        socketRef.current?.disconnect()
        socketRef.current = null
        setIsConnected(false)
      }
    } else {
      socketRef.current?.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [isAuthenticated, token])

  const joinRoom = (room: string) => {
    socketRef.current?.emit('join_room', room)
  }

  const leaveRoom = (room: string) => {
    socketRef.current?.emit('leave_room', room)
  }

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, joinRoom, leaveRoom }}>
      {children}
    </SocketContext.Provider>
  )
}
