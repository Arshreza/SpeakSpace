import type React from "react"
import { AuthWall } from "@/components/auth-wall"

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthWall>{children}</AuthWall>
}
