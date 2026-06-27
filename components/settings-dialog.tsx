"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, LogOut, Moon, Sun } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function SettingsDialog() {
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [colorTheme, setColorTheme] = useState("blue")

  const handleColorThemeChange = (value: string) => {
    setColorTheme(value)
    // In a real app, this would update the theme colors in the CSS variables
    document.documentElement.style.setProperty("--theme-primary", value)
    localStorage.setItem("speakspace_color_theme", value)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="mr-2" aria-label="Settings">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Customize your SpeakSpace experience</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="appearance" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          <TabsContent value="appearance" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <h4 className="mb-3 text-sm font-medium">Theme</h4>
                <div className="flex items-center space-x-4">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                  >
                    System
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-medium">Color Palette</h4>
                <RadioGroup
                  defaultValue={colorTheme}
                  onValueChange={handleColorThemeChange}
                  className="flex flex-wrap gap-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="blue" id="blue" className="border-blue-600" />
                    <Label htmlFor="blue" className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                      Blue
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="purple" id="purple" className="border-purple-600" />
                    <Label htmlFor="purple" className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                      Purple
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="green" id="green" className="border-green-600" />
                    <Label htmlFor="green" className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-green-600"></div>
                      Green
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="amber" id="amber" className="border-amber-600" />
                    <Label htmlFor="amber" className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-amber-600"></div>
                      Amber
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="availability" className="py-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Your Availability</h4>
              <p className="text-sm text-slate-500">
                Set times when you're available to moderate or evaluate sessions.
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-7 gap-2 text-center text-xs">
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                  <div>Sun</div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="space-y-2">
                      <TimeSlot time="Morning" />
                      <TimeSlot time="Afternoon" />
                      <TimeSlot time="Evening" />
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full mt-4">Save Availability</Button>
            </div>
          </TabsContent>
          <TabsContent value="account" className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Account Settings</h4>
                <p className="text-sm text-slate-500">Manage your account preferences and security.</p>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Notification Preferences
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Privacy Settings
                </Button>
              </div>

              <div className="pt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will need to sign in again to access your account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={logout}>Sign Out</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TimeSlot({ time }: { time: string }) {
  const [isAvailable, setIsAvailable] = useState(false)

  return (
    <div
      className={`p-1 text-center text-xs rounded cursor-pointer border ${
        isAvailable ? "bg-green-100 border-green-300 text-green-800" : "bg-slate-100 border-slate-200 text-slate-500"
      }`}
      onClick={() => setIsAvailable(!isAvailable)}
    >
      {time.charAt(0)}
    </div>
  )
}
