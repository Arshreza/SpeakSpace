"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore"
import { Send } from "lucide-react"

type Message = {
  id: string
  text: string
  userId: string
  userName: string
  timestamp: any
}

export function ChatRoom({ sessionId }: { sessionId: string }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sessionId) return
    const q = query(collection(db, `sessions/${sessionId}/messages`), orderBy("timestamp", "asc"))
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Message[])
    })
    return () => unsub()
  }, [sessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return
    try {
      await addDoc(collection(db, `sessions/${sessionId}/messages`), {
        text: newMessage.trim(),
        userId: user.id,
        userName: user.name || "Anonymous",
        timestamp: serverTimestamp(),
      })
      setNewMessage("")
    } catch {}
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-slate-600 text-xs py-8">No messages yet — start the conversation!</p>
        )}
        {messages.map(msg => {
          const isMe = msg.userId === user?.id
          const initials = msg.userName.slice(0, 2).toUpperCase()
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              <div className="w-7 h-7 rounded-full bg-slate-700 border border-white/[0.08] flex items-center justify-center text-xs font-medium text-slate-300 shrink-0">
                {initials}
              </div>
              <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                {!isMe && (
                  <p className="text-xs text-slate-500 px-1">{msg.userName}</p>
                )}
                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-slate-800/80 border border-white/[0.06] text-slate-200 rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-white/[0.06]">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800/60 border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/40 text-sm"
          />
          <button type="submit"
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

import type React from "react"
