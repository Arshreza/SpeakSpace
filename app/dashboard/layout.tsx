import type React from "react"
import { AuthWall } from "@/components/auth-wall"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthWall>{children}</AuthWall>
}
