"use client"

import { useEffect, useState } from "react"
import { API } from "@lib/api"

export default function HR() {
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const onVis = () => {
      API.proctorEvent({ session_id: sessionId || "local", type: document.hidden ? "tab_blur" : "tab_focus" }).catch(
        () => {},
      )
    }
    document.addEventListener("visibilitychange", onVis)
    navigator.mediaDevices
      ?.getUserMedia?.({ video: true })
      .then(() => {
        API.proctorEvent({ session_id: sessionId || "local", type: "webcam_on" }).catch(() => {})
      })
      .catch(() => {
        API.proctorEvent({ session_id: sessionId || "local", type: "webcam_off" }).catch(() => {})
      })
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [sessionId])

  return (
    <div className="stack" style={{ gap: 16 }}>
      <h2>HR Round</h2>
      <div className="row" style={{ gap: 12 }}>
        <button
          className="btn btn-primary"
          onClick={async () => {
            const r = await API.sessionCreate("hr")
            setSessionId(r.session_id)
          }}
        >
          Start HR session
        </button>
        {sessionId && <span className="badge">Session: {sessionId}</span>}
      </div>

      <section className="card" style={{ padding: 16 }}>
        <h3>Ask question</h3>
        <p className="text-muted">We’ll wire questions and transcript metrics next step.</p>
      </section>
    </div>
  )
}
