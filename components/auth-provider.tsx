"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db, googleProvider } from "@/lib/firebase"

type User = {
  id: string
  name: string
  email: string
  avatar: string
  role: string // Changed from optional to required
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  canCreateMeeting: boolean // Add this new property
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Convert Firebase user to our User type
  const formatUser = async (firebaseUser: FirebaseUser): Promise<User> => {
    const token = await firebaseUser.getIdToken()
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
    const userData = userDoc.data()
    
    const role = userData?.role || userData?.preferredRole || ""
    if (role && typeof window !== "undefined") {
      localStorage.setItem("speakspace_user_role", role)
    }
    return {
      id: firebaseUser.uid,
      name: userData?.name || firebaseUser.displayName || "User",
      email: firebaseUser.email || "",
      avatar: userData?.avatar || firebaseUser.photoURL || `/placeholder.svg?height=200&width=200&text=${(userData?.name || firebaseUser.displayName || "U")[0]}`,
      role,
    }
  }

  // Check if user is logged in on mount
  useEffect(() => {
    // Safety timeout — if Firebase doesn't respond in 8s, stop loading
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 8000)

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout)
      setIsLoading(true)
      try {
        if (firebaseUser) {
          const formattedUser = await formatUser(firebaseUser)
          setUser(formattedUser)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Authentication error:", error)
      } finally {
        setIsLoading(false)
      }
    })

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const formattedUser = await formatUser(userCredential.user)
      setUser(formattedUser)
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)
    try {
      const userCredential = await signInWithPopup(auth, googleProvider)
      const formattedUser = await formatUser(userCredential.user)
      
      // Check if this is a new user
      const userDoc = await getDoc(doc(db, "users", formattedUser.id))
      
      if (!userDoc.exists()) {
        // Create user document in Firestore
        await setDoc(doc(db, "users", formattedUser.id), {
          name: formattedUser.name,
          email: formattedUser.email,
          avatar: formattedUser.avatar,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        })
      } else {
        // Update last login
        await setDoc(doc(db, "users", formattedUser.id), {
          lastLogin: serverTimestamp()
        }, { merge: true })
      }
      
      setUser(formattedUser)
      router.push("/dashboard")
    } catch (error) {
      console.error("Google login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      
      await setDoc(doc(db, "users", firebaseUser.uid), {
        name,
        email,
        avatar: `/placeholder.svg?height=200&width=200&text=${name.split(" ").map((n) => n[0]).join("")}`,
        role: 'participant', // Set default role
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      })
      
      const formattedUser = await formatUser(firebaseUser)
      setUser(formattedUser)
      router.push("/dashboard")
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,
        canCreateMeeting: user?.role === 'moderator' // Add this line
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
