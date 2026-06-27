"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock } from "lucide-react"
import { format } from "date-fns"

type GroupDiscussion = {
  id: string
  topic: string
  description: string
  scheduledAt: Date
  maxParticipants: number
  rules: string
  status: "scheduled" | "live" | "ended"
  participants: string[]
  createdBy: string
}

type GroupDiscussionCardProps = {
  discussion: GroupDiscussion
  onJoin: (discussion: GroupDiscussion) => void
  onEdit?: (discussion: GroupDiscussion) => void
  onDelete?: (discussionId: string) => void
  isCreator?: boolean
}

export function GroupDiscussionCard({
  discussion,
  onJoin,
  onEdit,
  onDelete,
  isCreator = false,
}: GroupDiscussionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-100 text-green-800"
      case "ended":
        return "bg-slate-100 text-slate-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <Card className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{discussion.topic}</h3>
            <p className="text-sm text-slate-500 mt-1">{discussion.description}</p>
          </div>
          <Badge className={getStatusColor(discussion.status)} variant="secondary">
            {discussion.status.charAt(0).toUpperCase() + discussion.status.slice(1)}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {format(new Date(discussion.scheduledAt), "PPP")}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {format(new Date(discussion.scheduledAt), "p")}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {discussion.participants.length}/{discussion.maxParticipants} participants
          </div>
        </div>

        {discussion.rules && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">Discussion Rules:</p>
            <p className="text-sm text-slate-500">{discussion.rules}</p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {isCreator && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(discussion)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete?.(discussion.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </>
            )}
          </div>
          <Button
            onClick={() => onJoin(discussion)}
            disabled={discussion.status === "ended" || discussion.participants.length >= discussion.maxParticipants}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          >
            Join Discussion
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}