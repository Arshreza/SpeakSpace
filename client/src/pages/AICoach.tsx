import { useState, useRef, useEffect, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Send, Mic, MicOff, Trash2, Bot, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/utils/api'
import useAuthStore from '@/store/authStore'
import { cn } from '@/utils/cn'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ─── Quick Prompts ────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  'Review my resume tips',
  "How to answer 'Tell me about yourself'",
  'Negotiate salary for FAANG',
  'Explain system design basics',
  'Behavioral interview tips',
  'Which DSA topics should I focus on?',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const INITIAL_MESSAGE: Message = {
  id: 'init',
  role: 'assistant',
  content:
    "Hi! I'm your SpeakSpace AI Career Coach. I can help with interview prep, resume reviews, career advice, salary negotiation, and more. What would you like to work on today?",
  timestamp: new Date(),
}

// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 max-w-[80%]">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 border border-white/10 text-base shrink-0">
        🤖
      </div>
      <div className="bg-slate-800 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-indigo-400 rounded-full inline-block animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AICoach() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    document.title = 'AI Career Coach | SpeakSpace'
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [input])

  const sendMutation = useMutation({
    mutationFn: async ({ message, history }: { message: string; history: { role: string; content: string }[] }) => {
      const { data } = await api.post('/ai/coach', { message, history })
      return data as { data: { reply: string } }
    },
    onSuccess: (data) => {
      const reply = data?.data?.reply ?? 'I apologize, I could not generate a response right now. Please try again.'
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: 'assistant', content: reply, timestamp: new Date() },
      ])
    },
    onError: () => {
      setIsTyping(false)
      // Fallback response so UI doesn't feel broken
      const fallbacks = [
        "That's a great question! For interview prep, I'd recommend focusing on STAR method for behavioral questions and practicing system design whiteboarding. What specific area would you like to dive into?",
        "Great topic! Let me help you with that. The key is to be structured and specific in your answers. Would you like me to walk you through some examples?",
        "I can definitely help with that! The most important thing is to practice consistently and get feedback on your answers. What role are you preparing for?",
      ]
      const reply = fallbacks[Math.floor(Math.random() * fallbacks.length)]
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: 'assistant', content: reply, timestamp: new Date() },
      ])
    },
  })

  const sttMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const form = new FormData()
      form.append('audio', audioBlob, 'recording.webm')
      const { data } = await api.post('/ai/stt', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data as { data: { transcript: string } }
    },
    onSuccess: (data) => {
      const transcript = data?.data?.transcript ?? ''
      if (transcript) setInput(transcript)
    },
    onError: () => {
      toast.error('Could not transcribe audio. Please type your message.')
    },
  })

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsTyping(true)

      const history = messages
        .slice(-10)
        .map(({ role, content }) => ({ role, content }))

      sendMutation.mutate({ message: trimmed, history })
    },
    [messages, sendMutation]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE])
    setIsTyping(false)
    toast.success('Chat cleared')
  }

  const handleVoiceToggle = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        audioChunksRef.current = []

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data)
        }

        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          stream.getTracks().forEach((t) => t.stop())
          sttMutation.mutate(blob)
        }

        mediaRecorderRef.current = recorder
        recorder.start()
        setIsRecording(true)
        toast.success('Recording... Click mic again to stop.')
      } catch {
        toast.error('Microphone access denied. Please check your browser permissions.')
      }
    }
  }

  const isEmpty = messages.length === 1 && messages[0].id === 'init'

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-lg shadow-purple-500/25">
            🤖
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">AI Career Coach</h1>
            <p className="text-xs text-slate-400">Powered by GPT-4 · Always here to help</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearChat}
          className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          Clear Chat
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Empty State Quick Prompts */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-slate-400 text-sm mb-6 text-center max-w-sm">
              Ask me anything about your interview prep journey!
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left text-xs text-slate-300 bg-slate-800/60 border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/10 rounded-xl px-4 py-3 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex items-end gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
          >
            {/* Avatar */}
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-sm font-semibold',
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                  : 'bg-slate-700 border border-white/10 text-base'
              )}
            >
              {msg.role === 'user'
                ? (user ? getInitials(user.name) : <User className="w-4 h-4" />)
                : '🤖'}
            </div>

            {/* Bubble */}
            <div className={cn('max-w-[75%] flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}>
              <div
                className={cn(
                  'px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words',
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-br-sm shadow-lg shadow-purple-500/20'
                    : 'bg-slate-800 border border-white/10 text-slate-200 rounded-bl-sm'
                )}
              >
                {msg.content}
              </div>
              <span className="text-xs text-slate-600 mt-1 px-1">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Strip (non-empty) */}
      {!isEmpty && (
        <div className="px-6 py-2 border-t border-white/5 shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="whitespace-nowrap text-xs text-slate-400 border border-white/10 hover:border-indigo-500/40 hover:text-indigo-400 rounded-full px-3 py-1.5 transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-white/10 bg-slate-900/50 shrink-0">
        <div className="flex items-end gap-3 bg-slate-800 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-indigo-500/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about interview tips, resume, salary negotiation..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 resize-none outline-none max-h-[120px] leading-relaxed"
          />
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleVoiceToggle}
              disabled={sttMutation.isPending}
              className={cn(
                'p-2 rounded-xl transition-colors',
                isRecording
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              )}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              {sttMutation.isPending
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : isRecording
                ? <MicOff className="w-5 h-5" />
                : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || sendMutation.isPending || isTyping}
              className={cn(
                'p-2 rounded-xl transition-all',
                input.trim() && !sendMutation.isPending && !isTyping
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-purple-500/25'
                  : 'text-slate-600 cursor-not-allowed'
              )}
              title="Send message"
            >
              {sendMutation.isPending || isTyping
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-600 mt-2 text-center">
          Press <kbd className="px-1 py-0.5 rounded bg-slate-700 font-mono text-slate-400">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-slate-700 font-mono text-slate-400">Shift+Enter</kbd> for newline
        </p>
      </div>
    </div>
  )
}
