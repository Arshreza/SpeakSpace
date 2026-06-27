"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, EyeOff, Mic, MicOff, Send, Users } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { StarRating } from "@/components/star-rating"
import { useAuth } from "@/components/auth-provider"
import { Badge } from "@/components/ui/badge"
import { ChatRoom } from "@/components/chat-room";

export function SessionInterface() {
  const { user } = useAuth()
  const [micEnabled, setMicEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [message, setMessage] = useState("")
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("speakspace_user_role") || "participant"
  })
  const [showSessionRating, setShowSessionRating] = useState(false)
  const [speakerQueue, setSpeakerQueue] = useState<string[]>(["Rachel", "Tom"])
  const [ratings, setRatings] = useState({
    confidence: 7,
    clarity: 8,
    logic: 6,
  })
  const [feedback, setFeedback] = useState("")

  const isModeratorOrEvaluator = userRole === "moderator" || userRole === "evaluator"

  const toggleMic = () => setMicEnabled(!micEnabled)
  const toggleVideo = () => setVideoEnabled(!videoEnabled)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      // Send message logic would go here
      setMessage("")
    }
  }

  const handleMuteAll = () => {
    // In a real app, this would mute all participants
    alert("All participants muted")
  }

  const handleRemoveFromQueue = (name: string) => {
    setSpeakerQueue((prev) => prev.filter((item) => item !== name))
  }

  const handleSubmitRating = () => {
    // In a real app, this would submit the ratings to the backend
    alert("Feedback submitted successfully")
    setShowSessionRating(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Technical Interview Practice</CardTitle>
                <CardDescription>Session in progress • 32:45</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={micEnabled ? "default" : "outline"}
                  size="icon"
                  onClick={toggleMic}
                  className={
                    micEnabled ? "bg-green-600 hover:bg-green-700" : "bg-red-100 text-red-600 hover:bg-red-200"
                  }
                >
                  {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                <Button
                  variant={videoEnabled ? "default" : "outline"}
                  size="icon"
                  onClick={toggleVideo}
                  className={
                    videoEnabled ? "bg-green-600 hover:bg-green-700" : "bg-red-100 text-red-600 hover:bg-red-200"
                  }
                >
                  {videoEnabled ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 rounded-lg p-6 mb-6">
              <div className="flex flex-col items-center justify-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Session" />
                  <AvatarFallback>SP</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-medium mb-2">Voice Session Active</h3>
                <p className="text-sm text-slate-600 mb-4">
                  You are connected to the session. Use the microphone and video buttons to control your media.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <span className="flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>5
                    participants connected
                  </span>
                </div>
              </div>
            </div>

            {isModeratorOrEvaluator && (
              <div className="mb-6 p-4 border border-blue-100 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Moderator Controls
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" variant="destructive" onClick={handleMuteAll}>
                    <MicOff className="h-4 w-4 mr-2" />
                    Mute All
                  </Button>

                  <div className="flex-1 ml-4">
                    <h4 className="text-xs font-medium text-blue-800 mb-1">Speaker Queue</h4>
                    <div className="flex flex-wrap gap-2">
                      {speakerQueue.length > 0 ? (
                        speakerQueue.map((name) => (
                          <Badge key={name} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            {name}
                            <button
                              className="ml-1 text-blue-600 hover:text-blue-800"
                              onClick={() => handleRemoveFromQueue(name)}
                            >
                              ×
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-blue-600">No speakers in queue</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ParticipantCard name="You" role="Participant" isActive={true} />
              <ParticipantCard name="Sarah" role="Moderator" />
              <ParticipantCard name="Mike" role="Evaluator" />
              <ParticipantCard name="Rachel" role="Participant" />
              <ParticipantCard name="Tom" role="Participant" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Separator className="mb-4" />
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-4 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>

      <div>
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="mt-4">
            <Card className="shadow-sm border-0 bg-white h-[600px]">
              <CardHeader>
                <CardTitle>Session Chat</CardTitle>
              </CardHeader>
              <CardContent className="h-full p-0">
                <ChatRoom sessionId="session_123" />
                <ChatMessage
                  name="You"
                  role="Participant"
                  message="Thanks for the tips. I'm ready to start whenever everyone else is."
                  time="10:04 AM"
                  isUser={true}
                />
                <ChatMessage
                  name="Rachel"
                  role="Participant"
                  message="I'm ready too. Looking forward to the practice!"
                  time="10:05 AM"
                />
                <ChatMessage
                  name="Sarah"
                  role="Moderator"
                  message="Great! Let's begin with a common system design question: How would you design a URL shortening service like bit.ly?"
                  time="10:06 AM"
                />
                <ChatMessage
                  name="You"
                  role="Participant"
                  message="For a URL shortening service, I'd first consider the requirements: generating unique short URLs, redirecting to original URLs, and handling high traffic."
                  time="10:08 AM"
                  isUser={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="feedback" className="mt-4">
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader>
                <CardTitle>Real-time Feedback</CardTitle>
                <CardDescription>Your performance metrics for this session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Confidence</span>
                  </div>
                  <StarRating value={7} readOnly />
                  <p className="text-xs text-slate-500">Good eye contact and posture. Try to reduce filler words.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Communication Clarity</span>
                  </div>
                  <StarRating value={8} readOnly />
                  <p className="text-xs text-slate-500">Clear explanations and good use of technical terminology.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Logical Reasoning</span>
                  </div>
                  <StarRating value={6} readOnly />
                  <p className="text-xs text-slate-500">
                    Structured approach to problem-solving. Consider edge cases more thoroughly.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Evaluator Notes</h4>
                  <div className="bg-slate-50 p-3 rounded-md text-sm">
                    <p>
                      Good technical knowledge and communication skills. Demonstrates clear understanding of system
                      design principles. Could improve on discussing scalability aspects and trade-offs in more detail.
                    </p>
                    <p className="mt-2">
                      Recommendation: Practice more complex system design questions and focus on discussing performance
                      optimizations.
                    </p>
                  </div>
                </div>

                {userRole === "evaluator" && (
                  <div className="mt-4">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setShowSessionRating(true)}>
                      Provide Session Feedback
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showSessionRating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Session Evaluation</CardTitle>
              <CardDescription>Rate the participant's performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Confidence</label>
                <StarRating
                  value={ratings.confidence}
                  onChange={(value) => setRatings((prev) => ({ ...prev, confidence: value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Communication Clarity</label>
                <StarRating
                  value={ratings.clarity}
                  onChange={(value) => setRatings((prev) => ({ ...prev, clarity: value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Logical Reasoning</label>
                <StarRating
                  value={ratings.logic}
                  onChange={(value) => setRatings((prev) => ({ ...prev, logic: value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Detailed Feedback</label>
                <textarea
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  placeholder="Provide detailed feedback on strengths and areas for improvement..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setShowSessionRating(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitRating}>Submit Evaluation</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

function ParticipantCard({ name, role, isActive = false }: { name: string; role: string; isActive?: boolean }) {
  return (
    <div
      className={`p-4 rounded-lg border ${isActive ? "border-blue-500 bg-blue-50" : "border-slate-100"} flex items-center gap-3`}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${name.charAt(0)}`} alt={name} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <h4 className="font-medium text-sm">{name}</h4>
        <p className="text-xs text-slate-500">{role}</p>
      </div>
      {isActive && (
        <div className="ml-auto">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        </div>
      )}
    </div>
  )
}

function ChatMessage({
  name,
  role,
  message,
  time,
  isUser = false,
}: {
  name: string
  role: string
  message: string
  time: string
  isUser?: boolean
}) {
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${name.charAt(0)}`} alt={name} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className={`max-w-[80%] ${isUser ? "text-right" : ""}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{name}</span>
          <span className="text-xs text-slate-500">({role})</span>
        </div>
        <div
          className={`p-3 rounded-lg text-sm ${isUser ? "bg-blue-100 text-blue-900" : "bg-slate-100 text-slate-900"}`}
        >
          {message}
        </div>
        <span className="text-xs text-slate-500 mt-1 block">{time}</span>
      </div>
    </div>
  )
}
