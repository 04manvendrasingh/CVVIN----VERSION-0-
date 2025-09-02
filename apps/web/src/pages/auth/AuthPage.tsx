"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@state/auth"

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { loginWithEmail, mockGoogle, user } = useAuth()
  const nav = useNavigate()

  function onSuccessFirstStep(u: any) {
    if (!u?.hasProfile) nav("/profile/setup")
    else nav("/dashboard")
  }

  return (
    <div className="container" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <div className="card" style={{ width: "100%", maxWidth: 520, padding: 24 }}>
        <div className="stack" style={{ alignItems: "center", textAlign: "center" }}>
          <div className="badge">CVVIN</div>
          <h1 style={{ margin: 0 }}>Welcome</h1>
          <p className="text-muted" style={{ marginTop: -6 }}>
            Log in or create your account
          </p>
        </div>
        <div className="tabs" style={{ marginTop: 16 }}>
          <button className={`tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>
            Log in
          </button>
          <button className={`tab ${tab === "signup" ? "active" : ""}`} onClick={() => setTab("signup")}>
            Sign up
          </button>
        </div>

        <form
          className="stack"
          style={{ marginTop: 16 }}
          onSubmit={(e) => {
            e.preventDefault()
            const u = loginWithEmail(email)
            onSuccessFirstStep(u)
          }}
        >
          <label>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Email</div>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Password</div>
            <input
              className="input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>
          <button className="btn btn-primary" type="submit">
            {tab === "signup" ? "Create account" : "Log in"}
          </button>
        </form>

        <div className="row" style={{ justifyContent: "center", marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={() => onSuccessFirstStep(mockGoogle())}>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}
