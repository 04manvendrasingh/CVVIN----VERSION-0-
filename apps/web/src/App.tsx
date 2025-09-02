"use client"

import type React from "react"

import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { Navbar } from "@components/Navbar"
import AuthPage from "@pages/auth/AuthPage"
import ProfileSetup from "@pages/profile/ProfileSetup"
import ProfilePage from "@pages/profile/ProfilePage"
import Dashboard from "@pages/dashboard/Dashboard"
import Analyze from "@pages/analyze/Analyze"
import Tech from "@pages/tech/Tech"
import HR from "@pages/hr/HR"
import Feedback from "@pages/feedback/Feedback"
import MockFull from "@pages/mock/MockFull"
import { useAuth } from "@state/auth"

export default function App() {
  const location = useLocation()
  const { user } = useAuth()

  // Hide navbar on auth
  const showNav = !location.pathname.startsWith("/auth")

  return (
    <div>
      {showNav && <Navbar />}
      <main className="container" style={{ paddingTop: showNav ? 24 : 0, paddingBottom: 40 }}>
        <Routes>
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/auth"} />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/profile/setup"
            element={
              <RequireAuth>
                <ProfileSetup />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/analyze"
            element={
              <RequireAuth>
                <Analyze />
              </RequireAuth>
            }
          />
          <Route
            path="/tech"
            element={
              <RequireAuth>
                <Tech />
              </RequireAuth>
            }
          />
          <Route
            path="/hr"
            element={
              <RequireAuth>
                <HR />
              </RequireAuth>
            }
          />
          <Route
            path="/feedback"
            element={
              <RequireAuth>
                <Feedback />
              </RequireAuth>
            }
          />
          <Route
            path="/mock/full"
            element={
              <RequireAuth>
                <MockFull />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/auth" replace />
}
