"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mic, User, Users } from "lucide-react"
import Link from "next/link"

type Role = "moderator" | "participant" | "evaluator"

export function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RoleCard
          title="Moderator"
          description="Manage the flow of the discussion, set topics, and ensure timekeeping"
          icon={<Mic className="h-8 w-8 text-blue-600" />}
          isSelected={selectedRole === "moderator"}
          onSelect={() => handleRoleSelect("moderator")}
        />
        <RoleCard
          title="Participant"
          description="Engage actively in the discussion or mock interview"
          icon={<User className="h-8 w-8 text-indigo-600" />}
          isSelected={selectedRole === "participant"}
          onSelect={() => handleRoleSelect("participant")}
        />
        <RoleCard
          title="Evaluator"
          description="Observe and provide feedback on participants' performance"
          icon={<Users className="h-8 w-8 text-purple-600" />}
          isSelected={selectedRole === "evaluator"}
          onSelect={() => handleRoleSelect("evaluator")}
        />
      </div>

      {selectedRole && (
        <div className="flex justify-center mt-8">
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all hover:shadow-lg"
            size="lg"
            asChild
          >
            <Link href="/session">Continue as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

function RoleCard({
  title,
  description,
  icon,
  isSelected,
  onSelect,
}: {
  title: string
  description: string
  icon: React.ReactNode
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <Card
      className={`relative cursor-pointer border-2 transition-all ${
        isSelected ? "border-blue-500 shadow-md bg-blue-50" : "border-transparent hover:border-blue-200 hover:shadow-sm"
      }`}
      onClick={onSelect}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <CheckCircle className="h-5 w-5 text-blue-600" />
        </div>
      )}
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="p-3 rounded-full bg-slate-100 mb-4">{icon}</div>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </CardContent>
    </Card>
  )
}
