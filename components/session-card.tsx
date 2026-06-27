"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users } from "lucide-react"

type SessionCardProps = {
  title: string
  description: string
  date: string
  time: string
  participants: number
  maxParticipants: number
  tags: string[]
  status: "live" | "upcoming" | "ended"
  onJoin?: () => void
  onEdit?: () => void
  onDelete?: () => void
  isModeratorView?: boolean
}

export function SessionCard({
  title,
  description,
  date,
  time,
  participants,
  maxParticipants,
  tags,
  status,
  onJoin,
  onEdit,
  onDelete,
  isModeratorView = false,
}: SessionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-100 text-green-800"
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "ended":
        return "bg-slate-100 text-slate-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <Card className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm text-slate-500 mb-2">{description}</p>
          </div>
          <Badge className={getStatusColor(status)}>{status}</Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-slate-500">
            <Calendar className="h-4 w-4 mr-2" />
            {date}
          </div>
          <div className="flex items-center text-sm text-slate-500">
            <Clock className="h-4 w-4 mr-2" />
            {time}
          </div>
          <div className="flex items-center text-sm text-slate-500">
            <Users className="h-4 w-4 mr-2" />
            {participants}/{maxParticipants} participants
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-slate-100">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0">
        {isModeratorView ? (
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        ) : (
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            onClick={onJoin}
          >
            Join Session
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}