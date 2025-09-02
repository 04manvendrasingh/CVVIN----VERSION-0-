"use client"

import { useEffect, useState } from "react"

type User = {
  id: string
  email: string
  name?: string
  hasProfile?: boolean
  photoUrl?: string
}

const LS_KEY = "cvvin_user"

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(u: User | null) {
  if (!u) localStorage.removeItem(LS_KEY)
  else localStorage.setItem(LS_KEY, JSON.stringify(u))
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    setUser(getStoredUser())
  }, [])
  function loginWithEmail(email: string) {
    const u: User = { id: crypto.randomUUID(), email, hasProfile: false }
    setStoredUser(u)
    setUser(u)
    return u
  }
  function mockGoogle() {
    const u: User = { id: crypto.randomUUID(), email: "mockuser@gmail.com", name: "Mock User", hasProfile: false }
    setStoredUser(u)
    setUser(u)
    return u
  }
  function logout() {
    setStoredUser(null)
    setUser(null)
  }
  function markHasProfile(v: boolean) {
    if (!user) return
    const u = { ...user, hasProfile: v }
    setStoredUser(u)
    setUser(u)
  }
  function updateUser(patch: Partial<User>) {
    if (!user) return
    const u = { ...user, ...patch }
    setStoredUser(u)
    setUser(u)
  }
  return { user, loginWithEmail, mockGoogle, logout, markHasProfile, updateUser }
}
